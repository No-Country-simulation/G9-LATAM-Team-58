# inference/

Servicio de inferencia **sin estado**: embeddings y clasificación. **No** toca la
base de datos ni guarda el índice del corpus en memoria — el ranking por similitud
lo resuelve la Autonomous Database con `VECTOR_DISTANCE`, orquestado por `api/`.

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
- **Sin estado:** no toca la base de datos y no mantiene ningún índice. Lo único
  que carga es el artefacto (modelo + tokenizer). Por eso cabe en la VM.
- **Prefijos E5 (importante):** el caller envía **texto plano** y el servicio aplica
  el prefijo. Pero **el caller decide cuál**: `POST /predict` usa `"passage: "`
  siempre (es el camino de indexación) y `POST /embed` exige el campo `type`, sin
  valor por defecto. Mezclarlos degrada la búsqueda **en silencio, sin lanzar
  error** — por eso no hay default que adivinar.
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
| `cluster_id` | int | cluster de KMeans (en el `.joblib` la clave es `cluster`) |
| `x`, `y` | float | coordenadas UMAP, para el mapa del corpus |

> **Por qué devuelve el embedding.** `cluster_id`, `x` e `y` salen de `kmeans` y
> `umap_reducer`, que viven dentro del artefacto — la API Java no puede calcularlos.
> Si tuviera que pedir la clasificación aquí y el vector a `POST /embed`, pagaría
> **dos pasadas del encoder sobre el mismo texto**, que es la parte cara. Este
> endpoint resuelve el camino de indexación completo en una sola llamada.

Este endpoint aplica el prefijo `"passage: "`, siempre.

---

## `POST /embed` — vectorizar una consulta

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

## Lo que este servicio ya NO hace

Tres endpoints desaparecieron al mover el índice a la Autonomous Database. Si vienes
del notebook o de una versión anterior de este documento, búscalos aquí:

| Antes | Ahora |
|---|---|
| `POST /similar` | La API consulta `VECTOR_DISTANCE` en la base. Ver `api/README.md` |
| `POST /index` | La API persiste lo que devuelve `POST /predict` |
| `GET /projection` | Las coordenadas `x`/`y` están en la tabla `contents` |

`index_new_content()` del notebook hacía **tres cosas a la vez** —vectorizar,
asignar cluster/coordenadas y opcionalmente reentrenar—. En producción esas tres
cosas tienen tres dueños distintos: la función no se eliminó, se descompuso. El
`partial_fit` quedaría en un `POST /learn` que está **diseñado pero no
implementado** (`docs/TECHMIND.md` §3).

Efecto secundario bueno: los contenidos añadidos en vivo **sí aparecen en el mapa**.
Antes la proyección salía congelada del `.joblib` y había que re-proyectar en el
notebook; ahora `umap_reducer.transform()` corre dentro de `POST /predict` y sus
coordenadas se persisten con el resto.
