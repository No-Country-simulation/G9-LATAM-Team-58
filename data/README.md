# data/

Construcción del corpus de Mindloom: extracción, limpieza y etiquetado. No se
despliega.

Notebook de entrega: [`TechMind_01_EDA_ETL.ipynb`](TechMind_01_EDA_ETL.ipynb).

## Requisitos

- Python, ejecutado en Google Colab.
- Credenciales de Kaggle, en Colab Secrets — el notebook de EDA/ETL no lee
  ningún `.env`.

## Uso

Abrir el notebook de entrega en Colab y ejecutarlo de arriba a abajo. Sube los
tres ficheros de `processed/` al bucket de Object Storage.

Cargar ese corpus en la base de datos es un paso aparte, con otro ciclo de vida
y otras credenciales: ver [`scripts/`](../scripts/README.md).

## Fuentes

- **Kaggle StackSample** (`stackoverflow/stacksample`) — preguntas de Stack Overflow
  en inglés, etiquetadas por votación ponderada de tags.
- **API de Dev.to** — artículos técnicos en inglés y en español. Es el registro que
  más se parece al contenido que Mindloom indexa.
- **Volcados de Stack Exchange** (archive.org) — `es.stackoverflow.com` aporta
  español; `security`, `dba` y `softwareengineering` aportan las categorías con
  menos muestra, con el sitio como etiqueta.

## Expone

- Tres ficheros, versionados en `data/processed/` y subidos también al bucket de
  Object Storage:

  | Fichero | Para qué |
  |---|---|
  | `processed/train_corpus.jsonl` | entrenamiento |
  | `processed/test_corpus.jsonl` | evaluación en inglés |
  | `processed/test_corpus_es.jsonl` | evaluación en español (transferencia cross-lingual) |

  Son la excepción a la regla de no commitear datasets, declarada en
  `data/.gitignore`: entran al repo para que las métricas del entrenamiento se
  puedan reproducir sin credenciales del bucket. Cualquier otro `.jsonl` sigue
  ignorado.

- Esquema por línea (JSONL), nombres de campo en inglés:

  ```json
  {"id":"...","title":"...","body":"...","category":"...","source":"...","url":"...","language":"es"}
  ```

- Cada línea lleva además `quality` (score o reacciones del documento de origen). Es
  un campo **interno del ETL**: alimenta el muestreo ponderado del balanceo y no se
  persiste en la tabla `contents`.

## Contratos y fronteras

- Categoría: **una sola** de las 8 — Backend · Frontend · Móvil · Datos e IA ·
  DevOps y Cloud · Bases de datos · Seguridad · Fundamentos. La rúbrica de etiquetado
  vive en el propio notebook, en `CATEGORY_TAGS`. JSONL, no CSV.
- **Los siete campos del esquema son obligatorios, incluidos `source` y `language`.**
  No son decorativos: son columnas de la tabla `contents` en la Autonomous Database,
  y el corpus es la única fuente que puede emitirlos.
- `random_state=42` en cada muestreo y en el split estratificado.

---
← [README principal](../README.md) · [Cómo contribuir](../CONTRIBUTING.md)
