# Inference service. Built natively on the ARM VM (linux/arm64) -- see
# docs/OCI-setup.md section 4. An x86 image fails there with `exec format error`.
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HF_HOME=/app/.cache/huggingface

COPY requirements.txt .

# On aarch64 there are no CUDA wheels, so the default index already resolves to
# the CPU build of torch. The `--index-url .../whl/cpu` rule from CLAUDE.md
# matters when building on x86 (local dev, GitHub runners), not here.
RUN pip install --no-cache-dir -r requirements.txt

# ---------------------------------------------------------------------------
# TODO (when the real model lands): bake the transformer into the image so the
# container starts offline. The E5 weights are NOT inside model.joblib -- only
# its name is. Add this once sentence-transformers is in requirements.txt:
#
#   RUN python -c "from sentence_transformers import SentenceTransformer; \
#       SentenceTransformer('intfloat/multilingual-e5-small')"
#
# model.joblib itself is downloaded at startup from the techmind-data bucket
# via Instance Principal (docs/OCI-setup.md section 5). It is never baked in and
# never committed.
# ---------------------------------------------------------------------------

COPY app ./app

EXPOSE 8000

# No curl in the slim image; urllib keeps the layer small.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health').status==200 else 1)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
