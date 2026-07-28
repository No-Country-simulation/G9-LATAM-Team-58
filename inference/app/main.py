import os
import oci
import oracledb
import joblib
from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from app.oci_client import download_oci_model
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

    download_oci_model()

    # Mock from OCI Object Storage
    model_path = "model.joblib"

    if os.path.exists(model_path):
        # Upload serialized dic
        artifact = joblib.load(model_path)

        APP_STATE["metadata"] = artifact.get("metadata")
        APP_STATE["kmeans"] = artifact.get("kmeans")
        APP_STATE["umap"] = artifact.get("umap")
        APP_STATE["model_loaded"] = True

        yield

        APP_STATE.clear()


app = FastAPI(title = "TechMind Inference Service", lifespan = lifespan)


@app.get("/health", response_model = HealthResponse)
async def health_check():

    return {
        "status": "ok",
        "model_loaded": True,
        "version": "v1"
    }

@app.get("/model/info", response_model = ModelInfoResponse)
async def get_model_info():

    if not APP_STATE["model_loaded"]:
        raise HTTPException(status_code = 503, detail = "Model Not Found")

    return APP_STATE["meta"]


@app.post("/predict", response_model = PredictResponse)
async def predict(request: PredictRequest):

    # Embeddings mock
    vector = [[0.021, -0.118, 0.0]]

    if APP_STATE["model_loaded"]:
        cluster = int(APP_STATE["kmeans"].predict(vector[0]))
        proyeccion = APP_STATE["umap"].transform(vector)[0]
        x, y = float(proyeccion[0]), float(proyeccion[1])
    else:
        cluster = 0 
        x = 0.0
        y = 0.0

    return {
        "category": "Backend",
        "probability": 0.89,
        "keywords": ["java", "spring", "rest"],
        "explanation": ["spring", "rest", "endpoint"],
        "embedding": vector[0],
        "cluster_id": cluster,
        "x": x,
        "y": y
    }

@app.post("/embed", response_model = EmbedResponse)
async def embed(request: EmbedRequest):

    # Embeddings mock - 384 dim
    mock_embedding = [0.021, -0.118] + [0.0] * 382
    
    return {
        "embedding": mock_embedding
    }