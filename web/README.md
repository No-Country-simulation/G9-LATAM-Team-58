# web/

Interfaz de Mindloom: ingesta, búsqueda, listado, carga CSV y mapa del corpus.
Es la **única capa en español** visible al usuario final.

Habla solo con `api/` (HTTPS, JSON). **Nunca** con `inference/` directamente.

## Requisitos

- Node 22
- pnpm 11

## Instalación

```bash
cd web
pnpm install
```

## Configuración

Dónde vive la API se controla con una sola variable, `VITE_API_URL`. Sin
configurarla: dev usa `http://localhost:8080` y el build de prod usa `/api`
(nginx lo proxea al contenedor `api`).

Para apuntar a otro API (IP pública, VM, otra máquina de la LAN), copia
`.env.example` a `.env.local` (ignorado por git):

```
VITE_API_URL=http://<ip>:8080
```

Sin sufijo `/api` — la API sirve en rutas raíz (`/search`, `/contents`...). El
navegador llama directo al API, lo cual funciona porque `CorsConfig` tiene
`allowedOrigins("*")`.

## Uso

```bash
pnpm dev
```

Build de producción: `pnpm build`, servido por nginx (SPA fallback en
`nginx.conf`).

## Pruebas

```bash
pnpm test            # toda la suite, una vez — es lo que corre CI
pnpm test:watch      # modo watch, para desarrollo
pnpm test:coverage   # informe de cobertura (sin umbral)

pnpm lint
pnpm typecheck
```

Stack: **Vitest + jsdom + Testing Library + MSW**. Los tests van colocados junto
al código que prueban (`format.ts` → `format.test.ts`); el andamiaje compartido
vive en `src/test/`:

| Archivo | Para qué |
|---|---|
| `src/test/setup.ts` | jest-dom, ciclo de vida de MSW, stubs de `matchMedia` y `ResizeObserver` |
| `src/test/render.tsx` | `renderWithProviders`: QueryClient nuevo por test + MemoryRouter + TooltipProvider |
| `src/test/msw/handlers.ts` | respuestas por defecto de la API, tipadas contra `contracts.ts` |

La configuración está en el bloque `test` de `vite.config.ts`, que reutiliza el
alias `@/` y los plugins. Los tests quedan excluidos de `tsconfig.app.json` para
que `pnpm build` no los compile, y cubiertos por `tsconfig.test.json`, que
`pnpm typecheck` sí incluye.

Dos cosas que no son obvias, ambas descubiertas a base de tests en rojo:

- **MSW intercepta por ruta, no por host** (`*/search`). El `VITE_API_URL` de tu
  `.env.local` también se carga en modo test, así que fijar el host en los
  handlers los rompería en la máquina de al lado.
- **`apiClient` usa el adaptador `http` de axios en tests**, fijado en
  `src/test/setup.ts`. Con el adaptador XHR por defecto de jsdom, `msw/node` no
  intercepta de forma fiable y todo falla como `NETWORK_ERROR`.

El job `web` de CI corre `pnpm lint`, `pnpm test` y `pnpm build`: un test en rojo
bloquea el PR.

## Estructura (feature-based)

```
src/
├── main.tsx      # entrada: monta <App />
├── app.tsx       # composition root: providers (QueryClient, Tooltip, Toaster)
├── routes.ts     # createBrowserRouter (data mode), rutas lazy
├── components/   # presentacional compartido: layout/, ui/ (shadcn), form/, data-display/
├── shared/       # no-visual: api/, config/, hooks/, lib/, theme/
├── features/     # analyze, search, contents, batch-upload, cluster-map, dashboard
├── pages/        # thin: leen params y componen features
├── styles/       # index.css (tokens Tailwind v4) + route-loading.css
└── test/         # andamiaje de tests (setup, renderWithProviders, MSW)
```

Reglas:

- Dependencias en una sola dirección: `pages → features → {components, shared}`.
- Un feature nunca importa de otro (excepción documentada: query keys para
  invalidar tras mutaciones — `analyze` y `batch-upload` importan `contentKeys`
  de `contents`).
- Server state = TanStack Query. Zustand solo para UI state.
- `src/shared/api/contracts.ts` es el espejo en TypeScript del contrato público
  de la API: **interfaces planas, sin validación en runtime**. Cada
  `features/*/api.ts` tipa su respuesta contra ellas. Zod solo valida
  formularios, vía el resolver propio de `shared/lib/zod-resolver.ts`.
- Código en inglés; solo las etiquetas visibles al usuario en español.
- Alias `@/` → `src/`.

## Contratos y fronteras

- Mapea las keys/valores en inglés de la API a etiquetas en español para mostrar.
- Vistas: **Ingesta** (categoría, probabilidad, keywords, relacionados),
  **Búsqueda** (semántica o por palabras clave + filtro por categoría),
  **Contenidos** (listado + detalle + relacionados), **Carga CSV** y
  **Mapa del corpus** (scatter 2D por categoría).

---
← [README principal](../README.md) · [Cómo contribuir](../CONTRIBUTING.md)
