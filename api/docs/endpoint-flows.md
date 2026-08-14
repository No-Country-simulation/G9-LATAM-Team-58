# Flujos por endpoint — Mindloom API

Diagramas de secuencia (`sequenceDiagram`) de cada endpoint de la API. Los tres
flujos centrales ya tienen documentación profunda en `docs/` (raíz) y aquí solo
llevan un resumen de tres líneas y enlace; el resto lleva diagrama completo.

Convención de actores, idéntica a `docs/01..06` de la raíz:

| Participante | Rol |
|---|---|
| 👤 Usuario | quien dispara la acción |
| 🖥️ Web (React) | la SPA; única capa que traduce claves a etiquetas ES |
| ☕ API (Spring) | esta aplicación (`techapi`) |
| 🐍 inference | FastAPI `:8000`; embebe y clasifica |
| 🗄️ Oracle ADB | la base externa; resuelve similitud con `VECTOR_DISTANCE` |

---

## 1. Endpoints ya documentados (resumen)

### `POST /content` — ingesta de un contenido

Documentación completa: [`../../docs/01-post-content.md`](../../docs/01-post-content.md)

1. Es el único flujo donde intervienen las cuatro capas: la Web envía
   `{title, body}`, la API llama **una vez** a `POST /predict` y escribe en la
   ADB tres veces (INSERT sin embedding, UPDATE con `TO_VECTOR`, SELECT de 5
   vecinos), todo dentro de una transacción.
2. El embedding se persiste aparte por `JdbcTemplate` porque la entidad
   `Content` **no tiene** campo `embedding` (JPA no mapea `VECTOR(384,FLOAT32)`).
3. Responde **201** con `{id: "usr-"+UUID, category, probability, keywords,
   related, explanation}`; los `related` salen gratis del vector recién insertado.

### `GET /search` — búsqueda semántica y por palabra clave

Documentación completa: [`../../docs/02-search-semantic.md`](../../docs/02-search-semantic.md)

1. `mode=semantic` (default) llama una vez a `POST /embed` con `type:"query"` y
   deja la comparación en la ADB (`VECTOR_DISTANCE`, COSINE); `mode=keyword` **no
   toca inference** y hace `LIKE` sobre `title`/`body`.
2. En `semantic`, `category` filtra por columna; en `keyword` se **concatena** al
   texto (`q + " " + category`), así que casi siempre devuelve cero resultados.
3. `similarity = 1 - VECTOR_DISTANCE(COSINE)` (1.0 = idéntico); en `keyword`
   `similarity=1.0` fija y `elapsedMs=0` — no hay ranking.

Diagrama compacto (la bifurcación real está en el `alt`):

```mermaid
sequenceDiagram
    autonumber
    actor U as 👤 Usuario
    participant W as 🖥️ Web (React)
    participant A as ☕ API (Spring)
    participant I as 🐍 inference
    participant D as 🗄️ Oracle ADB

    U->>W: Escribe la consulta y pulsa buscar
    W->>A: GET /api/search?q=…&mode=semantic

    alt mode = semantic
        A->>I: POST /embed {"text": q, "type": "query"}
        I-->>A: {"embedding": [384 floats]}
        A->>D: SELECT … ORDER BY VECTOR_DISTANCE(COSINE)
        D-->>A: id, title, category, similarity
    else mode = keyword
        Note over A,I: inference NO se llama
        A->>D: SELECT … WHERE title LIKE %q% OR body LIKE %q%
        D-->>A: id, title, category
        A->>A: similarity = 1.0 · elapsedMs = 0
    end

    A-->>W: 200 {mode, total, elapsedMs, results[]}
    W-->>U: Lista de resultados
```

### `POST /contents/batch` — carga masiva desde CSV

Documentación completa: [`../../docs/04-batch-csv.md`](../../docs/04-batch-csv.md)

1. Multipart con campo `file` (CSV `title,body`, máx. 5 MB): la API descarta la
   cabecera y parsea cada fila con `parseCsvLine` (aware de comillas).
