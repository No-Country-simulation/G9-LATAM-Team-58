# scripts/

Herramientas operativas de un solo uso, fuera del ciclo de vida de cualquier
servicio. No se despliegan.

## Contenido

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Contratos y fronteras](#contratos-y-fronteras)

## Requisitos

- Python
- El wallet de la Autonomous Database, descomprimido en tu máquina.

## Instalación

```bash
cd scripts
pip install oracledb numpy
```

## Configuración

```bash
cp .env.example .env   # y rellenar
```

| Variable | Requerida | Para qué |
|---|---|---|
| `SPRING_DATASOURCE_URL` | sí | mismo DSN que usa `api/` — de ahí sale el alias TNS |
| `SPRING_DATASOURCE_USERNAME` | sí | usuario de la base |
| `SPRING_DATASOURCE_PASSWORD` | sí | contraseña de la base |
| `TNS_ADMIN` | sí | ruta al wallet descomprimido **en tu máquina** |
| `WALLET_PASSWORD` | solo si el wallet se descargó con contraseña | — |
| `CORPUS_INDEX_PATH` | no | ruta a `corpus_index.npz`, en cualquier parte del disco — ver `--index` abajo |

Si ya tienes el `.env` de la raíz relleno (el que usa Docker Compose), puedes
reutilizarlo en vez de duplicar credenciales: `--env ../.env`.

## Uso

### `seed_db` — cargar el corpus en la base

Lee `corpus_index.npz` (el índice que exporta `notebook/`) y siembra la tabla
`contents` de la Autonomous Database con un `MERGE` idempotente. Se corre una
vez después de publicar una versión del modelo, no en cada arranque. Se invoca
como módulo, desde la raíz del repo:

```bash
python -m scripts.seed_db --dry-run
python -m scripts.seed_db
```

`--dry-run` valida el índice (dimensiones, campos obligatorios, ids duplicados)
sin tocar la base. Sin él, siembra en lotes y termina verificando que
`VECTOR_DISTANCE` funciona sobre lo que acaba de escribir.

Sin `--index`, la ruta del `corpus_index.npz` sale de `CORPUS_INDEX_PATH` (en
`scripts/.env`) o, si tampoco está, del default `model/corpus_index.npz`. Para
apuntar a otro sitio sin tocar el `.env`:

```bash
python -m scripts.seed_db --index /otra/ruta/corpus_index.npz --dry-run
```

### Estructura

```
seed_db/
├── cli.py        # argparse + orquestación: env → parseo del índice → conexión → seed → verify
├── env.py        # lee scripts/.env y parsea el DSN JDBC
├── corpus.py     # parsea corpus_index.npz en filas listas para el MERGE
└── database.py   # conexión Oracle, el MERGE y la verificación post-seed
```

## Contratos y fronteras

### Por qué este script y no la API

`corpus_index.npz` guarda su `metadata` como un array de objetos pickled de
numpy. La JVM no puede leer eso, así que sembrar la tabla desde el `.npz` tiene
que pasar por Python.

### Las dos rutas que escriben `contents`, y en qué se diferencian

Existe una segunda vía, la API expone
[`POST /admin/seed`](../api/README.md#post-adminseed--carga-masiva-de-corpus):
recibe documentos ya resueltos —con su `embedding`, `cluster_id`, `x`, `y`— en
JSON, y los persiste vía JPA. Ninguna de las dos rutas está completa por sí
sola:

| Ruta | Qué hace | Qué le falta |
|---|---|---|
| `seed_db` (este paquete) | Lee el `.npz` directamente y escribe con `oracledb` | Necesita el wallet y `oracledb` instalados en la máquina que lo corre |
| `POST /admin/seed` | Persiste documentos que ya vienen con embedding, vía JPA | Necesita un cliente que parsee el `.npz` y se lo envíe — **ese cliente no existe todavía** |

Hoy `seed_db` es la única ruta que funciona de punta a punta: lee el `.npz` y
escribe directo en la base, sin pasos intermedios. Cuál de las dos queda como la
canónica es una decisión de arquitectura pendiente, no algo que resuelva este
documento.

### Otras reglas

- Las credenciales son las mismas que usa `api/` (`SPRING_DATASOURCE_*`): una
  sola fuente de verdad, no un usuario aparte para seeding.
- El `MERGE` es re-ejecutable después de un reentrenamiento: el embedding no
  cambia entre reentrenos (el modelo E5 es el mismo), pero `cluster_id`, `x` e
  `y` sí, porque KMeans y UMAP se reajustan cada vez. Publicar un modelo nuevo
  sin volver a sembrar deja filas viejas con coordenadas de la proyección
  anterior.

---
← [README principal](../README.md) · [Cómo contribuir](../CONTRIBUTING.md)
