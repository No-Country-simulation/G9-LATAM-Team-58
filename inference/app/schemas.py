from pydantic import BaseModel
from typing import List, Literal

# Inputs - Request

class PredictRequest(BaseModel):
    text: str

class EmbedRequest(BaseModel):
    text: str
    type: Literal["query", "passage"]

# Outputs - Response

class PredictResponse(BaseModel):
    category: str
    probability: float
    keywords: List[str]
    explanation: List[str]
    embedding: List[float]
    cluster_id: int
    x: float
    y: float


class EmbedResponse(BaseModel):
    embedding: List[float]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str


class ModelMetrics(BaseModel):
    embedding_macro_f1_es: float
    tfidf_macro_f1_es: float


class ModelInfoResponse(BaseModel):
    version: str
    embedding_model: str
    dim: int
    categories: List[str]
    metrics: ModelMetrics