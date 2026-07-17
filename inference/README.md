# inference/

Servicio de inferencia **sin estado**: embeddings, clasificación y similitud.
**No** toca la base de datos (salvo el índice de similitud en memoria).

## Consume

- `model.joblib` desde OCI Object Storage, descargado al arrancar.

## Fronteras

- Solo lo llama `api/`, nunca la web.
- Contrato del artefacto y prefijos E5 (`passage:`/`query:`) en `docs/TECHMIND.md`
  §4.2. El transformer no va dentro del `.joblib`; se hornea en la imagen.

---

## Convenciones

- **Base URL** (dev): `http://localhost:8000`
- **Contrato interno:** este servicio lo llama **solo la API** (`api/`), nunca la
  web. Por eso **todo va en inglés** (paths, keys, valores) salvo los valores de
  categoría (`"Backend"`, `"Datos e IA"`…), que son las etiquetas del modelo.
- **Sin estado:** no toca la base de datos; lo único que guarda es el índice de
  similitud **en memoria**.
- **Prefijos E5 (importante):** el caller envía **texto plano**. El servicio
  aplica internamente el prefijo `"query: "` a las consultas; los documentos del
  corpus se indexaron con `"passage: "`. No mezclar los prefijos degrada la
  búsqueda en silencio.
- **Errores (FastAPI):** validación de entrada → `422` con `{ "detail": [...] }`;
  errores controlados → `{ "detail": "mensaje" }` con el código HTTP
  correspondiente.

> El mapeo de qué ruta de la API llama a cuál de inference está en `api/README.md`
> (sección "Orquestación"), que es quien orquesta.

---

## `POST /predict` — clasificar un texto

**Recibe** (body):

```json
{ "text": "En este contenido se presentan los conceptos básicos de Spring Boot." }
```

| Campo | Tipo | Obligatorio |
|---|---|---|
| `text` | string | sí |

**Devuelve** `200 OK`:

```json
{
  "category": "Backend",
  "probability": 0.89,
  "keywords": ["java", "spring", "rest"],
  "explanation": ["spring", "rest", "endpoint"]
}
```

| Campo | Tipo | Qué es |
|---|---|---|
| `category` | string | una de las 8 categorías |
| `probability` | float 0–1 | confianza de la clase elegida |
| `keywords` | string[] | términos clave extraídos |
| `explanation` | string[] | términos con más peso en la decisión (explicabilidad) |

---

## `POST /similar` — contenidos más parecidos

**Recibe** (body):

```json
{ "text": "APIs REST con Java", "k": 5 }
```

| Campo | Tipo | Default | Qué hace |
|---|---|---|---|
| `text` | string | — (obligatorio) | consulta |
| `k` | int | 5 | cuántos devolver |

**Devuelve** `200 OK` — items del corpus ordenados por similitud (coseno =
producto punto sobre embeddings normalizados):

```json
{
  "related": [
    { "id": "devto-4821", "title": "Introducción a Spring Boot", "similarity": 0.83 },
    { "id": "medium-1187", "title": "REST con Node y Express",    "similarity": 0.79 }
  ]
}
```

> Los `id` son los del `corpus_metadata` del modelo, no los `id` de la base de
> datos de la API. La API hace el mapeo cuando corresponde.

---

## `POST /index` — añadir al índice en memoria

Hace crecer el índice de similitud en caliente, sin reentrenar.

**Recibe** (body):

```json
{
  "id": "142",
  "title": "Introducción a Spring Boot",
  "category": "Backend",
  "url": "https://...",
  "text": "En este contenido..."
}
```

| Campo | Tipo | Obligatorio |
|---|---|---|
| `id` | string | sí |
| `title` | string | sí |
| `category` | string | sí |
| `url` | string | no |
| `text` | string | sí |

**Devuelve** `200 OK`:

```json
{ "indexed": true, "corpus_size": 1041 }
```

> El índice vive en memoria: se pierde al reiniciar el servicio. La fuente de
> verdad persistente es la base de datos de la API + el corpus del bucket.

---

## `GET /health` — estado

**Recibe:** nada.

**Devuelve** `200 OK`:

```json
{ "status": "ok", "model_loaded": true, "version": "v1" }
```

Útil para el healthcheck del contenedor / orquestador.

---

## `GET /model/info` — metadatos del modelo

**Recibe:** nada.

**Devuelve** `200 OK` — el bloque `meta` del artefacto cargado:

```json
{
  "version": "v1",
  "embedding_model": "intfloat/multilingual-e5-small",
  "dim": 384,
  "categories": ["Backend", "Frontend", "Móvil", "Datos e IA", "DevOps y Cloud", "Bases de datos", "Seguridad", "Fundamentos"],
  "metrics": { "embedding_macro_f1_es": 0.0, "tfidf_macro_f1_es": 0.0 }
}
```

**Errores:** `503` si el modelo aún no está cargado.

---

## `GET /projection` — puntos 2D del corpus (para el mapa)

Sirve la proyección UMAP del artefacto (`projection` + `corpus_metadata`). Es la
fuente del `GET /map` de la API.

**Recibe:** nada.

**Devuelve** `200 OK`:

```json
{
  "points": [
    { "id": "devto-4821", "title": "Introducción a Spring Boot", "category": "Backend", "x": 1.24, "y": -3.07 },
    { "id": "medium-1187", "title": "REST con Node y Express",    "category": "Backend", "x": 1.51, "y": -2.88 }
  ]
}
```

> Refleja el corpus **entrenado** (la `projection` del `.joblib`). Contenidos
> añadidos en vivo con `POST /index` no tienen `(x, y)` hasta re-proyectar en el
> notebook.

**Errores:** `503` si el modelo aún no está cargado.
