# Tema Mindloom — paleta aplicada (light + dark)

> Estado: **aplicado**. Los tokens de abajo ya viven en `src/styles/index.css`.
> Este documento es la referencia de por qué cada valor es el que es.

Fuente del diseño: proyecto Stitch `7186097773355673907`, design system
`assets/11067529216321209705` ("Mindloom Instrument"). Stitch solo define el modo
**dark**; el **light** se derivó aquí manteniendo el mismo tono y bajando el croma.

## Reglas

1. **Todos los colores en `oklch`.** No introducir hex en `index.css`. La tabla de
   equivalencias de abajo existe solo para poder rastrear un valor hasta Stitch.
2. **No se tocan los componentes de shadcn** (`src/components/ui/**`). Todo el tema
   entra por tokens CSS y por `className` en el código de aplicación.
3. Los colores de categoría se usan **solo en pills, dots y barras**, nunca como fondo
   de panel ni como color de texto de párrafo.

## Superficies y estado

| Token | light | dark | hex de origen (light / dark) |
|---|---|---|---|
| `--background` | `oklch(0.979 0.003 264.5)` | `oklch(0.154 0.009 264.3)` | `#F7F8FA` / `#0A0C10` |
| `--foreground` | `oklch(0.224 0.006 236.8)` | `oklch(0.952 0.006 264.5)` | `#191C1E` / `#EDEFF3` |
| `--card`, `--popover` | `oklch(1 0 0)` | `oklch(0.187 0.013 270.7)` | `#FFFFFF` / `#111319` |
| `--border`, `--input` | `oklch(0.924 0.009 264.5)` | `oklch(0.252 0.018 266.3)` | `#E3E6EC` / `#1E222B` |
| `--muted` | `oklch(0.963 0.003 247.9)` | `oklch(0.218 0.015 266.9)` | `#F1F3F5` / `#171A21` |
| `--muted-foreground` | `oklch(0.551 0.023 264.4)` | `oklch(0.655 0.021 263)` | `#6B7280` / `#8A919E` |
| `--accent` (hover) | `oklch(0.963 0.003 247.9)` | `oklch(0.209 0.019 266.1)` | `#F1F3F5` / `#141821` |
| `--primary`, `--ring` | `oklch(0.526 0.199 268)` | `oklch(0.591 0.204 268.4)` | `#3B5BDB` / `#4C6FF5` |
| `--success` | `oklch(0.643 0.134 164.7)` | `oklch(0.695 0.143 164.9)` | `#0CA678` / `#12B886` |
| `--destructive` | `oklch(0.506 0.193 27.7)` | `oklch(0.712 0.181 22.8)` | `#BA1A1A` / `#FF6B6B` |
| `--sidebar` | `oklch(1 0 0)` | `oklch(0.139 0.008 255.5)` | `#FFFFFF` / `#07090C` |
| `--sidebar-accent` | `oklch(0.963 0.003 247.9)` | `oklch(0.218 0.015 266.9)` | `#F1F3F5` / `#171A21` |

Dos tokens que Stitch usa y shadcn no trae:

| Token | light | dark | para qué |
|---|---|---|---|
| `--outline` | `oklch(0.924 0.009 264.5)` | `oklch(0.305 0.021 265.9)` | borde de elementos interactivos |
| `--text-dim` | `oklch(0.551 0.023 264.4)` | `oklch(0.491 0.021 261.3)` | metadatos mono, contadores |

## Las 8 categorías

Definidas como `--cat-*` y consumidas con el helper `categoryStyle()` de
`src/shared/config/categories.ts`, que expone el color como una variable local `--cat`
para poder escribir `bg-(--cat)/12 border-(--cat)/40 text-(--cat)`.

| Categoría | Variable | light | dark |
|---|---|---|---|
| Backend | `--cat-backend` | `oklch(0.526 0.199 268)` | `oklch(0.591 0.204 268.4)` |
| Frontend | `--cat-frontend` | `oklch(0.644 0.192 41.7)` | `oklch(0.75 0.167 50.5)` |
| Móvil | `--cat-movil` | `oklch(0.529 0.11 164.7)` | `oklch(0.744 0.148 166.4)` |
| Datos e IA | `--cat-datos-ia` | `oklch(0.512 0.218 287.5)` | `oklch(0.658 0.191 292.1)` |
| DevOps y Cloud | `--cat-devops-cloud` | `oklch(0.509 0.087 215.1)` | `oklch(0.72 0.119 211.2)` |
| Bases de datos | `--cat-bases-de-datos` | `oklch(0.616 0.126 87.5)` | `oklch(0.847 0.169 87.1)` |
| Seguridad | `--cat-seguridad` | `oklch(0.546 0.195 26.6)` | `oklch(0.712 0.181 22.8)` |
| Fundamentos | `--cat-fundamentos` | `oklch(0.498 0.02 259.4)` | `oklch(0.682 0.021 252.9)` |

**Ojo con Móvil.** En los primeros mocks era `#12B886`, el mismo verde que el indicador
"modelo OK" de la sidebar, y en pantalla se confundían. Se desplazó a `#20C997`
(`oklch(0.744 0.148 166.4)`) para despegarlo. No volver atrás.

**Backend coincide con `--primary` a propósito**: es la categoría dominante del corpus y
que comparta el azul de marca no genera ambigüedad.

## Tipografía

- **Space Grotesk** (`--font-heading`): títulos. Se aplica sola a los `<h1>` mediante una
  regla en `@layer base`; para el resto, usar `font-heading` por `className`.
- **Inter** (`--font-sans`): todo el cuerpo. Es la fuente por defecto del `html`.
- **IBM Plex Mono** (`--font-mono`): todos los números, IDs, porcentajes y metadatos.

## Detalles visuales

- **Radio**: `--radius` sigue en `0.45rem` (≈ 7px), suficientemente cerca del `brand: 6px`
  de Stitch como para no justificar tocarlo.
- **Item activo de la sidebar**: borde izquierdo de 2px en `--primary`, aplicado desde
  `app-sidebar.tsx` con `data-[active=true]:border-l-2` — el componente shadcn no se toca.
- **Glow del primary**: solo en dark, con la variante `dark:`, en el CTA de análisis y en
  los segmentos llenos de `ConfidenceBar`. En light ensucia, por eso no se aplica.
- **Sin sombras difusas ni gradientes**: la profundidad se construye con superficies
  tonales y bordes de 1px, como en el design system.