2. Por cada fila válida llama `ContentIngestionServiceImpl.ingest` → **una**
   `POST /predict`: N filas = N llamadas a inference y 3 operaciones de base por
   fila dentro de una sola request HTTP.
3. Devuelve **200 siempre** (aunque haya filas malas):
   `{processed, failed, ids, errors[{row, reason}], byCategory}`; 400 solo si el
   archivo no es CSV, está vacío o supera 5 MB.

---

## 2. Diagramas completos

### `GET /contents` — lista paginada

Lista de contenidos con filtros opcionales. Solo toca la base; no llama a
inference.

```mermaid
sequenceDiagram
    autonumber
    actor U as 👤 Usuario
    participant W as 🖥️ Web (React)
    participant A as ☕ API (Spring)
    participant I as 🐍 inference
    participant D as 🗄️ Oracle ADB

    U->>W: Abre la lista de contenidos
    W->>A: GET /api/contents?category=…&q=…&sort=added_at&page=0&size=20
    A->>A: sort = "added_at"/"addedAt" → DESC por addedAt<br/>cualquier otro valor → sin orden
    A->>A: Servicio ausente (scaffold) → 503

    alt category y q
        A->>D: findAllByCategoryAndTitleContainingIgnoreCase
    else solo category
        A->>D: findAllByCategory
    else solo q
        A->>D: findAllByTitleContainingIgnoreCase
    else sin filtros
        A->>D: findAll (PageRequest)
    end
    D-->>A: Page {totalElements, content[]}

    A->>A: Mapea a ContentSummary (sin body ni embedding)
    A-->>W: 200 {total, items[{id, title, category, source, language, addedAt}]}
    W-->>U: Lista paginada
```

> `total` es `Page.getTotalElements()` — a diferencia de `/search`, aquí **sí**
> sirve para paginar.

### `GET /contents/{id}` — detalle de un contenido

```mermaid
sequenceDiagram
    autonumber
    actor U as 👤 Usuario
    participant W as 🖥️ Web (React)
    participant A as ☕ API (Spring)
    participant I as 🐍 inference
    participant D as 🗄️ Oracle ADB

    U->>W: Pulsa un contenido de la lista
    W->>A: GET /api/contents/{id}
    A->>A: Servicio ausente (scaffold) → 503
    A->>D: SELECT … WHERE id = :id (findById)

    alt existe
        D-->>A: Content completo
        A->>A: Mapea a ContentDetail (incluye body, keywords, explanation)
        A-->>W: 200 ContentDetail
        W-->>U: Detalle del contenido
    else no existe
        A->>A: NotFoundException("Contenido no encontrado: {id}")
        A-->>W: 404 {error: NOT_FOUND, message, timestamp}
        W-->>U: "Contenido no encontrado"
    end
```

### `GET /contents/{id}/related` — contenidos relacionados

Vecinos por similitud de vector. Tres pasos a la base: el contenido base, su
embedding serializado y la búsqueda `VECTOR_DISTANCE`.

```mermaid
sequenceDiagram
    autonumber
    actor U as 👤 Usuario
    participant W as 🖥️ Web (React)
    participant A as ☕ API (Spring)
    participant I as 🐍 inference
    participant D as 🗄️ Oracle ADB

    U->>W: Abre la sección de relacionados
    W->>A: GET /api/contents/{id}/related?limit=5
    A->>A: effectiveLimit = clamp(limit, 1, 50) · default 5
    A->>A: Servicio ausente (scaffold) → 503
    A->>D: SELECT … WHERE id = :id (contenido base)

    alt base no existe
        A->>A: NotFoundException → 404
    else base existe
        A->>D: SELECT VECTOR_SERIALIZE(embedding) WHERE id = :id
        alt embedding es NULL
            A->>A: NotFoundException("El contenido no tiene vector de embedding")
            A-->>W: 404
        else embedding presente
            A->>D: SELECT id, title, category,<br/>1 - VECTOR_DISTANCE(embedding, TO_VECTOR(:e, 384, FLOAT32), COSINE)<br/>FETCH FIRST :limit ROWS ONLY
            D-->>A: related[{id, title, category, similarity}]
            A-->>W: 200 {id, title, related[]}
            W-->>U: Lista de relacionados
        end
    end
```

