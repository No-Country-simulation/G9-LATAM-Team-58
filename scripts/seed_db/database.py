"""Oracle connection, the MERGE that seeds `contents`, and post-seed verification."""
from __future__ import annotations

import os
import pathlib
import sys

from .env import dsn_from_jdbc

MERGE_SQL = """
MERGE INTO contents t
USING (SELECT :id AS id FROM dual) s
ON (t.id = s.id)
WHEN MATCHED THEN UPDATE SET
    t.title      = :title,
    t.body       = :body,
    t.category   = :category,
    t.keywords   = :keywords,
    t.embedding  = :embedding,
    t.cluster_id = :cluster_id,
    t.x          = :x,
    t.y          = :y,
    t.source     = :source,
    t.url        = :url,
    t.language   = :language
WHEN NOT MATCHED THEN INSERT
    (id, title, body, category, keywords, embedding, cluster_id, x, y,
     source, url, language)
VALUES
    (:id, :title, :body, :category, :keywords, :embedding, :cluster_id, :x, :y,
     :source, :url, :language)
"""


def connect():
    import oracledb

    url = os.environ.get("SPRING_DATASOURCE_URL")
    user = os.environ.get("SPRING_DATASOURCE_USERNAME")
    password = os.environ.get("SPRING_DATASOURCE_PASSWORD")
    if not (url and user and password):
        print("❌ Faltan credenciales. Rellena en scripts/.env:")
        print("     SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, "
              "SPRING_DATASOURCE_PASSWORD")
        sys.exit(1)

    dsn, tns_admin = dsn_from_jdbc(url)
    tns_admin = os.environ.get("TNS_ADMIN") or tns_admin
    if not tns_admin:
        print("❌ No hay TNS_ADMIN. Debe apuntar a la carpeta del wallet descomprimido.")
        sys.exit(1)
    if not pathlib.Path(tns_admin).exists():
        print(f"❌ La ruta del wallet no existe: {tns_admin}")
        print("   Si el .env es el de la VM, la ruta es la de allí, no la de tu máquina.")
        sys.exit(1)

    print(f"conectando a {dsn} (wallet: {tns_admin})...")
    return oracledb.connect(
        user=user, password=password, dsn=dsn,
        config_dir=tns_admin, wallet_location=tns_admin,
        wallet_password=os.environ.get("WALLET_PASSWORD"),
    )


def seed(connection, rows: list[dict], batch_size: int) -> None:
    import oracledb

    cursor = connection.cursor()
    # The VECTOR bind type has to be declared: without this, executemany infers it
    # from the first row and rejects the array.
    cursor.setinputsizes(embedding=oracledb.DB_TYPE_VECTOR)

    written = 0
    for start in range(0, len(rows), batch_size):
        batch = rows[start:start + batch_size]
        cursor.executemany(MERGE_SQL, batch)
        connection.commit()
        written += len(batch)
        print(f"  {written}/{len(rows)} filas", end="\r", flush=True)
    print(f"  {written}/{len(rows)} filas escritas")


def verify(connection, expected_dim: int) -> None:
    """Checks the table is usable, not just populated."""
    cursor = connection.cursor()

    total, = cursor.execute("SELECT COUNT(*) FROM contents").fetchone()
    with_vector, = cursor.execute(
        "SELECT COUNT(*) FROM contents WHERE embedding IS NOT NULL").fetchone()
    print(f"\nfilas en contents      : {total}")
    print(f"filas con embedding    : {with_vector}")

    if with_vector == 0:
        print("❌ Ninguna fila tiene vector: la búsqueda por similitud no devolverá nada.")
        sys.exit(1)

    # The real check: a vector search has to run and rank. Counting rows only proves
    # they are there, not that the column is usable by VECTOR_DISTANCE.
    sample_id, = cursor.execute(
        "SELECT id FROM contents WHERE embedding IS NOT NULL FETCH FIRST 1 ROWS ONLY"
    ).fetchone()
    hits = cursor.execute("""
        SELECT id, category,
               VECTOR_DISTANCE(embedding,
                               (SELECT embedding FROM contents WHERE id = :id),
                               COSINE) AS distance
        FROM contents
        WHERE embedding IS NOT NULL
        ORDER BY distance
        FETCH FIRST 5 ROWS ONLY
    """, id=sample_id).fetchall()

    print(f"\nVECTOR_DISTANCE desde {sample_id!r}:")
    for row_id, category, distance in hits:
        print(f"    {distance:.4f}  [{category}]  {row_id}")
    if hits[0][0] != sample_id:
        print("⚠️  El documento más cercano a sí mismo no es él: revisa el orden de "
              "los vectores frente a los metadatos.")
    else:
        print("✅ la búsqueda vectorial funciona sobre los datos sembrados")
