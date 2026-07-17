# TechMind

**Organización inteligente del conocimiento técnico.**

TechMind ingiere contenido técnico —documentación, artículos, cursos, apuntes,
tutoriales— y lo organiza automáticamente: identifica su categoría, extrae
palabras clave, encuentra contenidos relacionados y permite búsqueda semántica.

No es solo un clasificador: es una **base de conocimiento que crece**. Cada
contenido que entra queda indexado y es inmediatamente recomendable para los
siguientes.

## El problema

Estudiantes y profesionales de tecnología consumen a diario grandes volúmenes de
contenido técnico, y organizarlo, localizarlo y reutilizarlo después cuesta tiempo
y esfuerzo. TechMind transforma ese volumen de información en conocimiento
estructurado y fácilmente accesible.

## Qué hace

- **Clasificación temática** — asigna cada contenido a una de 8 categorías.
- **Extracción de palabras clave** — identifica los términos más relevantes.
- **Contenidos relacionados** — recomienda material semánticamente parecido.
- **Búsqueda semántica** — encuentra por significado, no solo por coincidencia de palabras.
- **Mapa del conocimiento** — visualiza todo el corpus en 2D, coloreado por categoría.
- **Base que crece** — indexado incremental: cada nuevo contenido enriquece las recomendaciones.

## Categorías

Backend · Frontend · Móvil · Datos e IA · DevOps y Cloud · Bases de datos ·
Seguridad · Fundamentos

## Cómo funciona

Una API REST recibe el contenido y lo entrega a un modelo de Ciencia de Datos que
lo clasifica y lo representa mediante embeddings vectoriales multilingües. El
resultado se devuelve en formato JSON y queda persistido e indexado, listo para
búsqueda y recomendación.

## Stack

- **Ciencia de Datos** — Python, scikit-learn, sentence-transformers
- **API** — Java, Spring Boot
- **Servicio de inferencia** — Python, FastAPI
- **Web** — React, Vite
- **Infraestructura** — Docker, PostgreSQL, Oracle Cloud Infrastructure (OCI)

## Estructura

| Carpeta | Qué hay |
|---|---|
| [api/](api/) | API REST (Java · Spring Boot): valida, orquesta y persiste; expone los endpoints públicos. |
| [inference/](inference/) | Servicio de inferencia (Python · FastAPI): embeddings, clasificación y similitud. |
| [web/](web/) | Interfaz web (React · Vite): ingesta, búsqueda y mapa del corpus. |
| [data/](data/) | Construcción del corpus: extracción, limpieza y etiquetado. |
| [notebook/](notebook/) | EDA, entrenamiento y evaluación; serializa el modelo (Colab). |
| [docs/](docs/) | Especificación del proyecto, brief del reto y guías de infraestructura. |

Cada carpeta tiene su propio `README.md` con el detalle de qué consume y qué expone.
