"""Seeds the `contents` table from corpus_index.npz. See scripts/README.md."""
from __future__ import annotations

import argparse
import os
import pathlib
import sys

from .corpus import build_rows, report
from .database import connect, seed, verify
from .env import load_env

DEFAULT_INDEX = pathlib.Path("model/corpus_index.npz")
DEFAULT_ENV = pathlib.Path(__file__).resolve().parent.parent / ".env"


def resolve_index_path(cli_value: pathlib.Path | None) -> pathlib.Path:
    """--index flag > CORPUS_INDEX_PATH in scripts/.env > default relative path."""
    if cli_value is not None:
        return cli_value
    env_value = os.environ.get("CORPUS_INDEX_PATH")
    return pathlib.Path(env_value) if env_value else DEFAULT_INDEX


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--index", type=pathlib.Path, default=None,
                        help="ruta del corpus_index.npz (default: CORPUS_INDEX_PATH "
                             "en scripts/.env, o model/corpus_index.npz)")
    parser.add_argument("--env", type=pathlib.Path, default=DEFAULT_ENV,
                        help="fichero de variables de entorno (default: scripts/.env)")
    parser.add_argument("--dry-run", action="store_true",
                        help="valida el índice y no toca la base de datos")
    parser.add_argument("--limit", type=int,
                        help="sembrar solo las primeras N filas (prueba de humo)")
    parser.add_argument("--batch-size", type=int, default=500)
    args = parser.parse_args()

    load_env(args.env)
    index_path = resolve_index_path(args.index)

    if not index_path.exists():
        print(f"❌ No se encuentra {index_path}")
        print("   Genera el artefacto con notebook/TechMind_02_Model_Training.ipynb")
        sys.exit(1)

    print(f"leyendo {index_path} ({index_path.stat().st_size / 1e6:.2f} MB)...")
    rows, stats = build_rows(index_path, args.limit)
    report(rows, stats)

    if args.dry_run:
        print("\n(--dry-run) No se ha escrito nada. Ejemplo de la primera fila:")
        example = dict(rows[0])
        example["body"] = example["body"][:70] + "..."
        example["embedding"] = f"<{len(rows[0]['embedding'])} float32>"
        for key, value in example.items():
            print(f"    {key:<12} {value}")
        return

    connection = connect()
    try:
        print(f"\nsembrando {len(rows)} filas en lotes de {args.batch_size}...")
        seed(connection, rows, args.batch_size)
        verify(connection, stats["dim"])
    finally:
        connection.close()
