# Inference service. Built natively on the ARM VM (linux/arm64); an x86 image
# fails there with `exec format error`.
# The notebook trains on Python 3.13 (Colab, 3.13.15 as of 2026-08). The numba
# Dispatchers that UMAP pickles inside model.joblib carry raw CPython bytecode,
# so the interpreter here must match the one that trained the artifact: under an
# older CPython they fail to deserialize with `IndexError: pop from empty list`
# in numba.core.byteflow. This bit us at 3.11, and again at 3.12 in August 2026
# when the artifact moved to 3.13 -- verified 3.13 loads it, 3.12 does not.
# Bump this line whenever Colab's Python moves, together with numba in
# requirements.txt. A mismatch is not a warning: the container never becomes
# healthy and takes api + web down with it.
FROM python:3.13-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HF_HOME=/app/.cache/huggingface

COPY requirements.txt .

# On aarch64 there are no CUDA wheels, so the default index already resolves to
# the CPU build of torch. On x86 (local dev, GitHub runners) the default index
# resolves to the CUDA build instead, pulling ~2GB of unused CUDA packages — so
# torch is installed explicitly from the CPU wheel index first.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

RUN python -c "from sentence_transformers import SentenceTransformer; \
    SentenceTransformer('intfloat/multilingual-e5-small')"

COPY app ./app

EXPOSE 8000

# No curl in the slim image; urllib keeps the layer small.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health').status==200 else 1)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
