"""Smoke tests for the inference service. The `client` fixture (conftest.py)
mocks the model artifact and encoder, so these assert the response SHAPE
against fake-but-contract-shaped data -- a contract break shows up here
instead of downstream in the API."""


import pytest
from fastapi.testclient import TestClient

from app.main import APP_STATE, app


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is True
    # Comes from the artifact's meta, not a literal: a v2 rollout must show v2.
    assert body["version"] == "v1"


def test_model_info(client):
    res = client.get("/model/info")
    assert res.status_code == 200
    body = res.json()
    assert body["embedding_model"] == "intfloat/multilingual-e5-small"
    assert body["dim"] == 384
    # Single-label, 8 categories
    assert len(body["categories"]) == 8


def test_predict_shape(client):
    res = client.post("/predict", json={"text": "spring boot rest api"})
    assert res.status_code == 200
    body = res.json()
    assert "category" in body
    assert isinstance(body["keywords"], list)
    assert len(body["embedding"]) == 384


def test_embed_dim(client):
    res = client.post("/embed", json={"text": "hola", "type": "query"})
    assert res.status_code == 200
    assert len(res.json()["embedding"]) == 384


def test_embed_rejects_bad_type(client):
    res = client.post("/embed", json={"text": "hola", "type": "documento"})
    assert res.status_code == 422


@pytest.fixture
def cold_client():
    """A client whose lifespan never ran, so the artifact is not loaded.

    Instantiating TestClient outside a `with` block skips startup on purpose --
    that is the state the container is in while it downloads the model from the
    bucket, and the state every guard below has to answer for.
    """
    return TestClient(app)


@pytest.mark.parametrize(
    ("method", "path", "payload"),
    [
        ("get", "/model/info", None),
        ("post", "/predict", {"text": "hola"}),
        ("post", "/embed", {"text": "hola", "type": "query"}),
    ],
)
def test_endpoints_answer_503_without_model(cold_client, method, path, payload):
    res = getattr(cold_client, method)(path, **({"json": payload} if payload else {}))
    assert res.status_code == 503


def test_health_answers_without_model(cold_client):
    # /health must never fail: it is what the deploy smoke test and the API's
    # own /health probe read to tell "still starting" from "broken".
    res = cold_client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "error"
    assert body["model_loaded"] is False
    assert body["version"] is None


def test_state_resets_after_shutdown(fake_artifact):
    with TestClient(app):
        assert APP_STATE["model_loaded"] is True

    # Reset, not emptied: the guards index this key directly.
    assert APP_STATE["model_loaded"] is False
