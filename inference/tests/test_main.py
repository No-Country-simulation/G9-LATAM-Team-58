"""Smoke tests for the inference service. While the endpoints return mocked
data, these assert the response SHAPE -- so when the real model lands, a
contract break shows up here instead of downstream in the API."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is True


def test_model_info():
    res = client.get("/model/info")
    assert res.status_code == 200
    body = res.json()
    assert body["embedding_model"] == "intfloat/multilingual-e5-small"
    assert body["dim"] == 384
    # Single-label, 8 categories -- see docs/TECHMIND.md.
    assert len(body["categories"]) == 8


def test_predict_shape():
    res = client.post("/predict", json={"text": "spring boot rest api"})
    assert res.status_code == 200
    body = res.json()
    assert "category" in body
    assert isinstance(body["keywords"], list)
    # Embedding must be the full 384-dim vector, not a truncated mock.
    assert len(body["embedding"]) == 384


def test_embed_dim():
    res = client.post("/embed", json={"text": "hola", "type": "query"})
    assert res.status_code == 200
    assert len(res.json()["embedding"]) == 384


def test_embed_rejects_bad_type():
    # type is Literal["query", "passage"]; anything else is a 422.
    res = client.post("/embed", json={"text": "hola", "type": "documento"})
    assert res.status_code == 422
