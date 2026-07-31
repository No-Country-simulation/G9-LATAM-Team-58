import os
from contextlib import asynccontextmanager

import joblib
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

APP_STATE = {
    "model_loaded": False,
    "meta": None,
    "kmeans": None,
    "umap": None
}

 
@asynccontextmanager
# Initialize joblib when service is up in an async way
async def lifespan(app: FastAPI):

    artifact = load_model()

    APP_STATE["model"] = artifact
    APP_STATE["encoder"] = SentenceTransformer(artifact["meta"]["embedding_model"])
    APP_STATE["metadata"] = artifact.get("metadata")
    APP_STATE["kmeans"] = artifact.get("kmeans")
    APP_STATE["umap"] = artifact.get("umap")
    APP_STATE["model_loaded"] = True

    yield

    APP_STATE.clear()


app = FastAPI(title = "TechMind Inference Service", lifespan = lifespan)


@app.get("/health", response_model = HealthResponse)
async def health_check():
    charged_model = APP_STATE.get("model_loaded", False)

    return {
        "status": "ok" if charged_model else "error",
        "model_loaded": charged_model,
        "version": "v1"
    }

@app.get("/model/info", response_model = ModelInfoResponse)
async def get_model_info():

    if not APP_STATE["model_loaded"]:
        raise HTTPException(status_code = 503, detail = "Model Not Found")

    return APP_STATE["meta"]


@app.post("/predict", response_model = PredictResponse)
async def predict(request: PredictRequest):

    if APP_STATE["model_loaded"]:
        model = APP_STATE["model"]
        encoder = APP_STATE["encoder"]
        category = model["label_encoder"].inverse_transform(model["classifier"].predict([vector]))[0]
        explanation = _get_explanation(request.text, category, model["baseline_vectorizer"], model["baseline_classifier"])
        vector = encoder.encode([f"passage: {request.text}"], normalize_embeddings=True)
        probability = model["classifier"].predict_proba([vector]).max()
        keywords = _top_terms(model["keyword_vectorizer"], request.text)
        cluster = int(model["kmeans"].predict([vector])[0])       
        x, y = model["umap_reducer"].transform([vector])[0] 
    else:
        cluster = 0 
        x = 0.0
        y = 0.0

    return {
        "category": category,
        "probability": probability,
        "keywords": keywords,
        "explanation": explanation,
        "embedding": vector,
        "cluster_id": cluster,
        "x": float(x),
        "y": float(y)
    }

@app.post("/embed", response_model = EmbedResponse)
async def embed(request: EmbedRequest):

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