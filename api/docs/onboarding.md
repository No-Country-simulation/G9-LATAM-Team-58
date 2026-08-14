# Guía de configuración / onboarding — API de Mindloom

De cero a una API corriendo: wallet, arranque, verificación y primeros datos.
El contrato de los endpoints, la tabla de variables de entorno, los perfiles y
las pruebas viven en el [README de la API](../README.md) — aquí solo lo que
hace falta para **arrancar** y las preguntas de "¿por qué no funciona?".

---

## 1. Prerrequisitos

| Requisito | Por qué |
|---|---|
| **Java 25** | versión del `pom.xml` (`<java.version>25</java.version>`); el Dockerfile usa `eclipse-temurin:25` |
| **Maven** | no hace falta instalado: el repo trae el wrapper (`./mvnw`) — `mvn` es equivalente si ya lo tienes |
| **Docker + Docker Compose** | para levantar `inference/` (la API local contra el contenedor); Docker no levanta base propia |
| **Acceso a la Oracle Autonomous Database (ADB)** | la base es externa y gestionada; sin ella, la API solo arranca en modo scaffold (503 en endpoints DB) |
| **Wallet de la ADB** | la credencial de conexión; el paso 3 explica cómo obtenerla y colocarla |

## 2. Arquitectura mínima en 5 líneas

1. La web habla **solo** con la API (`:8080`); la API es la única pieza que toca la base.
2. La API valida, orquesta y persiste: recibe el texto y decide qué llamar.
3. `inference/` (FastAPI, `:8000`) clasifica y genera embeddings — la API lo llama vía `INFERENCE_BASE_URL`.
4. La ADB guarda los contenidos con su `embedding VECTOR(384, FLOAT32)` y resuelve la búsqueda por similitud con `VECTOR_DISTANCE`.
5. Sin inference la API arranca y degrada; sin base (perfil por defecto) arranca y responde `503` en los endpoints que la necesitan.

Detalle por componentes: [architecture.md](architecture.md) · flujo por endpoint: [endpoint-flows.md](endpoint-flows.md).

## 3. Paso a paso: el wallet de la Oracle ADB

La ADB no se autentica con usuario/contraseña a secas: el JDBC Oracle Thin exige
un **wallet** descomprimido en disco y un alias TNS. El wallet **nunca se
commitea** — vive solo en tu máquina (y en la VM de producción, ver
[`../../docs/06-deploy.md`](../../docs/06-deploy.md)).

1. **Descargar el wallet** desde OCI: Autonomous Database → tu ADB →
   **DB Connection** → **Download wallet**. Tipo: **Instance Wallet** (no
   Regional ni "Autonomous Wallet" clásico). Pide una contraseña — se usa para
   abrir los keystores del zip.
2. **Descomprimir y colocar** en `./wallet/` en la **raíz del repo**:
   ```bash
   mkdir -p wallet
   unzip Wallet_techmind.zip -d wallet/    # deja tnsnames.ora, cwallet.sso, ewallet.p12...
   ```
   Esa carpeta es la que `docker-compose.yml` monta de solo lectura dentro del
   contenedor (`./wallet:/app/wallet:ro`).
3. **`TNS_ADMIN` apunta al wallet**:
   - En Docker: `/app/wallet` (lo fija el propio `Dockerfile` y el compose).
   - En local (Maven): tu ruta local, p. ej. `/home/tu-usuario/techmind/wallet`.
