# api/

Puerta de entrada REST de Mindloom. Valida la entrada, orquesta y persiste.
**No** carga modelos ni hace matemáticas.

Habla con `inference/` para clasificar y con la Autonomous Database para
persistir y buscar por similitud (`VECTOR_DISTANCE`). Es la única pieza que
toca la base.

## Contenido

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Pruebas](#pruebas)
- [Estructura](#estructura)
- [Contratos y fronteras](#contratos-y-fronteras)
- [Referencia de la API](#referencia-de-la-api)
  - [Orquestación — qué rutas llaman a inference](#orquestación--qué-rutas-llaman-a-inference)
  - [`POST /content`](#post-content--ingerir-un-contenido)
  - [`GET /contents`](#get-contents--listar-contenidos)
  - [`GET /contents/{id}`](#get-contentsid--detalle-de-un-contenido)
  - [`GET /contents/{id}/related`](#get-contentsidrelated--recomendaciones)
  - [`GET /search`](#get-search--búsqueda)
  - [`GET /map`](#get-map--puntos-del-mapa-del-corpus)
  - [`GET /stats`](#get-stats--contadores-y-agregados)
  - [`GET /model`](#get-model--estado-del-modelo-sidebar)
  - [`POST /contents/batch`](#post-contentsbatch--carga-por-lotes)
  - [`POST /admin/seed`](#post-adminseed--carga-masiva-de-corpus)
  - [`GET /health`](#get-health--estado-de-la-api-y-sus-dependencias)

## Requisitos

- Java 25
- El repo trae el Maven Wrapper (`./mvnw`) — no hace falta Maven instalado.

## Instalación

```bash
cd api
./mvnw dependency:go-offline
```

## Configuración

Sin variables de entorno, la API arranca en **modo scaffold**: los beans de base
de datos quedan excluidos y cualquier endpoint que dependa de ella responde
`503`. Para conectar contra una base real, activa el perfil `db`:

| Variable | Requerida en perfil `db` | Para qué |
|---|---|---|
| `SPRING_DATASOURCE_URL` | sí | JDBC de la Autonomous Database (alias del wallet) |
| `SPRING_DATASOURCE_USERNAME` | sí | usuario de la base |
| `SPRING_DATASOURCE_PASSWORD` | sí | contraseña de la base |
| `TNS_ADMIN` | sí | ruta al wallet descomprimido |
| `INFERENCE_BASE_URL` | no — default `http://163.176.120.167:8000` | dónde vive `inference/` |

Sin las tres variables del datasource, el perfil `db` falla al arrancar en vez de
correr con una conexión rota. Ver `application-db.properties` y
`application-scaffold.properties`.

Spring Boot **no** carga `.env` de forma nativa: `api/.env.example` es solo la
lista de qué exportar, a mano o vía `environment:` en Docker Compose.

## Uso

```bash
./mvnw spring-boot:run                              # modo scaffold
SPRING_PROFILES_ACTIVE=db ./mvnw spring-boot:run     # con base de datos real
```

Sirve en `http://localhost:8080`. El catálogo completo de rutas está en
[Referencia de la API](#referencia-de-la-api).

## Pruebas

Dos categorías de tests, con JUnit 5 y `@Tag`:

| Categoría | Qué prueba | Cómo se corre |
|---|---|---|
| **Unit** (`src/test/.../unit/`) | cada controller con `@WebMvcTest` y servicios mockeados — sin base de datos | `./mvnw test` |
| **Integración** (`src/test/.../integration/`) | contra la Autonomous Database real y `inference/` (perfil `db`) | exportar el `.env` y `./mvnw test -DexcludedGroups=` |

Por defecto Surefire excluye el tag `integration`, así que `./mvnw test` (p. ej. en CI)
corre solo los unitarios y no toca la base. Para correrlo todo:

```bash
export $(grep -v '^#' .env | xargs)   # o exportar las variables a mano
./mvnw test -DexcludedGroups=
```

Solo integración: `./mvnw test -Dgroups=integration` (con las variables exportadas).

## Estructura

```
src/main/java/.../techapi/
├── common/       # config, dto y excepciones compartidas por toda la API
├── core/         # contenidos: controller, dto, service — /content, /search, /map, /stats
├── domain/       # entidades y repositorios JPA
└── inference/    # cliente HTTP hacia inference/: controller, dto, service
```

Migraciones de esquema en `src/main/resources/db/migration/` (Flyway).

## Contratos y fronteras

- La web habla solo con esta API; esta API es la única que llama a `inference/`.
- Este documento es el contrato público completo: cubre todas las pantallas del
  diseño (Analizar, Buscar, Biblioteca, Mapa, Sidebar, Cargar CSV).
- **Formato:** JSON en request y response (`Content-Type: application/json`).
- **Idioma:** paths y keys en **inglés**. Solo van en español los **valores** que
  ve el usuario final: el `message` de los errores y los valores de categoría
  (`"Backend"`, `"Datos e IA"`…). El contenido de `title`/`body` es variable.
- **Errores:** siempre este formato, nunca un stacktrace:

  ```json
  { "error": "VALIDATION_ERROR", "message": "El campo 'body' no puede estar vacío", "timestamp": "2026-07-15T10:00:00Z" }
  ```

  Códigos: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `INTERNAL_ERROR` (500).

- **Auditoría:** cada request se registra en el log de la API
  (`→ GET /contents from 127.0.0.1` / `← GET /contents -> 200 (12 ms) from 127.0.0.1`),
  y cada llamada saliente a `inference/` deja su traza (endpoint, status, duración).
  Los fallos se loguean una sola vez, en el `GlobalExceptionHandler`, con su stacktrace.

## Referencia de la API

### Orquestación — qué rutas llaman a inference

La API orquesta: unas rutas consultan al servicio de inferencia, otras se
resuelven **solo con la base de datos**.

| Ruta de la API | Llama a inference |
|---|---|
| `POST /content` | `POST /predict` — **una sola llamada** |
| `GET /search?mode=semantic` | `POST /embed` con `type: "query"` |
| `GET /model` | `GET /model/info` |

**Solo API + DB** (no pasan por inference): `GET /contents`,
`GET /contents?category=`, `GET /contents/{id}/related`, `GET /search?mode=keyword`,
`GET /map`, `GET /stats`.

Dos cosas que sorprenden a primera vista:

- **`POST /content` hace una sola llamada.** `POST /predict` devuelve la categoría
  *y* el `embedding`, el `cluster_id` y las coordenadas `x`/`y`. La API persiste todo
  eso de una vez. Llamar además a un endpoint de embeddings pagaría el encoder dos
  veces sobre el mismo texto, que es la parte cara.
- **`related` no pasa por inference.** El contenido base ya tiene su vector en la
  base, así que el ranking es una consulta:

  ```sql
  SELECT id, title, category,
         1 - VECTOR_DISTANCE(embedding, :qv, COSINE) AS similarity
  FROM contents
  WHERE id <> :base_id
  ORDER BY VECTOR_DISTANCE(embedding, :qv, COSINE)
  FETCH FIRST :n ROWS ONLY
  ```

> **`type` en `POST /embed` es obligatorio y no tiene default.** El modelo E5 exige
> el prefijo `"query: "` al consultar y `"passage: "` al indexar; mezclarlos degrada
> la búsqueda **en silencio, sin lanzar ningún error**. Manda siempre `"query"` desde
> `GET /search`.

### `POST /content` — ingerir un contenido

Recibe un texto, lo clasifica, lo persiste y devuelve el resultado enriquecido.

**Recibe** (body):

```json
{
  "title": "Introducción a Spring Boot",
  "body": "En este contenido se presentan los conceptos básicos para crear APIs REST con Java y Spring Boot."
}
```

| Campo | Tipo | Obligatorio |
|---|---|---|
| `title` | string | sí |
| `body` | string | sí |

**Devuelve** `201 Created`:

```json
{
  "id": "usr-9f2c1e04",
  "category": "Backend",
  "probability": 0.89,
  "keywords": ["Java", "Spring Boot", "API REST"],
  "related": [
    { "id": "devto-2015", "title": "Validación con Bean Validation", "category": "Backend", "similarity": 0.76 }
  ],
  "explanation": ["spring", "rest", "endpoint"]
}
```

> **Los `id` son strings.** Un contenido del corpus conserva el suyo
> (`devto-4821`); uno que sube un usuario recibe `usr-{UUID}` acuñado por la API.
> Es la misma clave del `.jsonl` y del `corpus_index`, así que no hay tabla de
> mapeo ni dos espacios de identificadores que reconciliar.

**Errores:** `400 VALIDATION_ERROR` si falta `title` o `body`.

### `GET /contents` — listar contenidos

Lista los contenidos ya indexados. Acepta filtro opcional por categoría y por
título.

**Recibe** (query params, todos opcionales):

| Param | Tipo | Default | Qué hace |
|---|---|---|---|
| `category` | string (una de las 8) | — | filtra por categoría |
| `q` | string | — | filtra por título, `LIKE` insensible a mayúsculas. Combinable con `category` |
| `sort` | string | `""` | solo `added_at`/`addedAt` ordenan (DESC); cualquier otro valor = sin orden |
| `page` | int | 0 | paginación |
| `size` | int | 20 | tamaño de página |

**Devuelve** `200 OK` — total y resúmenes:

```json
{
  "total": 37,
  "items": [
    { "id": "devto-4821", "title": "Introducción a Spring Boot", "category": "Backend", "source": "dev.to", "language": "es", "addedAt": "2026-07-14T09:12:00Z" },
    { "id": "medium-1187", "title": "Componentes en React", "category": "Frontend", "source": "medium", "language": "es", "addedAt": "2026-07-15T16:40:00Z" }
  ]
}
```

| Campo | Tipo | Qué es |
|---|---|---|
| `total` | long | total de filas que coinciden con `category`/`q` combinados — úsalo para paginar |
| `source` | string | fuente del contenido (para la columna "Fuente") |
| `language` | string | idioma del contenido |
| `addedAt` | ISO-8601 | fecha de alta (orden y marca "recién añadido") |

**Ejemplos:**

```
GET /contents                  -> todos
GET /contents?category=Backend -> solo Backend
GET /contents?q=kubernetes     -> filtra por título
GET /contents?page=2&size=50   -> paginado
```

### `GET /contents/{id}` — detalle de un contenido

**Recibe** (path param):

| Param | Tipo | Qué es |
|---|---|---|
| `id` | string | id del contenido (`devto-4821`, `usr-9f2c1e04`…) |

**Devuelve** `200 OK` — el contenido completo:

```json
{
  "id": "devto-4821",
  "title": "Introducción a Spring Boot",
  "body": "En este contenido...",
  "category": "Backend",
  "probability": 0.89,
  "keywords": ["Java", "Spring Boot", "API REST"],
  "url": "https://...",
  "language": "es"
}
```

**Errores:** `404 NOT_FOUND` si no existe ese `id`.

### `GET /contents/{id}/related` — recomendaciones

Contenidos semánticamente parecidos al indicado.

**Recibe:**

| Param | Ubicación | Tipo | Default | Qué hace |
|---|---|---|---|---|
| `id` | path | string | — | contenido base |
| `limit` | query | int | 5 | cuántos devolver |

**Devuelve** `200 OK`:

```json
{
  "related": [
    { "id": "devto-2015", "title": "Validación con Bean Validation", "category": "Backend", "similarity": 0.76 },
    { "id": "devto-3390", "title": "Manejo de errores en REST",      "category": "Backend", "similarity": 0.71 }
  ]
}
```

**Errores:** `404 NOT_FOUND` si el `id` base no existe.

### `GET /search` — búsqueda

Dos modos: **semantic** (embeddings, vía inferencia) y **keyword** (léxica sobre
`title`+`body`, solo API + DB).

**Recibe** (query params):

| Param | Tipo | Default | Qué hace |
|---|---|---|---|
| `q` | string | — (obligatorio) | consulta |
| `mode` | `semantic` \| `keyword` | `semantic` | tipo de búsqueda |
| `category` | string | — | filtro opcional por categoría |
| `page` | int | 0 | paginación |
| `size` | int | 10 | tamaño de página |

**Devuelve** `200 OK`:

```json
{
  "mode": "semantic",
  "total": 24,
  "elapsedMs": 38,
  "results": [
    { "id": "devto-4821", "title": "Introducción a Spring Boot", "category": "Backend", "similarity": 0.83 },
    { "id": "medium-0042", "title": "APIs REST con Node",        "category": "Backend", "similarity": 0.79 }
  ]
}
```

`total` y `elapsedMs` alimentan el "24 resultados · 38 ms" y el paginador.

> **`mode=keyword` tiene la misma forma, pero no hay ranking.** El filtro es léxico,
> así que `similarity` viene fija en `1.0` para todos los resultados y `elapsedMs` en
> `0`. El orden lo decide la base de datos, no una puntuación. Solo `mode=semantic`
> devuelve una similitud real y mide el tiempo de la consulta.

**Errores:** `400 VALIDATION_ERROR` si falta `q`.

### `GET /map` — puntos del mapa del corpus

Coordenadas 2D (UMAP) de cada documento, para la nube de puntos.

**Recibe:** nada.

**Devuelve** `200 OK`:

```json
[
  { "id": "devto-4821", "title": "Introducción a Spring Boot", "category": "Backend",  "x": 1.24, "y": -3.07 },
  { "id": "medium-1187", "title": "Componentes en React",      "category": "Frontend", "x": -2.10, "y": 0.88 }
]
```

> Los puntos salen de las columnas `x`/`y` de la base — no pasan por inference. Los
> contenidos añadidos en vivo con `POST /content` **sí aparecen** en el mapa: sus
> coordenadas las calcula `umap_reducer.transform()` dentro de `POST /predict` y se
> persisten con el resto.

### `GET /stats` — contadores y agregados

Totales por categoría para las tarjetas de Biblioteca y la leyenda del mapa.

**Recibe:** nada.

**Devuelve** `200 OK`:

```json
{
  "total": 2847,
  "addedThisWeek": 128,
  "byCategory": {
    "Backend": 612,
    "Frontend": 498,
    "Móvil": 301,
    "Datos e IA": 447,
    "DevOps y Cloud": 356,
    "Bases de datos": 289,
    "Seguridad": 194,
    "Fundamentos": 150
  }
}
```

> Sale de la base de datos (`GROUP BY category`, `COUNT`, timestamps). No pasa por
> inference.

### `GET /model` — estado del modelo (sidebar)

**Recibe:** nada.

**Devuelve** `200 OK`:

```json
{
  "version": "v1",
  "embeddingModel": "intfloat/multilingual-e5-small",
  "dim": 384,
  "macroF1": 0.84
}
```

> Proxy a inference `GET /model/info`: la API toma `version`, `dim` y
> `embeddingModel` del bloque `meta`, y `macroF1` de `meta.metrics`.

### `POST /contents/batch` — carga por lotes

Ingiere varios contenidos desde un CSV.

**Recibe:** `multipart/form-data` con un archivo `file` (CSV con columnas
`title,body`).

**Devuelve** `200 OK`:

```json
{
  "processed": 231,
  "failed": 3,
  "ids": ["usr-3a71bd90", "usr-c04e1f22", "usr-88b5a7de", "..."],
  "errors": [
    { "row": 57, "reason": "El campo 'body' no puede estar vacío" }
  ],
  "byCategory": { "Backend": 58, "Frontend": 41, "Datos e IA": 33 }
}
```

> **Síncrono:** la respuesta llega una sola vez, al terminar de procesar todo el CSV.
> La web muestra una barra indeterminada mientras espera.

**Errores:** `400 VALIDATION_ERROR` si el CSV está mal formado o vacío.

### `POST /admin/seed` — carga masiva de corpus

Persiste documentos que **ya llegan resueltos** — con su `embedding`,
`cluster_id` y coordenadas calculados de antemano, no un texto que la API tenga
que clasificar. Pensado para cargar el corpus completo de una vez, no para la
ingesta normal de un usuario.

**Recibe** (body):

```json
{
  "documents": [
    {
      "id": "devto-4821",
      "title": "Introducción a Spring Boot",
      "body": "...",
      "category": "Backend",
      "embedding": [0.021, -0.118, "…384 floats…"],
      "x": 1.24,
      "y": -3.07,
      "clusterId": 3,
      "keywords": ["Java", "Spring Boot"]
    }
  ]
}
```

Hasta 5000 documentos por request; `embedding` debe traer exactamente 384
valores.

**Devuelve** `200 OK`:

```json
{
  "processed": 4821,
  "failed": 3,
  "skipped": 0,
  "ids": ["devto-4821", "..."],
  "errors": [
    { "documentId": "devto-0099", "reason": "embedding debe tener 384 valores" }
  ]
}
```

> **No es la única forma de sembrar la tabla.** [`scripts/seed_db`](../scripts/README.md)
> lee `corpus_index.npz` directo y escribe con `oracledb`, sin pasar por este
> endpoint — hoy es la ruta que de verdad se usa de punta a punta. Este endpoint
> existe para el caso en que un cliente ya tenga los documentos resueltos en
> memoria; nada en el repo lo llama todavía. Detalle de por qué coexisten las dos
> rutas: [`scripts/README.md`](../scripts/README.md#las-dos-rutas-que-escriben-contents-y-en-qué-se-diferencian).

**Errores:** `503` si `app.database.enabled` no está activo (perfil `db`).

### `GET /health` — estado de la API y sus dependencias

Sondeo de salud para orquestador/CI: responde **siempre `200 OK`** y reporta si
`inference/` y la base de datos están alcanzables. No aparece en Swagger
(oculto con `@Hidden`) — este es su único contrato.

**Recibe:** nada.

**Devuelve** `200 OK`:

```json
{
  "status": "UP",
  "timestamp": "2026-08-06T02:00:00Z",
  "dependencies": [
    { "name": "inference", "enabled": true, "reachable": true, "latencyMs": 154, "message": null },
    { "name": "database", "enabled": true, "reachable": true, "latencyMs": 308, "message": null }
  ]
}
```

| Campo | Tipo | Qué es |
|---|---|---|
| `status` | `UP` \| `DEGRADED` | `UP` ⇔ inference alcanzable ∧ (base alcanzable ∨ base no configurada) |
| `dependencies[].enabled` | bool | si la dependencia está configurada en este perfil |
| `dependencies[].reachable` | bool | si responde a su sondeo |
| `dependencies[].latencyMs` | long | duración del sondeo |
| `dependencies[].message` | string \| null | motivo, cuando no está `enabled` o falló el sondeo |

> En modo scaffold (`app.database.enabled=false`) la base figura `enabled=false`
> y la API sigue `UP` si inference responde. En perfil `db` la base se sondea con
> `SELECT 1 FROM DUAL`. Cada sondeo tiene timeout de 3 s: si una dependencia no
> responde a tiempo, se marca `reachable=false` sin tumbar el endpoint.

---
← [README principal](../README.md) · [Cómo contribuir](../CONTRIBUTING.md)
