# inference/

Servicio de inferencia **sin estado** de Mindloom: embeddings y clasificación.
**No** toca la base de datos ni guarda el índice del corpus en memoria — el
ranking por similitud lo resuelve la Autonomous Database con `VECTOR_DISTANCE`,
orquestado por `api/`.

Solo lo llama `api/`, nunca la web.

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
- Torch, en su build de CPU — nunca la de CUDA (ver
  [CONTRIBUTING.md](../CONTRIBUTING.md)).

## Instalación

```bash
cd inference
python -m venv .venv && source .venv/bin/activate   # o .venv\Scripts\activate en Windows
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

## Configuración

| Variable | Requerida | Para qué |
|---|---|---|
| `MODEL_BUCKET` | en producción | bucket de OCI Object Storage con `model.joblib` |
| `MODEL_LOCAL_PATH` | no | atajo de dev — ver abajo |

**Atajo de dev.** Si `MODEL_LOCAL_PATH` apunta a un archivo existente (por
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

`requirements-dev.txt` es solo para dev/CI — no se hornea en la imagen Docker
(`Dockerfile` instala únicamente `requirements.txt`).

## Contratos y fronteras

- **Contrato interno:** este servicio lo llama **solo la API** (`api/`), nunca
  la web. Por eso **todo va en inglés** (paths, keys, valores) salvo los
  valores de categoría (`"Backend"`, `"Datos e IA"`…), que son las etiquetas
  del modelo.
- **Sin estado:** no toca la base de datos y no mantiene ningún índice. Lo
  único que carga es el artefacto (modelo + tokenizer). Por eso cabe en la VM.
- Las claves de `model.joblib` y cómo se generan están en
  [`notebook/README.md`](../notebook/README.md). El transformer **no** va
  dentro del `.joblib` — solo su nombre; la imagen Docker lo hornea en tiempo
  de build para que el contenedor arranque sin red.
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

> **Por qué devuelve el embedding.** `cluster_id`, `x` e `y` salen de `kmeans` y
> `umap_reducer`, que viven dentro del artefacto — la API Java no puede calcularlos.
> Si tuviera que pedir la clasificación aquí y el vector a `POST /embed`, pagaría
> **dos pasadas del encoder sobre el mismo texto**, que es la parte cara. Este
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

> **`type` no tiene valor por defecto a propósito.** Si falta, `422`. E5 exige
> `"query: "` al consultar y `"passage: "` al indexar; mezclarlos no lanza ninguna
> excepción, solo devuelve resultados peores que nadie nota hasta la demo. Un
> default sería adivinar, y adivinar mal es invisible.

### `GET /health` — estado

**Recibe:** nada.

**Devuelve** `200 OK`:

```json
{ "status": "ok", "model_loaded": true, "version": "v1" }
```

Útil para el healthcheck del contenedor / orquestador.

### `GET /model/info` — metadatos del modelo

**Recibe:** nada.

**Devuelve** `200 OK` — el bloque `meta` del artefacto cargado:

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
que guarda la base. `feature_dim` es lo que consume el **clasificador**
(`dim + svd_components`). Son dos números distintos: ver *"El clasificador NO come el
embedding"* en [Notas y trampas](#notas-y-trampas).

`embedding_*` son las métricas del clasificador de producción y `tfidf_*` las del
modelo explicable, que sirve de referencia. `embedding_macro_f1_es_reliable` es la
macro-F1 en español restringida a las categorías con muestra suficiente en el test
(`meta.metrics.es_min_support`, 30 documentos); la macro-F1 promedia sin ponderar por
tamaño, así que una categoría con muy pocos documentos aporta ruido.

**Errores:** `503` si el modelo aún no está cargado.

## Notas y trampas

- **Prefijos E5.** El contenido se codifica como `"passage: {texto}"` y las
  consultas como `"query: {texto}"`. Mezclarlos degrada la búsqueda en silencio,
  sin error.
- **La búsqueda por similitud vive en la Autonomous Database**, no aquí: la API
  pide el vector de la consulta a `POST /embed` y la base resuelve el ranking
  con `VECTOR_DISTANCE`. Este servicio vectoriza; no busca, no indexa y no
  persiste.
- **La proyección se calcula en caliente.** `umap_reducer.transform()` corre
  dentro de `POST /predict`, así que un contenido añadido en vivo recibe sus
  coordenadas en el momento y la API las persiste con el resto. El mapa
  incluye siempre todo el corpus.

### El clasificador NO come el embedding

Este error **revienta a la vista**, en el primer request. Es el mejor de los cuatro
que cubre esta sección: los dos primeros de la lista de más abajo no avisan de nada.

El `classifier` del artefacto espera **884 valores** (`meta["feature_dim"]`), no los
384 del embedding (`meta["dim"]`). Son el embedding de E5 **concatenado con el
vocabulario del texto comprimido** por el `svd`: `384 + 500`. Pasarle el embedding a
secas provoca:

```
ValueError: X has 384 features, but LogisticRegression is expecting 884 features as input
```

Hay que construirlas antes de clasificar:

```python
import joblib
import numpy as np
from sklearn.preprocessing import normalize

