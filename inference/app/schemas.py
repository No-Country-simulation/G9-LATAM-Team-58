from typing import Literal

from pydantic import BaseModel

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
    keywords: list[str]
    explanation: list[str]
    embedding: list[float]
    cluster_id: int
    x: float
    y: float


class EmbedResponse(BaseModel):
    embedding: list[float]


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
    categories: list[str]
    metrics: ModelMetrics