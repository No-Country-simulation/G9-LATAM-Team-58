"""Parses corpus_index.npz into row dicts ready to bind against `contents`."""
from __future__ import annotations

import array
import json
import pathlib
import sys

import numpy as np

# Table column limits. Corpus text is not curated for length, so it is checked here
# instead of letting Oracle reject a whole batch because of one long title.
LIMITS = {"id": 100, "title": 500, "category": 50, "source": 100, "url": 1000,
          "language": 10}


def build_rows(index_path: pathlib.Path, limit: int | None) -> tuple[list[dict], dict]:
    """Turns the .npz into bind dictionaries, one per row of `contents`."""
    data = np.load(index_path, allow_pickle=True)
    missing = {"embeddings", "metadata"} - set(data.files)
    if missing:
        raise ValueError(f"{index_path.name}: faltan los arrays {sorted(missing)}")

    embeddings = data["embeddings"]
    metadata = list(data["metadata"])
    if len(embeddings) != len(metadata):
        raise ValueError(f"{index_path.name}: {len(embeddings)} vectores frente a "
                         f"{len(metadata)} metadatos — el índice está desalineado")
    if limit:
        embeddings, metadata = embeddings[:limit], metadata[:limit]

    stats = {"dim": int(embeddings.shape[1]), "total": len(metadata),
             "truncated": {}, "languages": {}, "categories": {}}
    rows, seen = [], set()

    for vector, meta in zip(embeddings, metadata):
        row_id = str(meta["id"])
        if row_id in seen:
            raise ValueError(f"id repetido en el índice: {row_id!r}")
        seen.add(row_id)

        row = {
            "id": row_id,
            "title": str(meta.get("title") or ""),
            "body": str(meta.get("body") or ""),
            "category": _none_if_blank(meta.get("category")),
            # keywords is a list in the artifact and a CLOB in the table.
            "keywords": json.dumps(list(meta.get("keywords") or []), ensure_ascii=False),
            # float32 array is what python-oracledb binds to VECTOR(384, FLOAT32).
            "embedding": array.array("f", np.asarray(vector, dtype="float32").tolist()),
            # Named `cluster` in the artifact: CLUSTER is a reserved word in Oracle.
            "cluster_id": _int_or_none(meta.get("cluster")),
            "x": _float_or_none(meta.get("x")),
            "y": _float_or_none(meta.get("y")),
            "source": _none_if_blank(meta.get("source")),
            "url": _none_if_blank(meta.get("url")),
            "language": _none_if_blank(meta.get("language")),
        }

        for column, cap in LIMITS.items():
            value = row[column]
            if isinstance(value, str) and len(value) > cap:
                stats["truncated"][column] = stats["truncated"].get(column, 0) + 1
                row[column] = value[:cap]

        stats["languages"][row["language"]] = stats["languages"].get(row["language"], 0) + 1
        stats["categories"][row["category"]] = stats["categories"].get(row["category"], 0) + 1
        rows.append(row)

    return rows, stats


def _none_if_blank(value):
    text = str(value).strip() if value is not None else ""
    return text or None


def _int_or_none(value):
    return None if value is None else int(value)


def _float_or_none(value):
    return None if value is None else float(value)


def report(rows: list[dict], stats: dict) -> None:
    print(f"\ndocumentos leídos : {stats['total']}")
    print(f"dimensión         : {stats['dim']}")
    print(f"idiomas           : {dict(sorted(stats['languages'].items(), key=lambda kv: -kv[1]))}")
    print("categorías        :")
    for category, count in sorted(stats["categories"].items(), key=lambda kv: -kv[1]):
        print(f"    {str(category):<18} {count:>6}")

    empty_body = sum(1 for row in rows if not row["body"])
    no_vector = sum(1 for row in rows if len(row["embedding"]) != stats["dim"])
    print(f"\nfilas sin body    : {empty_body}   (contents.body es NOT NULL)")
    print(f"vectores con dimensión distinta: {no_vector}")
    if stats["truncated"]:
        print("\n⚠️  Valores recortados al límite de la columna:")
        for column, count in stats["truncated"].items():
            print(f"    {column:<12} {count:>6} filas -> {LIMITS[column]} caracteres")

    if empty_body:
        print("\n❌ Hay filas sin body y la columna es NOT NULL: la inserción fallaría.")
        sys.exit(1)
    if no_vector:
        print("\n❌ Hay vectores con dimensión inesperada.")
        sys.exit(1)
