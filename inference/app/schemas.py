from typing import Literal

from pydantic import BaseModel


class PredictRequest(BaseModel):
    text: str

class EmbedRequest(BaseModel):
    text: str
    type: Literal["query", "passage"]


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
    embedding_macro_f1_en: float | None
    embedding_macro_f1_es: float | None
    tfidf_macro_f1_en: float | None
    tfidf_macro_f1_es: float | None
    embedding_macro_f1_es_reliable: float | None
    es_reliable_categories: int
    es_min_support: int


class ModelInfoResponse(BaseModel):
    version: str
    embedding_model: str
    dim: int
    feature_dim: int
    svd_components: int
    classifier_c: float
    doc_prefix: str
    query_prefix: str
    categories: list[str]
    n_clusters: int
    terms_by_category: dict[str, list[str]]
    metrics: ModelMetrics
    train_size: int