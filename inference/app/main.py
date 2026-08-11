from contextlib import asynccontextmanager

import numpy as np
from fastapi import FastAPI, HTTPException
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import normalize

from app.oci_client import load_model
from app.schemas import (
    EmbedRequest,
    EmbedResponse,
    HealthResponse,
    ModelInfoResponse,
    PredictRequest,
    PredictResponse,
)


def _initial_state() -> dict:
    """The state of a service that has not loaded the artifact yet.

    Shutdown resets to this instead of emptying the dict: every guard reads
    APP_STATE["model_loaded"], and a cleared dict would make them raise KeyError
    (a 500) where the honest answer is 503.
    """
    return {
        "model_loaded": False,
        "meta": None
    }


APP_STATE = _initial_state()

@asynccontextmanager
async def lifespan(app: FastAPI):

    artifact = load_model()
    assert artifact["classifier"].n_features_in_ == artifact["meta"]["feature_dim"]

    APP_STATE["model"] = artifact
    APP_STATE["encoder"] = SentenceTransformer(artifact["meta"]["embedding_model"])
    APP_STATE["meta"] = artifact["meta"]
    APP_STATE["model_loaded"] = True

    _warm_up()

    yield

    APP_STATE.clear()
    APP_STATE.update(_initial_state())


def _warm_up() -> None:
    """Run one throwaway inference so the first real request is not the one that
    pays for lazy initialization.

    The transformer defers building its graph until the first encode, and UMAP
    likewise on the first transform -- together that is several seconds. The
    Cloudflare Free plan drops the connection at 100s, so a cold /predict right
    after a container restart can surface as a 524 to the user.

    Best effort on purpose: a failure here must not stop a service whose model
    already loaded and validated above.
    """
    try:
        model = APP_STATE["model"]
        vector = APP_STATE["encoder"].encode(["passage: warm up"], normalize_embeddings=True)
        model["classifier"].predict_proba(build_features(vector, "warm up", model))
        model["kmeans"].predict(vector)
        model["umap_reducer"].transform(vector)
    except Exception as error:  # noqa: BLE001 -- see docstring: best effort by design
        print(f"Warm-up falló, el servicio sigue arriba: {error}")


app = FastAPI(title = "TechMind Inference Service", lifespan = lifespan)


@app.get("/health", response_model = HealthResponse)
async def health_check():
    charged_model = APP_STATE.get("model_loaded", False)

    # Report the artifact's own version, not a literal: /health is how the API
    # and the deploy smoke test tell which model the container is actually
    # serving. A hardcoded "v1" would keep saying v1 after a v2 rollout.
    meta = APP_STATE.get("meta")

    return {
        "status": "ok" if charged_model else "error",
        "model_loaded": charged_model,
        "version": meta["version"] if meta else None
    }

@app.get("/model/info", response_model = ModelInfoResponse)
async def get_model_info():

    if not APP_STATE["model_loaded"]:
        raise HTTPException(status_code = 503, detail = "Model Not Found")

    return APP_STATE["meta"]


@app.post("/predict", response_model = PredictResponse)
async def predict(request: PredictRequest):

    if not APP_STATE["model_loaded"]:
        raise HTTPException(status_code = 503, detail = "Model Not Found")

    model = APP_STATE["model"]
    encoder = APP_STATE["encoder"]

    vector = encoder.encode([f"passage: {request.text}"], normalize_embeddings=True)
    features = build_features(vector, request.text, model)

    probabilities = model["classifier"].predict_proba(features)[0]
    best = int(probabilities.argmax())
    category = model["label_encoder"].classes_[best]
    probability = float(probabilities[best])

    explanation = _get_explanation(request.text, best, model["baseline_vectorizer"], model["baseline_classifier"])
    keywords = _top_terms(model["keyword_vectorizer"], request.text)
    cluster = int(model["kmeans"].predict(vector)[0])
    x, y = model["umap_reducer"].transform(vector)[0]

    return {
        "category": category,
        "probability": probability,
        "keywords": keywords,
        "explanation": explanation,
        "embedding": vector[0].tolist(),
        "cluster_id": cluster,
        "x": float(x),
        "y": float(y)
    }

@app.post("/embed", response_model = EmbedResponse)
async def embed(request: EmbedRequest):

    # Same guard as /predict and /model/info. Without it a call before the
    # artifact is loaded raises KeyError on APP_STATE["encoder"] and surfaces as
    # a 500, hiding a plain "not ready yet" behind a server error.
    if not APP_STATE["model_loaded"]:
        raise HTTPException(status_code = 503, detail = "Model Not Found")

    formatted_text = f"{request.type}: {request.text}"
    vector = APP_STATE["encoder"].encode(formatted_text, normalize_embeddings=True)

    return {
        "embedding": vector.tolist()
    }

def _top_terms(vectorizer, text):

    n = 5
    matrix = vectorizer.transform([text]).toarray()[0]
    keywords = vectorizer.get_feature_names_out()

    index_sorted = matrix.argsort()[::-1]

    results = []
    for i in index_sorted[:n]:
        if matrix[i] > 0:
            results.append(keywords[i])
            
    return results


def build_features(embedding: np.ndarray, text: str, model: dict) -> np.ndarray:
    svd = model.get("svd")

    if svd is None:
        return embedding.reshape(1, -1)
    
    tfidf = model["baseline_vectorizer"]
    reduced = normalize(svd.transform(tfidf.transform([text])))

    return np.hstack([embedding.reshape(1, -1), reduced])


def _get_explanation(text: str, class_idx: int, vectorizer, classifier, top_n=5):

    matrix = vectorizer.transform([text]).toarray()[0]
    coef = classifier.coef_[class_idx]
    
    weights = matrix * coef
    words = vectorizer.get_feature_names_out()
    
    index_sorted = weights.argsort()[::-1]
    
    results = []
    for i in index_sorted[:top_n]:
        if weights[i] > 0:
            results.append(words[i])
    return results