> La comparación corre **en la base**, no en la API: `inference` no participa.
> Un contenido sin vector (p. ej. una fila cuyo `UPDATE` de embedding falló)
> responde 404, no resultados vacíos.

### `GET /map` — puntos del mapa

```mermaid
sequenceDiagram
    autonumber
    actor U as 👤 Usuario
    participant W as 🖥️ Web (React)
    participant A as ☕ API (Spring)
    participant I as 🐍 inference
    participant D as 🗄️ Oracle ADB

    U->>W: Abre el mapa de contenidos
    W->>A: GET /api/map
    A->>A: Servicio ausente (scaffold) → 503
    A->>D: SELECT id, title, category, x, y<br/>WHERE x IS NOT NULL AND y IS NOT NULL
    D-->>A: puntos[{id, title, category, x, y}]
    A-->>W: 200 puntos[]
    W->>W: Posiciona puntos por (x, y), colorea por category
    W-->>U: Mapa 2D
```

### `GET /stats` — estadísticas

```mermaid
sequenceDiagram
    autonumber
    actor U as 👤 Usuario
    participant W as 🖥️ Web (React)
    participant A as ☕ API (Spring)
    participant I as 🐍 inference
    participant D as 🗄️ Oracle ADB

    U->>W: Abre el dashboard de estadísticas
    W->>A: GET /api/stats
    A->>A: Servicio ausente (scaffold) → 503
    A->>D: SELECT COUNT(*) → total
    A->>D: SELECT COUNT(*) WHERE added_at >= TRUNC(SYSDATE, 'IW')
    A->>D: SELECT category, COUNT(*) GROUP BY category
    D-->>A: {total, addedThisWeek, byCategory}
    A-->>W: 200 {total, addedThisWeek, byCategory}
    W-->>U: Tarjetas y gráfico por categoría
```

> `addedThisWeek` usa `TRUNC(SYSDATE, 'IW')` (inicio de la semana ISO en la base).
> Las categorías del `label_encoder` son 8: Backend, Frontend, Móvil, Datos e IA,
> DevOps y Cloud, Bases de datos, Seguridad, Fundamentos.

### `GET /model` — información del modelo

```mermaid
sequenceDiagram
    autonumber
    actor U as 👤 Usuario
    participant W as 🖥️ Web (React)
    participant A as ☕ API (Spring)
    participant I as 🐍 inference
    participant D as 🗄️ Oracle ADB

    U->>W: Consulta la ficha del modelo
    W->>A: GET /api/model
    A->>I: GET /model/info
    I-->>A: {version, embedding_model, dim, metrics{embedding_macro_f1_es, …}}
    A->>A: macroF1 = metrics["embedding_macro_f1_es"]
    A-->>W: 200 {version, embeddingModel, dim, macroF1}
    W-->>U: Ficha del modelo
```

> **Única ruta que funciona en ambos perfiles**: `ModelServiceImpl` no lleva
> `@ConditionalOnProperty` y `ModelController` inyecta `IModelService` directo
> (sin `Optional`). Con `inference` caído responde 503
> `"Inference service unavailable"`.

### `POST /admin/seed` — siembra del corpus

Carga masiva de documentos ya resueltos (embedding incluido). No llama a
inference: el embedding llega en el JSON. Requiere perfil `db`.

