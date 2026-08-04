# Inference service. Built natively on the ARM VM (linux/arm64); an x86 image
# fails there with `exec format error`.
# El notebook entrena en Python 3.12 (Colab). Los Dispatcher de numba que UMAP
# pickla dentro de model.joblib son sensibles al bytecode exacto de CPython:
# con 3.11 no deserializan (IndexError en numba.core.byteflow).
FROM python:3.12-slim

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
