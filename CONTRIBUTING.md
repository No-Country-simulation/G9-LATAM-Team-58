# Cómo contribuir

## Ramas

```
feature/tm-NN-descripcion-corta ──PR──> dev ──PR──> main
```

- Nunca push directo a `main`.
- Rebase sobre `dev` antes de abrir el PR.
- Todo PR necesita CI en verde. Un PR a `main` necesita además una aprobación.

## Commits

En inglés, estilo `feat(scope): descripción` / `fix(scope): descripción` /
`refactor(scope): descripción` — coherente con el historial del repo. El
`scope` es la carpeta o el área que cambia (`api`, `web`, `inference`,
`web:dashboard`…).

## Idioma

Código, comentarios, nombres de rama y mensajes de commit: **inglés**, sin
excepción. También la superficie completa de la API — paths, keys JSON,
códigos de error (`VALIDATION_ERROR`).

Solo va en español lo que ve la persona usuaria final: el `message` de los
errores de la API, los ocho valores de categoría (`"Backend"`, `"Datos e
IA"`…) y cada texto de la interfaz web.

## Fronteras entre carpetas

- `web/` llama solo a `api/`. Nunca a `inference/`.
- `api/` orquesta y persiste. No carga modelos ni hace matemáticas.
- `inference/` no toca la base de datos ni guarda el índice del corpus.
- `notebook/` no se despliega — su único output es `model.joblib` y el índice
  del corpus.

Cada carpeta documenta su contrato completo (consume / expone / fronteras) en
su propio README — ver la tabla de la raíz.

## Qué nunca se commitea

`.joblib`, cualquier dataset (`.jsonl`, `.csv`), `.env`, el `wallet/`. Los
`.gitignore` de cada carpeta ya los cubren; si un cambio los necesita, van al
bucket de Object Storage, no al repo.

## Antes de abrir un PR

- [ ] La carpeta que tocaste compila / pasa lint y tests (ver su README).
- [ ] No se filtró ningún archivo de los de arriba (`git status` antes de
      hacer commit).
- [ ] Si el cambio toca un contrato compartido (`model.joblib`, la forma de
      una respuesta de la API, el esquema del `.jsonl`), el equipo ya lo sabe.

## Levantar el proyecto en local

Cada carpeta documenta sus requisitos, instalación, configuración y pruebas en
su propio README: [api/](api/README.md), [inference/](inference/README.md),
[web/](web/README.md), [notebook/](notebook/README.md), [data/](data/README.md).
