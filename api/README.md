# api/

Puerta de entrada REST. Valida la entrada, orquesta y persiste. **No** carga
modelos ni hace matemáticas.

## Consume

- `inference/` (HTTP interno, JSON) — predicción y similitud.
- PostgreSQL — persistencia de los contenidos.

## Fronteras

- La web habla solo con esta API; esta API es la única que llama a `inference/`.
- Es la versión detallada del contrato de `docs/TECHMIND.md` §4.3. Cubre todas las
  pantallas del diseño (Analizar, Buscar, Biblioteca, Mapa, Sidebar, Cargar CSV).

---

## Convenciones

- **Base URL** (dev): `http://localhost:8080`
- **Formato:** JSON en request y response (`Content-Type: application/json`).
- **Idioma:** paths y keys en **inglés**. Solo van en español los **valores** que
  ve el usuario final: el `message` de los errores y los valores de categoría
  (`"Backend"`, `"Datos e IA"`…). El contenido de `title`/`body` es variable.
- **Errores:** siempre este formato, nunca un stacktrace:

  ```json
  { "error": "VALIDATION_ERROR", "message": "El campo 'body' no puede estar vacío", "timestamp": "2026-07-15T10:00:00Z" }
  ```

  Códigos: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `INTERNAL_ERROR` (500).

---

## Ruta vs. query string — `/contents` y `/contents?category=` SON la misma ruta

Es la duda más común, así que va primero.

Una **ruta** (endpoint) se define por **método HTTP + path**. `GET /contents` es
**una sola** ruta.

`?category=Backend` es un **query string**: NO forma parte del path, es un
**parámetro opcional** que se le pasa a esa misma ruta para filtrar el resultado.

```
GET /contents                 -> lista TODOS los contenidos
GET /contents?category=Backend -> misma ruta, filtrada por categoría
```

En Spring Boot las atiende **el mismo método**:

```java
@GetMapping("/contents")
public List<Content> list(
    @RequestParam(required = false) String category) { ... }
```

Si `category` viene, filtra; si no, devuelve todo. Por eso en las tablas se ven
como dos líneas (dos casos de uso), pero técnicamente es **un endpoint con un
parámetro opcional**, no dos rutas distintas.

> Regla general: lo que va **antes** del `?` es la ruta; lo que va **después**
> (`?clave=valor&...`) son query params opcionales de esa ruta.

---

## Orquestación — qué rutas llaman a inference

La API orquesta: unas rutas consultan al servicio de inferencia, otras se
resuelven **solo con la base de datos**.

| Ruta de la API | Llama a inference |
|---|---|
| `POST /content` | `POST /predict` (+ `POST /similar` para relacionados, `POST /index` al persistir) |
| `GET /contents/{id}/related` | `POST /similar` |
| `GET /search?mode=semantic` | `POST /similar` |
| `GET /map` | `GET /projection` |
| `GET /model` | `GET /model/info` |

**Solo API + DB** (no pasan por inference): `GET /contents`,
`GET /contents?category=`, `GET /search?mode=keyword`, `GET /stats`.

---

