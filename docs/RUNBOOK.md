# Cuando algo falla

## Empieza por aquí

Una consulta antes que cualquier otra cosa:

```bash
curl http://localhost:8080/health      # o https://mindloom.lat/api/health
```

`/health` no falla nunca, ni con las dos dependencias caídas. Sondea cada una con
3 segundos de límite y te dice cuál está rota:

```json
{
  "status": "UP",
  "timestamp": "2026-08-11T23:20:20.480429827Z",
  "dependencies": [
    { "name": "inference", "enabled": true, "reachable": true, "latencyMs": 4, "message": null },
    { "name": "database",  "enabled": true, "reachable": true, "latencyMs": 694, "message": null }
  ]
}
```

| Lo que devuelve | Dónde seguir |
|---|---|
| `status: UP` | La API está bien. El problema es la petición: ve a [errores de la API](#la-api-responde-con-un-error) |
| `inference` con `reachable: false` | [Un contenedor no arranca](#un-contenedor-no-arranca) |
| `database` con `reachable: false` | [La base de datos](#la-base-de-datos) |
| `database` con `enabled: false` | La API corre en modo scaffold. Falta el perfil `db` |
| Nada responde | El contenedor de la API está caído: `docker compose ps` |

Los dos comandos siguientes:

```bash
docker compose ps                    # estado y salud de cada contenedor
docker compose logs --tail 50 api inference
```

## La API responde con un error

Todos comparten forma: `{ "error": ..., "message": ..., "timestamp": ... }`.

| Lo que ves | Por qué | Qué haces |
|---|---|---|
| `503` · `Base de datos no configurada. Use app.database.enabled=true` | La API arrancó en modo scaffold, sin los beans de base de datos | arranca con el perfil `db`; en Compose ya viene puesto |
| `503` en `/content` o `/search?mode=semantic`, con `/health` marcando `database: reachable` | inference no responde | mira sus logs; casi siempre es que no cargó el artefacto |
| `400` · `El parámetro 'q' no puede estar vacío` | falta el término de búsqueda | manda `q` con contenido |
| `400` · `Modo de búsqueda inválido: 'X'. Use 'semantic' o 'keyword'` | `mode` mal escrito | solo valen esos dos valores |
| `400` · `El parámetro 'size' no puede superar 100 (recibido: N)` | pediste una página mayor que el tope | pagina con `page`, no con `size` |
| `400` · `El archivo tiene N filas y el máximo es 200` | CSV demasiado grande | pártelo; nada se guardó, el rechazo es completo |
| `400` · `El archivo excede el tamaño máximo permitido` | pasa de 5 MB | pártelo igual |
| `404` · `Contenido no encontrado: X` | ese `id` no está en `contents` | comprueba el identificador |

Llamando a inference directamente:

| Lo que ves | Por qué |
|---|---|
| `503` · `Model Not Found` | el artefacto no está cargado; el servicio arrancó pero aún no puede responder |
| `422` · `Input should be 'query' or 'passage'` | `type` en `/embed` no tiene valor por defecto, y solo acepta esos dos |

## Un contenedor no arranca

| Lo que ves | Por qué | Qué haces |
|---|---|---|
| `inference` muere con `Connection refused` contra `169.254.169.254` | Instance Principal solo funciona dentro de una instancia de OCI. Esa dirección es el servicio de metadatos, y fuera no responde nadie | baja `model.joblib` del bucket y apunta `MODEL_LOCAL_PATH` en `docker-compose.override.yml` |
| `api` se queda esperando sin arrancar | `depends_on` exige que `inference` esté sano | arregla `inference`; lo demás se resuelve solo |
| `ORA-12261: Syntax error in Easy Connect connection string` | `TNS_ADMIN` apunta a una carpeta de tu disco | dentro del contenedor el wallet vive en `/app/wallet`; la ruta del host va en `volumes:` |
| `ORA-12506: TNS:listener rejected connection based on service ACL filtering` | la base tiene la lista de control de acceso habilitada y tu IP no está | añádela en la ficha de la base → *Network* → *Access control list* |
| `cannot load certificate "/etc/nginx/certs/mindloom.pem"` | el Certificado de Origen solo existe en la VM | en local levanta el front con `pnpm dev`; el perfil `web` es para el despliegue |
| `docker: the working directory '/...' is invalid` | Git Bash reescribe las rutas que empiezan por `/` | antepón `MSYS_NO_PATHCONV=1` |
| `ruff` marca `EXE002` en todos los ficheros | el bind mount de Windows los presenta como ejecutables | añade `--ignore EXE002`; en CI no aparece |

## Va lento o se corta

**`524` de Cloudflare justo después de un reinicio.** Cloudflare corta la
conexión al origen a los 100 segundos. Cargar el modelo y resolver la primera
inferencia tardaba más que eso. Ya está cubierto: `inference` hace una inferencia
de calentamiento al arrancar, y por eso tarda unos 50 segundos en quedar
`healthy`. Si vuelve a aparecer, comprueba en los logs que el calentamiento no
esté fallando.

**Una búsqueda por palabras clave tarda más que una semántica.** Es lo esperado.
`mode=keyword` hace `title LIKE %q% OR body LIKE %q%` contra toda la tabla, sin
índice que aproveche. La semántica usa la columna vectorial.

## El despliegue falla

| Lo que ves | Por qué | Qué haces |
|---|---|---|
| `exec format error` al arrancar un contenedor | imagen x86 en una máquina aarch64 | construye en la VM; es lo que hace `deploy.yml` |
| El job falla tras 5 minutos y vuelca logs | la prueba de humo no consiguió respuesta de `/health` | los logs de `api` e `inference` vienen en la misma salida del job |
| La API no responde desde fuera aunque el contenedor está sano | el puerto está cerrado en alguno de los **dos** sitios donde hay que abrirlo | revisa la Security List de la subred **y** las reglas de `iptables` en la VM |
| Dos despliegues a la vez | no ocurre: `concurrency: deploy-vm` los encola | — |

## La base de datos

| Lo que ves | Por qué | Qué haces |
|---|---|---|
| La base aparece **Stopped** sin que nadie la parara | se detiene sola tras 7 días sin conexión | arráncala; una consulta real reinicia el contador |
| El log de arranque dice `Database version: 19.0` | no es la versión del servidor. La consola dice **26ai**, y `VECTOR_DISTANCE` funciona, cosa imposible en 19c | ignora esa línea |
| Flyway falla por `checksum` o porque la tabla ya existe | alguien creó el esquema a mano con un DDL distinto | el esquema lo gobierna Flyway; no ejecutes `CREATE TABLE` propio |
| `CLUSTER is a reserved word` | `cluster` no vale como nombre de columna en Oracle | la columna es `cluster_id` |

Una base detenida 90 días acumulados puede llegar a borrarse.

## El bucket

| Lo que ves | Por qué | Qué haces |
|---|---|---|
| `inference` sirve un modelo que no es el que subiste | `models/latest.txt` apunta a otro prefijo | ese fichero manda; súbelo el último, después de los artefactos |
| No autentica contra el bucket con la policy recién creada | los permisos tardan un par de minutos en propagar | espera y reintenta |

## Mantenerlo vivo

**Nunca pares la instancia A1 con *Stop*.** Un Stop libera el host, y al volver a
arrancarla puede quedarse esperando capacidad. Usa **Reboot**.

**Conéctate a la base de vez en cuando.** Cualquier consulta reinicia el contador
de los 7 días.

**Mira el gasto** en *Billing & Cost Management* → *Cost Analysis*. La VM y la
base están marcadas Always Free, así que el acumulado debería quedarse en cero.
Compruébalo después de cambiar la forma de la instancia: 2 OCPU / 12 GB deja
margen en la cuota, 4 OCPU / 24 GB la consume casi entera.

---
← [Índice de docs](README.md) · [Infraestructura](INFRASTRUCTURE.md)
