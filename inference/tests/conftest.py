import numpy as np
import pytest
import scipy.sparse
from fastapi.testclient import TestClient

from app.main import app


class _FakeVectorizer:
    def transform(self, texts):
        return scipy.sparse.csr_matrix(np.ones((len(texts), 3)))

    def get_feature_names_out(self):
        return np.array(["spring", "java", "rest"])


CATEGORIES = [
    "Backend", "Frontend", "Móvil", "Datos e IA", "DevOps y Cloud",
    "Bases de datos", "Seguridad", "Fundamentos",
]


class _FakeClassifier:
    classes_ = np.arange(len(CATEGORIES))
    coef_ = np.ones((len(CATEGORIES), 3))
    n_features_in_ = 387  

    def predict_proba(self, X):
        probs = np.full((1, len(CATEGORIES)), 0.1 / (len(CATEGORIES) - 1))
        probs[0, 0] = 0.9
        return probs


class _FakeLabelEncoder:
    classes_ = np.array(CATEGORIES)


class _FakeKMeans:
    def predict(self, X):
        return np.array([3])


class _FakeUMAP:
    def transform(self, X):
        return np.array([[4.2, -1.1]])


class _FakeSVD:
    def transform(self, X):
        return np.ones((X.shape[0], 3))


class _FakeEncoder:
    def encode(self, texts, normalize_embeddings=True):
        if isinstance(texts, list):
            return np.ones((len(texts), 384), dtype="float32")
        return np.ones(384, dtype="float32")


def _fake_artifact():
    return {
        "meta": {
            "version": "v1",
            "embedding_model": "intfloat/multilingual-e5-small",
            "dim": 384,
            "feature_dim": 387,
            "svd_components": 3,
            "classifier_c": 4.0,
            "doc_prefix": "passage: ",
            "query_prefix": "query: ",
            "categories": CATEGORIES,
            "n_clusters": 8,
            "terms_by_category": {"Backend": ["spring"]},
            "metrics": {
                "embedding_macro_f1_en": None,
                "embedding_macro_f1_es": 0.8,
                "tfidf_macro_f1_en": None,
                "tfidf_macro_f1_es": 0.7,
                "embedding_macro_f1_es_reliable": 0.8,
                "es_reliable_categories": 2,
                "es_min_support": 30,
            },
            "train_size": 100,
        },
        "classifier": _FakeClassifier(),
        "svd": _FakeSVD(),
        "label_encoder": _FakeLabelEncoder(),
        "keyword_vectorizer": _FakeVectorizer(),
        "baseline_vectorizer": _FakeVectorizer(),
        "baseline_classifier": _FakeClassifier(),
        "kmeans": _FakeKMeans(),
        "umap_reducer": _FakeUMAP(),
    }


@pytest.fixture
def fake_artifact(monkeypatch):
    """Swap the real artifact and transformer for fakes, without starting the app.

    Split out of `client` so a test can drive startup/shutdown itself -- the
    state left behind after shutdown is part of the contract too.
    """
    monkeypatch.setattr("app.main.load_model", _fake_artifact)
    monkeypatch.setattr("app.main.SentenceTransformer", lambda name: _FakeEncoder())


@pytest.fixture
def client(fake_artifact):
    with TestClient(app) as c:
        yield c