## `POST /content` — ingerir un contenido

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
  "id": 142,
  "category": "Backend",
  "probability": 0.89,
  "keywords": ["Java", "Spring Boot", "API REST"],
  "related": [
    { "id": 87, "title": "Validación con Bean Validation", "category": "Backend", "similarity": 0.76 }
  ],
  "explanation": ["spring", "rest", "endpoint"]
}
```

**Errores:** `400 VALIDATION_ERROR` si falta `title` o `body`.

---

## `GET /contents` — listar contenidos

Lista los contenidos ya indexados. Acepta un filtro opcional por categoría.

**Recibe** (query params, todos opcionales):

| Param | Tipo | Default | Qué hace |
|---|---|---|---|
| `category` | string (una de las 8) | — | filtra por categoría |
| `sort` | string | `addedAt,desc` | orden (p.ej. `addedAt,desc`) |
| `page` | int | 0 | paginación |
| `size` | int | 20 | tamaño de página |

**Devuelve** `200 OK` — array de resúmenes:

```json
[
  { "id": 142, "title": "Introducción a Spring Boot", "category": "Backend", "source": "dev.to", "probability": 0.89, "addedAt": "2026-07-14T09:12:00Z" },
  { "id": 143, "title": "Componentes en React", "category": "Frontend", "source": "medium", "probability": 0.81, "addedAt": "2026-07-15T16:40:00Z" }
]
```

| Campo | Tipo | Qué es |
|---|---|---|
| `source` | string | fuente del contenido (para la columna "Fuente") |
| `probability` | float | confianza de la clasificación ("Confianza") |
| `addedAt` | ISO-8601 | fecha de alta (orden y marca "recién añadido") |

**Ejemplos:**

```
GET /contents                  -> todos
GET /contents?category=Backend -> solo Backend
GET /contents?page=2&size=50   -> paginado
```

---

## `GET /contents/{id}` — detalle de un contenido

**Recibe** (path param):

| Param | Tipo | Qué es |
|---|---|---|
| `id` | int | id del contenido |

**Devuelve** `200 OK` — el contenido completo:

```json
{
  "id": 142,
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

---

## `GET /contents/{id}/related` — recomendaciones

Contenidos semánticamente parecidos al indicado.

**Recibe:**

| Param | Ubicación | Tipo | Default | Qué hace |
|---|---|---|---|---|
| `id` | path | int | — | contenido base |
| `limit` | query | int | 5 | cuántos devolver |

**Devuelve** `200 OK`:

```json
{
  "related": [
    { "id": 87, "title": "Validación con Bean Validation", "category": "Backend", "similarity": 0.76 },
    { "id": 91, "title": "Manejo de errores en REST",       "category": "Backend", "similarity": 0.71 }
  ]
}
```

**Errores:** `404 NOT_FOUND` si el `id` base no existe.

---

## `GET /search` — búsqueda

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
    { "id": 142, "title": "Introducción a Spring Boot", "category": "Backend", "similarity": 0.83 },
    { "id": 150, "title": "APIs REST con Node",          "category": "Backend", "similarity": 0.79 }
  ]
}
```

`total` y `elapsedMs` alimentan el "24 resultados · 38 ms" y el paginador.

> En `mode=keyword` el campo de ranking puede ser un `score` léxico en vez de
> `similarity`; el resto de la forma es igual.

**Errores:** `400 VALIDATION_ERROR` si falta `q`.

---

## `GET /map` — puntos del mapa del corpus

Coordenadas 2D (UMAP) de cada documento, para la nube de puntos.

**Recibe:** nada.

**Devuelve** `200 OK`:

```json
[
  { "id": 142, "title": "Introducción a Spring Boot", "category": "Backend",  "x": 1.24, "y": -3.07 },
  { "id": 143, "title": "Componentes en React",       "category": "Frontend", "x": -2.10, "y": 0.88 }
]
```

> La API obtiene los puntos de inference (`GET /projection`); **no** salen de la
> DB. Reflejan el corpus **entrenado**: los contenidos añadidos en vivo con
> `POST /content` no aparecen hasta re-proyectar en el notebook.

---

## `GET /stats` — contadores y agregados

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

---

## `GET /model` — estado del modelo (sidebar)

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

---

## `POST /contents/batch` — carga por lotes *(opcional)*

Ingiere varios contenidos desde un CSV.

**Recibe:** `multipart/form-data` con un archivo `file` (CSV con columnas
`title,body`).

**Devuelve** `200 OK`:

```json
{
  "processed": 231,
  "failed": 3,
  "ids": [200, 201, 202, "..."],
  "errors": [
    { "row": 57, "reason": "El campo 'body' no puede estar vacío" }
  ],
  "byCategory": { "Backend": 58, "Frontend": 41, "Datos e IA": 33 }
}
```

> **Síncrono:** responde una sola vez al terminar de procesar todo el CSV. No hay
> progreso en vivo; la web muestra una barra indeterminada mientras espera.

**Errores:** `400 VALIDATION_ERROR` si el CSV está mal formado o vacío.