4. **Variables del datasource** (el resto de variables, en `../../.env.example`
   y `../.env.example`):

   | Variable | Valor típico | Para qué |
   |---|---|---|
   | `SPRING_DATASOURCE_URL` | `jdbc:oracle:thin:@techmind_tp?TNS_ADMIN=/app/wallet` | JDBC Thin; el alias `techmind_tp` sale de `tnsnames.ora` del wallet (`_tp` = Transaction Processing, el que suele valer) |
   | `SPRING_DATASOURCE_USERNAME` | `ADMIN` | el usuario administrador de la ADB |
   | `SPRING_DATASOURCE_PASSWORD` | — | la contraseña del ADB |
   | `TNS_ADMIN` | `/app/wallet` (Docker) o ruta local | dónde está el wallet descomprimido |
   | `INFERENCE_BASE_URL` | Ejemplo: `http://localhost:8000` (ver `../.env.example`). Default efectivo de la app: `http://163.176.120.167:8000` (application.properties) | dónde vive `inference/`; en compose ya apunta al contenedor |

   En local, `SPRING_DATASOURCE_URL` debe llevar tu ruta local en `TNS_ADMIN=…`
   (o el valor de `tnsnames.ora`). En Docker el valor de arriba funciona tal cual.

## 4. Dos formas de arrancar

### A. Con Docker Compose (recomendada)

Desde la **raíz del repo**:

```bash
docker compose up --build inference api
```

- **No levanta ninguna base**: la ADB es externa, el wallet montado la conecta.
- El perfil **`db` se activa solo** (`SPRING_PROFILES_ACTIVE=db` en el servicio
  `api` del compose); `app.database.enabled=true` queda puesto.
- `api` espera a que `inference` esté *healthy* (`depends_on: condition: service_healthy`).
- La web **no** entra en este arranque: `web` está detrás de `profiles: [web]` y
  requiere `docker compose --profile web up --build` (o `-d` para dejar todo en background).

### B. Local con Maven

Primero exporta las variables del datasource (ver paso 3) y luego:

```bash
export SPRING_DATASOURCE_URL='jdbc:oracle:thin:@techmind_tp?TNS_ADMIN=/ruta/local/al/wallet'
export SPRING_DATASOURCE_USERNAME='ADMIN'
export SPRING_DATASOURCE_PASSWORD='…'
export TNS_ADMIN='/ruta/local/al/wallet'
./mvnw spring-boot:run -Dspring-boot.run.profiles=db     # perfil db
```

**O en modo scaffold, sin base**: es el perfil por defecto — no hace falta
ninguna variable:

```bash
./mvnw spring-boot:run
```

| | Perfil por defecto (`scaffold`) | Perfil `db` |
|---|---|---|
| Base de datos | sin base: `spring.autoconfigure.exclude` saca `DataSourceAutoConfiguration` y `HibernateJpaAutoConfiguration` | conectada: datasource desde env vars |
| `app.database.enabled` | ausente → los beans de DB no se crean | `true` → se crean (los servicios llevan `@ConditionalOnProperty(name="app.database.enabled", havingValue="true")`) |
| Endpoints DB (`/contents`, `/search`, `/admin/seed`…) | `503` "Base de datos no configurada. Use app.database.enabled=true" | funcionan |
| Para qué sirve | desarrollo de la API sin ADB, contract tests | desarrollo real contra la ADB |

> El `503` de scaffold no es un fallo: es el estado esperado. `/health` sigue
> respondiendo `UP` si inference responde, y la dependencia `database` figura
> `enabled=false`.

## 5. Verificación con curl

Con la API arriba en `localhost:8080`:

```bash
curl -s localhost:8080/health
```

Espera `"status":"UP"` (si `inference` está sano; en scaffold, con
`database.enabled=false`, sigue siendo `UP`).

```bash
curl -s localhost:8080/model
```

Espera `embeddingModel`, `dim: 384`, `macroF1`… — un proxy a `GET /model/info`
de `inference`; con inference caído responde `503`.

```bash
curl -s 'localhost:8080/search?q=test'
```

Espera `{"mode":"semantic","total":…,"results":[…]}`. En scaffold responde `503`.

```bash
curl -s -X POST localhost:8080/content \
  -H 'Content-Type: application/json' \
  -d '{"title":"Introducción a Spring Boot","body":"En este contenido se presentan los conceptos básicos para crear APIs REST con Java y Spring Boot."}'
```

