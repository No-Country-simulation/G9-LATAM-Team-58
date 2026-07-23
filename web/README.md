# web/

Interfaz de demo: tres vistas (ingesta, búsqueda, mapa del corpus). Es la **única
capa en español** visible al usuario final.

## Consume

- `api/` (HTTPS, JSON). **Nunca** habla con `inference/` directamente.

## Expone

- Build estático servido desde un bucket de Object Storage.

## Fronteras

- Mapea las keys/valores en inglés de la API a etiquetas en español para mostrar.
- Vistas: **Ingesta** (categoría, probabilidad, keywords, relacionados),
  **Búsqueda** (semántica o por palabras clave + filtro por categoría) y
  **Mapa del corpus** (scatter 2D por categoría).
