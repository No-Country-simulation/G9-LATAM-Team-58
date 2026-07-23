from fastapi import FastAPI

from app.schemas import (
    EmbedRequest,
    EmbedResponse,
    HealthResponse,
    ModelInfoResponse,
    PredictRequest,
    PredictResponse,
)

app = FastAPI(title = "TechMind Inference Service")

APP_STATE = {
    "model_loaded": True
}

@app.get("/health", response_model = HealthResponse)
async def health_check():

    return {
        "status": "ok",
        "model_loaded": True,
        "version": "v1"
    }

@app.get("/model/info", response_model = ModelInfoResponse)
async def get_model_info():

    return{
        "version": "v1",
        "embedding_model": "intfloat/multilingual-e5-small",
        "dim": 384,
        "categories": ["Backend", "Frontend", "Móvil", "Datos e IA", "DevOps y Cloud", "Bases de datos", "Seguridad", "Fundamentos"],
        "metrics": { 
            "embedding_macro_f1_es": 0.0, 
            "tfidf_macro_f1_es": 0.0 
        }
    }

@app.post("/predict", response_model = PredictResponse)
async def predict(request: PredictRequest):

    # Embeddings mock - 384 dim
    embedding_mock = [0.021, -0.118] + [0.0] * 382

    return {
        "category": "Backend",
        "probability": 0.89,
        "keywords": ["java", "spring", "rest"],
        "explanation": ["spring", "rest", "endpoint"],
        "embedding": embedding_mock,
        "cluster_id": 3,
        "x": 4.21,
        "y": -1.07
    }

@app.post("/embed", response_model = EmbedResponse)
async def embed(request: EmbedRequest):

    # Embeddings mock - 384 dim
    mock_embedding = [0.021, -0.118] + [0.0] * 382
    
    return {
        "embedding": mock_embedding
    }