art        = joblib.load("model.joblib")
classifier = art["classifier"]
svd        = art["svd"]                    # TruncatedSVD de 500 componentes
tfidf      = art["baseline_vectorizer"]    # el MISMO que alimentó al svd

def build_features(embedding: np.ndarray, text: str) -> np.ndarray:
    """embedding: (1, 384) -> (1, 884)"""
    if svd is None:                        # guarda: solo con svd_components=0
        return embedding
    reduced = normalize(svd.transform(tfidf.transform([text])))
    return np.hstack([embedding, reduced])

# --- en el handler de POST /predict ---
# El prefijo literal viaja en meta["doc_prefix"]: léelo de ahí, no lo hardcodees.
embedding     = encoder.encode([f"passage: {text}"], normalize_embeddings=True)
features      = build_features(embedding, text)
probabilities = classifier.predict_proba(features)[0]
best          = int(probabilities.argmax())

category    = art["label_encoder"].classes_[best]
probability = float(probabilities[best])
```

Tres reglas que van juntas. Las dos primeras **no lanzan excepción**: el servicio
responde `200 OK` con resultados peores, y eso no se nota hasta la demo.

- **`normalize()` no es opcional.** El embedding de E5 sale con norma 1; si el bloque
  del TF-IDF entra con otra escala, la regularización castiga al pequeño y su
  aportación se pierde. No hay error, solo peores resultados.
- **El TF-IDF tiene que ser `baseline_vectorizer`**, el mismo sobre el que se ajustó
  el `svd`. Usar `keyword_vectorizer` da un vocabulario distinto y resultados
  incoherentes sin lanzar excepción.
- **Lo que sale al contrato es `embedding`, nunca `features`.** El campo `embedding`
  de la respuesta son los `meta["dim"]` valores crudos: es lo que se guarda en
  `contents.embedding VECTOR(384)` y contra lo que corre `VECTOR_DISTANCE`. Devolver
  ahí las features sí falla, pero en la base y no aquí: la inserción rechaza 884
  valores en una columna de 384.

Por la misma razón, **`kmeans` y `umap_reducer` reciben el embedding crudo**, no las
features: así el `cluster_id` y las coordenadas viven en el mismo espacio que la base
usa para buscar.

```python
cluster_id = int(art["kmeans"].predict(embedding)[0])
x, y       = art["umap_reducer"].transform(embedding)[0]
```

No escribas `884` en el código: léelo de `meta["feature_dim"]`. Es un parámetro de
entrenamiento, y el artefacto lo publica precisamente para que inference no dependa
de un número fijo. Una comprobación al arrancar corta el problema en el despliegue en
vez de en el primer request:

```python
assert classifier.n_features_in_ == art["meta"]["feature_dim"]
```

Las 9 claves del artefacto y qué contiene cada una: [`notebook/README.md`](../notebook/README.md).

---
← [README principal](../README.md) · [Cómo contribuir](../CONTRIBUTING.md)
