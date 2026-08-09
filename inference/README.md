# inference/

Servicio de inferencia **sin estado** de Mindloom: embeddings y clasificación.
**No** toca la base de datos ni guarda el índice del corpus en memoria — el
ranking por similitud lo resuelve la Autonomous Database con `VECTOR_DISTANCE`,
orquestado por `api/`.

Importante mencionar que solo se comunica con el servicio `api/`, no realiza peticiones a `web/`.

## Contenido

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Pruebas](#pruebas)
- [Contratos y fronteras](#contratos-y-fronteras)
- [Referencia de la API](#referencia-de-la-api)
  - [`POST /predict`](#post-predict--clasificar-un-texto)
  - [`POST /embed`](#post-embed--vectorizar-una-consulta)
  - [`GET /health`](#get-health--estado)
  - [`GET /model/info`](#get-modelinfo--metadatos-del-modelo)
- [Notas y trampas](#notas-y-trampas)

## Requisitos

- Python 3.12
- Torch, en su build de CPU (ver
  [CONTRIBUTING.md](../CONTRIBUTING.md)).

## Instalación

```bash
cd inference
python -m venv .venv && source .venv/bin/activate # (Unix/Linux)
.venv\Scripts\activate # (Windows)
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

## Configuración

| Variable | Requerida | Para qué |
|---|---|---|
| `MODEL_BUCKET` | en producción | bucket de OCI Object Storage con `model.joblib` |
| `MODEL_LOCAL_PATH` | no | variable de entorno para ejecución local — ver abajo |

**Ejecución en local** Si `MODEL_LOCAL_PATH` apunta a un archivo existente (por
ejemplo `models/model.joblib`, copiado a mano y ya cubierto por `.gitignore`),
`load_model()` lo carga directo y **no** toca OCI — no hace falta
`~/.oci/config` para levantar el servicio en local. Sin la env var (o si el
archivo no existe), el servicio descarga el artefacto del bucket al arrancar.
Ver `.env.example`.

## Uso

```bash
uvicorn app.main:app --reload --env-file .env
```

Sirve en `http://localhost:8000`. Catálogo completo de rutas en
[Referencia de la API](#referencia-de-la-api).

## Pruebas

```bash
pip install -r requirements-dev.txt
pytest
```

`requirements-dev.txt` es solo para dev/CI — no se referencia ni utiliza en la imagen Docker
(`Dockerfile` instala únicamente `requirements.txt`).

## Contratos y fronteras

- **Contrato:** este servicio lo llama **solo la API** (`api/`), nunca
  la web. Por eso, **todo va en inglés** (paths, keys, valores) salvo los
  valores de categoría (`"Backend"`, `"Datos e IA"`…), que son las etiquetas
  del modelo.
- **Stateless:** no toca la base de datos y no mantiene ningún índice. Lo
  único que carga es el artefacto (modelo + tokenizer).
- Las claves de `model.joblib` y cómo se generan están en
  [`notebook/README.md`](../notebook/README.md). El transformer **no** va
  dentro del `.joblib` únicamente su nombre; la imagen Docker lo construye en tiempo
  de ejecución para que el contenedor arranque sin red.
- **No hay reentrenamiento.** El clasificador es una `LogisticRegression` y el
  artefacto se sustituye publicando una versión nueva en el bucket.
- **Errores (FastAPI):** validación de entrada → `422` con
  `{ "detail": [...] }`; errores controlados → `{ "detail": "mensaje" }` con
  el código HTTP correspondiente.

> El mapeo de qué ruta de la API llama a cuál de inference está en
> [`api/README.md`](../api/README.md) (sección "Orquestación"), que es quien
> orquesta.

## Referencia de la API

### `POST /predict` — clasificar un texto

**Recibe** (body):

```json
{ "text": "En este contenido se presentan los conceptos básicos de Spring Boot." }
```

| Campo | Tipo | Obligatorio |
|---|---|---|
| `text` | string | sí |

**Devuelve** `200 OK` — todo lo que la API necesita para persistir el contenido:

```json
{
  "category": "Backend",
  "probability": 0.89,
  "keywords": ["java", "spring", "rest"],
  "explanation": ["spring", "rest", "endpoint"],
  "embedding": [0.021, -0.118, "…384 floats…"],
  "cluster_id": 3,
  "x": 4.21,
  "y": -1.07
}
```

| Campo | Tipo | Qué es |
|---|---|---|
| `category` | string | una de las 8 categorías |
| `probability` | float 0–1 | confianza de la clase elegida |
| `keywords` | string[] | términos clave extraídos |
| `explanation` | string[] | términos con más peso en la decisión (explicabilidad) |
| `embedding` | float32[384] | vector L2-normalizado, listo para la columna `VECTOR` |
| `cluster_id` | int | cluster de KMeans (en `corpus_index.npz` la columna se llama `cluster`) |
| `x`, `y` | float | coordenadas UMAP, para el mapa del corpus |

> **¿Por qué devuelve el embedding?** `cluster_id`, `x` e `y` salen de `kmeans` y
> `umap_reducer`, que viven dentro del artefacto — la API Java no puede calcularlos.
> Si tuviera que pedir la clasificación aquí y el vector a `POST /embed`, estaría realizando
> **dos pasadas del encoder sobre el mismo texto**. Este
> endpoint resuelve el camino de indexación completo en una sola llamada.

Este endpoint aplica el prefijo `"passage: "`, siempre.

### `POST /embed` — vectorizar una consulta

Solo el vector. Lo usa `GET /search?mode=semantic` de la API, que después lanza el
`VECTOR_DISTANCE` contra la base.

**Recibe** (body):

```json
{ "text": "cómo validar entradas en Spring", "type": "query" }
```

| Campo | Tipo | Default | Qué hace |
|---|---|---|---|
| `text` | string | — (obligatorio) | texto a vectorizar |
| `type` | `"query"` \| `"passage"` | — (**obligatorio**) | qué prefijo E5 aplicar |

**Devuelve** `200 OK`:

```json
{ "embedding": [0.021, -0.118, "…384 floats…"] }
```

### `GET /health` — estado

**Recibe:** (sin parámetros).

**Devuelve** `200 OK`:

```json
{ "status": "ok", "model_loaded": true, "version": "v1" }
```

### `GET /model/info` — metadatos del modelo

**Recibe:** (sin parámetros).

**Devuelve** `200 OK` — datos del artefacto cargado:

```json
{
  "version": "v1",
  "embedding_model": "intfloat/multilingual-e5-small",
  "dim": 384,
  "feature_dim": 884,
  "svd_components": 500,
  "classifier_c": 4.0,
  "doc_prefix": "passage: ",
  "query_prefix": "query: ",
  "categories": ["Backend", "Frontend", "Móvil", "Datos e IA", "DevOps y Cloud", "Bases de datos", "Seguridad", "Fundamentos"],
  "n_clusters": 8,
  "terms_by_category": { "Backend": ["spring", "java", "…10 términos…"], "…": [] },
  "metrics": {
    "embedding_macro_f1_en": 0.0,
    "embedding_macro_f1_es": 0.0,
    "tfidf_macro_f1_en": 0.0,
    "tfidf_macro_f1_es": 0.0,
    "embedding_macro_f1_es_reliable": 0.0,
    "es_reliable_categories": 8,
    "es_min_support": 30
  },
  "train_size": 0
}
```

Son las 13 claves del bloque `meta`, tal cual las serializa el notebook. Las métricas
en inglés llegan como `null` si el artefacto se entrenó sin `test_corpus.jsonl`: ese
conjunto es opcional y su ausencia no invalida el modelo.

`dim` son las dimensiones del **embedding**, que es lo que viaja en el contrato y lo
que guarda la base. `feature_dim` es lo que consume el **clasificador**. 
Son dos números distintos: ver *"El clasificador NO consume el
embedding"* en [Notas y trampas](#notas-y-trampas).

`embedding_*` son las métricas del clasificador de producción y `tfidf_*` las del
modelo explicable, que sirve de referencia. `embedding_macro_f1_es_reliable` es la
macro-F1 en español restringida a las categorías con muestra suficiente en el test
(`meta.metrics.es_min_support`, 30 documentos); la macro-F1 promedia sin ponderar por
tamaño, así que una categoría con muy pocos documentos aporta ruido.

**Errores:** `503` si el modelo aún no está cargado.

## Notas y trampas

- **Prefijos E5.** El contenido se codifica como `"passage: {texto}"` y las
  consultas como `"query: {texto}"`. Mezclarlos degrada la búsqueda.

- **La búsqueda por similitud se almacena en Autonomous Database**: la API
  pide el vector de la consulta a `POST /embed` y la base resuelve el ranking
  con `VECTOR_DISTANCE`. Este servicio vectoriza; no busca, no indexa y no
  persiste datos.

- **La proyección se calcula en tiempo de ejecución.** `umap_reducer.transform()` corre
  dentro de `POST /predict`, así que un contenido añadido en tiempo de ejecución recibe sus
  coordenadas en el momento y la API las persiste con el resto. El mapa
  incluye siempre todo el corpus.


Los 9 valores del artefacto y la explicación de su contenido se encuentra en: [`notebook/README.md`](../notebook/README.md).