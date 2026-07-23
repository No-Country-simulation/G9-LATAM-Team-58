# notebook/

EDA, entrenamiento y evaluación del modelo; serializa el artefacto. **No se
despliega** (corre en Jupyter/Colab).

## Consume

- Corpus `processed/*.jsonl` (train/test) desde el bucket de Object Storage.

## Expone

- `model.joblib` → OCI Object Storage (`models/v{N}/model.joblib` + `latest.txt`).
  Claves del artefacto en `docs/TECHMIND.md` §4.2.

## Fronteras

- Único output es el `.joblib`; no forma parte del runtime.
- Prefijos E5 (`passage:`/`query:`), embeddings L2-normalizados float32,
  `random_state=42`, métrica macro-F1.
