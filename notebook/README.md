# notebook/

Entrenamiento, evaluación y empaquetado del modelo de Mindloom; serializa los
artefactos. **No se despliega** (corre en Jupyter/Colab).

Notebook de entrega:
[`TechMind_02_Model_Training.ipynb`](TechMind_02_Model_Training.ipynb).

## Requisitos

- Python, ejecutado en Google Colab (o Jupyter local con GPU/CPU equivalente).
- Corpus `processed/*.jsonl` (train, test en inglés, test en español) ya
  publicado en el bucket de Object Storage por [`data/`](../data/).

## Uso

Abrir el notebook de entrega en Colab y ejecutarlo de arriba a abajo. Las
credenciales de Object Storage se leen de Colab Secrets, no de un `.env`.

## Configuración

`random_state=42` en cada split, modelo y llamada a UMAP — sin fijarlo, dos
ejecuciones del mismo código dan métricas distintas.

## Expone

Tres ficheros en `models/v{N}/` del bucket de Object Storage:

| Artefacto | Contiene | Quién lo usa |
|---|---|---|
| `model.joblib` | los modelos entrenados | `inference/`, al arrancar |
| `corpus_index.npz` | los vectores del corpus y sus metadatos | la carga inicial de la tabla `contents` |
| `latest.txt` | la versión activa | `inference/`, para saber qué descargar |

`corpus_index.npz` trae dos arrays: `embeddings` (`float32[N, 384]`, L2-normalizados)
y `metadata`, con una entrada por columna de la tabla `contents` — `id`, `title`,
`body`, `category`, `source`, `url`, `language`, `keywords`, `cluster`, `x`, `y`.
`body` viaja en el índice porque `contents.body` es `NOT NULL`, y `cluster` se llama
`cluster_id` en la base: `CLUSTER` es palabra reservada en Oracle.

Claves de `model.joblib`:

| Clave | Qué es |
|---|---|
| `meta` | versión, modelo de embeddings, `dim`, `feature_dim`, `svd_components`, prefijos E5, categorías, métricas |
| `classifier` | `LogisticRegression` sobre features híbridas → categoría |
| `svd` | `TruncatedSVD` que comprime el TF-IDF; `None` si está desactivado |
| `label_encoder` | `LabelEncoder` de las 8 categorías |
| `keyword_vectorizer` | `TfidfVectorizer` bilingüe, para las palabras clave |
| `baseline_vectorizer` | `TfidfVectorizer` del modelo explicable y entrada del SVD |
| `baseline_classifier` | `LogisticRegression` explicable, alimenta `explanation` |
| `kmeans` | asigna cluster a contenido **nuevo** |
| `umap_reducer` | proyecta contenido **nuevo** al mapa 2D (`x`, `y`) |

`kmeans` y `umap_reducer` son modelos **ajustados**, no arrays precalculados: por eso
`inference/` puede clusterizar y proyectar documentos nuevos en tiempo de request.

El puntero `latest.txt` se sube el último: si apuntara a una versión cuyos ficheros
aún se están subiendo, un servicio que arranque en ese intervalo cargaría algo que
todavía no existe.

## Contratos y fronteras

- Los vectores del corpus **no van dentro del `.joblib`**: viven en la base de datos,
  que es donde crece el contenido. El `.joblib` solo se regenera al reentrenar.
- El transformer tampoco viaja en el artefacto — solo su nombre. La imagen de
  `inference/` lo hornea al construirse.
- Prefijos E5 (`passage:` para contenido, `query:` para consultas), embeddings
  L2-normalizados float32, `random_state=42`, métrica macro-F1.

---
← [README principal](../README.md) · [Cómo contribuir](../CONTRIBUTING.md)
