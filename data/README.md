# data/

Construcción del corpus: extracción, limpieza y etiquetado. No se despliega.

## Consume

- Fuentes públicas: Kaggle (arXiv `cs.*` + Medium Articles) para train en inglés;
  scraping propio (dev.to ES, Wikipedia ES, freeCodeCamp) para test en español.

## Expone

- `processed/train_corpus.jsonl` y `processed/test_corpus_es.jsonl`, subidos al
  bucket de Object Storage (no se commitean).
- Esquema por línea (JSONL), nombres de campo en inglés:

  ```json
  {"id":"...","title":"...","body":"...","category":"...","source":"...","url":"...","language":"es"}
  ```

## Fronteras

- Categoría: una de las 8 (ver `docs/TECHMIND.md`). Rúbrica de etiquetado escrita
  antes de etiquetar. JSONL, no CSV.
