# Proyecto 1: TechMind – Organización Inteligente del Conocimiento Técnico

## Sector empresarial

Educación / Tecnología / Productividad — plataformas de aprendizaje, comunidades
técnicas y profesionales que consumen grandes volúmenes de contenido
(documentación, cursos, artículos, videos y anotaciones) y necesitan organizar,
buscar y reutilizar el conocimiento de forma eficiente.

## Descripción del proyecto

Crear una solución que permita la organización inteligente de contenido técnico,
facilitando su clasificación, consulta y reutilización.

La solución debe recibir textos técnicos (por ejemplo: descripciones de artículos,
documentación, anotaciones de estudio, contenidos de cursos, tutoriales o
materiales de referencia) y utilizar técnicas de Ciencia de Datos para identificar
información relevante sobre ese contenido.

Los equipos podrán explorar diferentes enfoques, tales como:

- Clasificación temática del contenido;
- Identificación de palabras clave;
- Agrupamiento por temas similares;
- Recomendación de contenidos relacionados;
- Organización automática de bases de conocimiento.

El resultado deberá estar disponible en formato JSON para su consumo por otras
aplicaciones. Este tipo de solución puede ser utilizado por plataformas educativas,
comunidades técnicas, empresas o profesionales que deseen construir repositorios
inteligentes de conocimiento.

Opcionalmente, la solución puede complementarse con una interfaz sencilla para el
registro, búsqueda o consulta de los contenidos procesados. La solución deberá
integrarse con los servicios de OCI para almacenamiento de modelos, documentos,
despliegue de APIs y/o persistencia de datos.

## Necesidad del cliente (explicación no técnica)

Los profesionales y estudiantes de tecnología consumen a diario una gran cantidad
de contenido técnico, lo que hace difícil organizar, localizar y reutilizar esa
información posteriormente.

La solución debe permitir:

- Organizar contenidos de forma automática;
- Facilitar búsquedas por temas o tópicos;
- Encontrar contenidos relacionados;
- Reducir el esfuerzo manual de catalogación;
- Construir una base de conocimiento reutilizable.

Esta solución permite transformar grandes volúmenes de información en conocimiento
estructurado y fácilmente accesible.

## Validación de mercado

Las herramientas de gestión del conocimiento son ampliamente utilizadas por
empresas, equipos técnicos y plataformas educativas.

Las soluciones que automatizan la organización de contenidos pueden:

- Reducir el tiempo dedicado a la búsqueda de información;
- Mejorar la productividad;
- Facilitar el intercambio de conocimiento;
- Apoyar procesos de aprendizaje continuo;
- Escalar repositorios de conocimiento de forma eficiente.

Incluso soluciones simples pueden generar valor al automatizar tareas repetitivas y
mejorar el acceso a la información.

## Expectativa para este Hackathon

### Objetivo

Entregar un MVP funcional que permita organizar y enriquecer contenidos técnicos
utilizando técnicas de Ciencia de Datos e integración con una API.

### Alcance recomendado

Los equipos podrán trabajar con uno o más enfoques, tales como:

- Clasificación de contenido;
- Agrupamiento de documentos;
- Extracción de palabras clave;
- Búsqueda semántica;
- Recomendación de contenidos relacionados.

La integración entre la aplicación y el modelo de Ciencia de Datos deberá ser
definida por el equipo, considerando la arquitectura adoptada para la solución. Se
recomienda que la integración se realice de forma que permita el consumo del modelo
a través de la API desarrollada para el proyecto.

### Resultados esperados

**Notebook del equipo de Ciencia de Datos (Jupyter/Colab):**

- Exploración y limpieza de datos (EDA);
- Tratamiento de textos;
- Transformación de datos al formato adecuado para modelado;
- Entrenamiento y evaluación de modelos;
- Métricas de desempeño apropiadas para la solución propuesta;
- Serialización del modelo (joblib/pickle).

**Aplicación Back-End (API REST):**

- API con endpoints relacionados con la solución desarrollada;
- Recepción de contenido para procesamiento;
- Retorno de los resultados generados por el modelo;
- Validación de entrada;
- Manejo de errores.

**Integración con OCI — Sugerencias de uso:**

- Object Storage para almacenamiento de modelos o documentos;
- OCI Compute para alojamiento de la aplicación;
- OCI Functions para procesamiento específico;
- Base de datos opcional para persistencia.

**Documentación mínima (README):**

- Cómo ejecutar el proyecto;
- Cómo utilizar la API;
- Ejemplos de solicitud y respuesta;
- Dependencias y versiones utilizadas.

### Demostración funcional

Presentar la solución en funcionamiento y explicar cómo los modelos utilizados
generan los resultados.

## Funcionalidades requeridas (MVP)

El servicio debe exponer al menos un endpoint capaz de recibir contenido técnico y
retornar información procesada por la solución desarrollada.

**Ejemplo — Entrada:**

```
POST /contenido
```

```json
{
  "titulo": "Introducción a Spring Boot",
  "texto": "En este contenido se presentan los conceptos básicos para la creación de APIs REST utilizando Java y Spring Boot."
}
```

**Salida:**

```json
{
  "categoria": "Backend",
  "probabilidad": 0.89,
  "informacion_adicional": [
    "Java",
    "Spring Boot",
    "API REST"
  ]
}
```

> La estructura final de la respuesta podrá variar según el enfoque elegido por el
> equipo.

**Requisitos:**

- Modelo entrenado y cargado;
- Procesamiento funcional del contenido;
- API operativa;
- Integración con OCI;
- Mínimo de tres ejemplos de uso;
- Documentación funcional.

**Recursos opcionales:**

- Recomendación de contenidos relacionados;
- Búsqueda por palabras clave;
- Procesamiento en lote (CSV);
- Dashboard sencillo;
- Persistencia de resultados;
- Contenedorización con Docker;
- Pruebas automatizadas;
- Explicabilidad del modelo;
- Búsqueda semántica;
- Consulta por categorías.

## Directrices técnicas para estudiantes

### Ciencia de Datos

Cada equipo deberá construir su propia base de contenidos. Los datos podrán ser
obtenidos de fuentes públicas, extraídos de documentaciones o producidos por el
propio equipo.

Sugerencias de tecnologías: Python, Pandas, Scikit-Learn, TF-IDF, Regresión
Logística, Técnicas de similaridad textual. El uso de otros enfoques y modelos está
permitido.

### Back-End

Desarrollar una API REST utilizando las tecnologías trabajadas durante la
formación. La API deberá recibir los datos de entrada, consumir el modelo de Ciencia
de Datos, retornar respuestas en JSON, realizar validaciones y manejo de errores, y
exponer los endpoints necesarios. La arquitectura utilizada quedará a criterio del
equipo y deberá ser documentada.

### OCI

La solución debe utilizar al menos un servicio de OCI como parte obligatoria del
proyecto.
