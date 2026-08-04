# web/

Interfaz de demo: ingesta, búsqueda, listado, carga CSV y mapa del corpus. Es la
**única capa en español** visible al usuario final.

## Consume

- `api/` (HTTPS, JSON). **Nunca** habla con `inference/` directamente. Dónde
  vive el API se controla con una sola variable: `VITE_API_URL`.

## Apuntar al API (`VITE_API_URL`)

Sin configuración: dev usa `http://localhost:8080` y el build de prod usa
`/api` (nginx lo proxea al contenedor `api`). Para apuntar a otro API (IP
pública, VM, otra máquina de la LAN), copia `.env.example` a `.env.local`
(ignorado por git):

```
VITE_API_URL=http://<ip>:8080
```

Sin sufijo `/api` — la API sirve en rutas raíz (`/search`, `/contents`...). El
navegador llama directo al API, lo cual funciona porque `CorsConfig` tiene
`allowedOrigins("*")`.

## Expone

- Build estático servido por nginx (SPA fallback en `nginx.conf`).

## Estructura (feature-based)

```
src/
├── app/          # composition root: main.tsx, providers, routes.ts (data mode), estilos
├── components/   # presentacional compartido: layout/, ui/ (shadcn), form/ (wrappers RHF)
├── shared/       # no-visual: api/ (axios + contratos zod), config/, hooks/, lib/
├── features/     # search, contents, create-content, batch-upload, cluster-map, dashboard
└── pages/        # thin: leen params y componen features
```

Reglas:

- Dependencias en una sola dirección: `pages → features → {components, shared}`.
- Un feature nunca importa de otro (excepción documentada: query keys para
  invalidar tras mutaciones, p.ej. `create-content` invalida `contentKeys`).
- Server state = TanStack Query. Zustand solo para UI state.
- Cada `features/*/api.ts` parsea la respuesta con zod
  (`src/shared/api/contracts.ts`, espejo de `docs/CONTRATOS.md` §3).
- Código en inglés; solo las etiquetas visibles al usuario en español.
- Alias `@/` → `src/`.

## Fronteras

- Mapea las keys/valores en inglés de la API a etiquetas en español para mostrar.
- Vistas: **Ingesta** (categoría, probabilidad, keywords, relacionados),
  **Búsqueda** (semántica o por palabras clave + filtro por categoría),
  **Contenidos** (listado + detalle + relacionados), **Carga CSV** y
  **Mapa del corpus** (scatter 2D por categoría, pendiente de librería).
