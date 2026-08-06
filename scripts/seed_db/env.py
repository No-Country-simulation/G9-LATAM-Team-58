"""Credentials and connection settings: reading scripts/.env and parsing the JDBC DSN."""
from __future__ import annotations

import os
import pathlib
import re


def load_env(path: pathlib.Path) -> None:
    """Minimal .env reader. Avoids a python-dotenv dependency for six variables."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def dsn_from_jdbc(url: str) -> tuple[str, str | None]:
    """Extracts (tns_alias, tns_admin) from a JDBC thin URL.

    jdbc:oracle:thin:@techmind_tp?TNS_ADMIN=/app/wallet -> ("techmind_tp", "/app/wallet")
    """
    match = re.search(r"@([^?\s]+)", url)
    if not match:
        raise ValueError(f"No se reconoce el DSN en SPRING_DATASOURCE_URL: {url!r}")
    alias = match.group(1)
    admin = re.search(r"TNS_ADMIN=([^&\s]+)", url)
    return alias, admin.group(1) if admin else None