Espera `201 Created` con `category`, `probability`, `keywords`… El contrato
completo de cada endpoint está en el
[README de la API, §Referencia de la API](../README.md#referencia-de-la-api).

## 6. Cargar contenido inicial

La tabla `contents` se puebla por una de estas dos rutas (detalle del flujo en
[endpoint-flows.md](endpoint-flows.md)):

### (a) `POST /admin/seed` — JSON de documentos ya resueltos

Hasta **5000 documentos** por request, con el `embedding` ya calculado:

```json
{
  "documents": [
    {
      "id": "devto-4821",
      "title": "Introducción a Spring Boot",
      "body": "…",
      "category": "Backend",
      "embedding": [0.021, -0.118, "…384 floats exactos…"],
      "x": 1.24,
      "y": -3.07,
      "clusterId": 3,
      "keywords": ["Java", "Spring Boot"]
    }
  ]
}
```

- `embedding` debe traer **exactamente 384 floats** (la columna es
  `VECTOR(384, FLOAT32)`).
- La validación es **previa**: si un documento no pasa, la request falla **sin
  escribir nada**; los motivos llegan en `errors[]`.
- Requiere perfil `db` (en scaffold responde `503`).

```bash
curl -s -X POST localhost:8080/admin/seed \
  -H 'Content-Type: application/json' \
  -d @seed.json
```

### (b) `POST /contents/batch` — CSV multipart

CSV con columnas `title,body` (máx **5 MB**), los textos los clasifica la API
vía inference:

```bash
curl -s -X POST localhost:8080/contents/batch -F 'file=@contenidos.csv'
```

Devuelve `200` con `processed`, `failed` e `ids`; las filas malas vienen en
`errors[]` con su número de fila — **no** tumban la request.

## 7. Troubleshooting

| Síntoma | Causa probable | Cómo resolver |
|---|---|---|
| `503` "Base de datos no configurada. Use app.database.enabled=true" | la API corre en scaffold: falta el perfil `db` / `app.database.enabled` no está en `true` | arrancar con perfil `db` (compose lo pone solo con `SPRING_PROFILES_ACTIVE=db`) |
| `503` "Inference service unavailable" | `inference` caído o inalcanzable | `docker compose ps`; el puerto 8000 solo existe dentro de la red de compose (no está publicado); revisar el healthcheck de `inference` |
| Error TNS / "wallet no encontrado" al conectar | `TNS_ADMIN` mal, o el wallet no está montado | en compose, revisar el volumen `./wallet:/app/wallet:ro` y que `./wallet/` contenga `tnsnames.ora`; en local, que `TNS_ADMIN` apunte a tu ruta local |
| CORS en desarrollo | — | la API permite `*` (`CorsConfig`); no aplica en producción, donde nginx sirve todo desde un solo origen |
| `embedding debe tener 384 valores` en seed | el array no trae exactamente 384 floats | validar el JSON antes de enviarlo (p. ej. `python -c "import json;print(len(json.load(open('seed.json'))['documents'][0]['embedding']))"`) — si falla la pre-validación, **no se escribe nada** |
| CSV con filas malas (body vacío…) | datos de entrada | la API responde `200` con `processed`/`failed`/`errors[]` — revisar `errors` para las filas rechazadas |

## 8. Dónde está cada cosa

| Documento | Qué encontrarás |
|---|---|
| [`../README.md`](../README.md) | README de la API: tabla de variables, perfiles, pruebas, contrato de endpoints |
| [`../../README.md`](../../README.md) | README raíz: visión general del proyecto y del repo |
| [`architecture.md`](architecture.md) | Diagrama C4 nivel 3 (Mermaid): la API por componentes |
| [`endpoint-flows.md`](endpoint-flows.md) | Diagramas de flujo (sequence) por endpoint |
| [`../../docs/05-arranque-inference.md`](../../docs/05-arranque-inference.md) | Arranque de `inference`: build time vs startup, healthcheck |
| [`../../docs/06-deploy.md`](../../docs/06-deploy.md) | Deploy a la VM: CI/CD, wallet en producción, puertos |
