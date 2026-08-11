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

- Docker.

Todo corre en contenedor. La imagen instala Torch en su build de CPU y hornea el
transformer al construirse (ver [CONTRIBUTING.md](../CONTRIBUTING.md)); no hace
falta Python ni un entorno virtual en la máquina.

## Instalación

```bash
docker compose build inference
```

## Configuración

| Variable | Requerida | Para qué |
|---|---|---|
| `MODEL_BUCKET` | en producción | bucket de OCI Object Storage con `model.joblib` |
| `MODEL_LOCAL_PATH` | no | variable de entorno para ejecución local — ver abajo |

**Ejecución en local.** La autenticación con Instance Principal solo funciona
dentro de una instancia de OCI: fuera, el firmante no alcanza el endpoint de
metadatos. Para levantar el servicio en tu máquina, baja `model.joblib` del
bucket y móntalo en el contenedor con `MODEL_LOCAL_PATH` apuntando a él, en
`docker-compose.override.yml`:

```yaml
services:
  inference:
    environment:
      MODEL_LOCAL_PATH: /model/model.joblib
    volumes:
      - "/ruta/a/tu/carpeta:/model:ro"
```

Si esa ruta existe, `load_model()` la carga directo y **no** toca OCI. Sin la
variable, el servicio descarga el artefacto del bucket al arrancar.

## Uso

```bash
docker compose up inference
```

Sirve en `http://localhost:8000` (el puerto lo publica
`docker-compose.override.yml`; en la VM queda interno y solo lo alcanza `api/`).
Tarda unos 50 s en quedar `healthy`: carga el artefacto y hace una inferencia de
calentamiento para que la primera petición real no pague la inicialización.

Catálogo completo de rutas en [Referencia de la API](#referencia-de-la-api).

## Pruebas

```bash
docker run --rm -v "$PWD/inference:/src" -w /src techmind-inference:local \
  sh -c "pip install -q -r requirements-dev.txt && ruff check . && pytest -q"
```

Desde la raíz del repo, con la imagen ya construida. `requirements-dev.txt`
(ruff, pytest, httpx) es solo para dev y CI: el `Dockerfile` instala únicamente
`requirements.txt`, por eso el comando los añade sobre la marcha.

En **Git Bash sobre Windows** hacen falta dos ajustes:

```bash
MSYS_NO_PATHCONV=1 docker run --rm -v "$PWD/inference:/src" -w /src techmind-inference:local \
  sh -c "pip install -q -r requirements-dev.txt && ruff check . --ignore EXE002 && pytest -q"
```

`MSYS_NO_PATHCONV=1` evita que Git Bash reescriba `/src` a una ruta de Windows.
`--ignore EXE002` descarta un aviso que solo aparece ahí: el bind mount presenta
los ficheros como ejecutables y ruff los reclama por no tener shebang. En CI, que
corre sobre Linux, ninguno de los dos hace falta.

## Contratos y fronteras

- **Contrato:** este servicio lo llama **solo la API** (`api/`), nunca
  la web. Por eso, **todo va en inglés** (paths, keys, valores) salvo los
  valores de categoría (`"Backend"`, `"Datos e IA"`…), que son las etiquetas
  del modelo.
- **Stateless:** no toca la base de datos y no mantiene ningún índice. Lo
  único que carga es el artefacto (modelo + tokenizer).
- Las claves de `model.joblib` y cómo se generan están en
  [`notebook/README.md`](../notebook/README.md). El transformer **no** va dentro
  del `.joblib`, solo su nombre: la imagen Docker lo descarga **al construirse**,
  y por eso el contenedor arranca sin red.
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

**Errores:** `503` si el modelo no está cargado.

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

**Errores:** `503` si el modelo no está cargado.

### `GET /health` — estado

**Recibe:** (sin parámetros).

**Devuelve** `200 OK`:

```json
{ "status": "ok", "model_loaded": true, "version": "v1" }
```

Responde `200` también mientras el artefacto no está cargado —es lo que
distingue "arrancando" de "roto"— y entonces `status` es `"error"`,
`model_loaded` es `false` y `version` es `null`. `version` sale del `meta` del
artefacto, así que refleja la versión que el contenedor sirve de verdad.

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
  "classifier_c": 1,
  "doc_prefix": "passage: ",
  "query_prefix": "query: ",
  "categories": ["Backend", "Bases de datos", "Datos e IA", "DevOps y Cloud", "Frontend", "Fundamentos", "Móvil", "Seguridad"],
  "n_clusters": 8,
  "terms_by_category": { "Backend": ["laravel", "net", "spring", "spring boot", "…10 términos…"], "…": [] },
  "metrics": {
    "embedding_macro_f1_en": 0.7942,
    "embedding_macro_f1_es": 0.7581,
    "tfidf_macro_f1_en": 0.7841,
    "tfidf_macro_f1_es": 0.7467,
    "embedding_macro_f1_es_reliable": 0.7581,
    "es_reliable_categories": 8,
    "es_min_support": 30
  },
  "train_size": 12800
}
```

Son las 13 claves del bloque `meta`, tal cual las serializa el notebook — los
valores de arriba son los del artefacto `v1` que sirve el contenedor. Las métricas
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