```mermaid
sequenceDiagram
    autonumber
    actor U as 👤 Usuario
    participant W as 🖥️ Web (React)
    participant A as ☕ API (Spring)
    participant I as 🐍 inference
    participant D as 🗄️ Oracle ADB

    U->>W: Dispara la siembra del corpus
    W->>A: POST /api/admin/seed {documents[]} · máx. 5000
    A->>A: Servicio ausente (scaffold) → 503
    A->>D: findAllById(ids) — dedup en UNA query
    A->>A: Fase 1: embedding.length == 384 en cada documento

    alt existe algún error de validación
        A->>A: NO escribe nada (all-or-nothing)
        A-->>W: 200 {processed: 0, failed, skipped: 0, ids: [], errors[]}
    else todo válido
        loop lotes de 100 documentos
            A->>D: INSERT (sin embedding) + UPDATE embedding = TO_VECTOR(?, 384, FLOAT32)
            Note over A: CorpusBatchProcessor<br/>@Transactional(REQUIRES_NEW)<br/>source = "corpus"
        end
        A-->>W: 200 {processed, failed, skipped, ids, errors[{documentId, reason}]}
    end
    W-->>U: Resumen del seed
```

> Fase 1 = *parse don't validate*: si un documento falla la pre-validación
> (embedding ≠ 384 o id duplicado), **no se escribe nada** y `processed=0`. En la
> fase 2, cada lote de 100 corre en su propia transacción `REQUIRES_NEW` (bean
> separado para que el proxy aplique la anotación).

### `GET /health` — estado de salud

```mermaid
sequenceDiagram
    autonumber
    actor U as 👤 Usuario
    participant W as 🖥️ Web (React)
    participant A as ☕ API (Spring)
    participant I as 🐍 inference
    participant D as 🗄️ Oracle ADB

    U->>W: Comprueba el estado del sistema
    W->>A: GET /api/health

    par sonda inference (virtual thread, timeout 3 s)
        A->>I: GET /health
        I-->>A: 200 → reachable = true
    and sonda base (virtual thread, timeout 3 s)
        alt db habilitada
            A->>D: SELECT 1 FROM DUAL
            D-->>A: 1 → reachable = true
        else scaffold (sin JdbcTemplate)
            Note over A: enabled = false<br/>reachable = false
        end
    end

    A->>A: status = UP si inference.reachable && (db.reachable || !db.enabled)<br/>sino DEGRADED
    A-->>W: 200 {status, timestamp, dependencies[]}
    W-->>U: Estado de salud
```

> Las sondas corren en hilos virtuales con timeout de 3 s y **aislamiento por
> sonda**: una sonda que falla jamás tumba el endpoint. En scaffold, con
> `database.enabled=false` pero `inference` sano, `status` sigue siendo `UP`.
> Cada dependencia reporta `{name, enabled, reachable, latencyMs, message}`.

---

## 3. Transversal — logging y errores

Dos piezas de `common/` envuelven **todas** las rutas anteriores:

- **`RequestLoggingFilter`** (`OncePerRequestFilter`) registra cada request al
  entrar y al salir:
  `→ METHOD URI?qs from addr` y `← METHOD URI -> status (ms)`. No re-entra en
  dispatch de errores ni async para no duplicar pares de log por request.
- **`GlobalExceptionHandler`** (`@ControllerAdvice`) devuelve siempre el cuerpo
  `{error, message, timestamp}`:

  | Excepción | HTTP | `error` |
  |---|---|---|
  | `ValidationException` | 400 | `VALIDATION_ERROR` |
  | `NotFoundException` | 404 | `NOT_FOUND` |
  | `MethodArgumentNotValid` / `ConstraintViolation` | 400 | `VALIDATION_ERROR` |
  | `InferenceUnavailableException` | 503 | `INTERNAL_ERROR` |
  | `MaxUploadSizeExceeded` | 400 | `VALIDATION_ERROR` — "El archivo excede el tamaño máximo permitido" |
  | `InferenceException` | 500 | `INTERNAL_ERROR` |
  | `Exception` (genérica) | 500 | `INTERNAL_ERROR` — "Error interno del servidor" |
