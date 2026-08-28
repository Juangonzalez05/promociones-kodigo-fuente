# Justificación de Decisiones Arquitectónicas (DECISIONS.md)

Este documento detalla la justificación técnica detrás de la elección del stack, patrones de diseño y estrategia de infraestructura/CI para el **Módulo de Gestión de Promociones**.

---

## 1. Cuadro Resumen de Arquitectura

| Componente | Tecnología Seleccionada | Alternativas Consideradas | Razón Principal de la Elección |
|---|---|---|---|
| **Backend** | Node.js + Express 5 | Laravel (PHP) | Desarrollo rápido con JS/TS en todo el stack, ecosistema liviano e integración nativa con Docker. |
| **Base de Datos** | PostgreSQL 18 + Prisma ORM 7 | SQL Server, MongoDB | Relaciones estrictas ACID para la consistencia financiera de promociones y excelente integración con Docker. |
| **Frontend** | React 19 + Vite | CRA / Webpack | *Builds* ultrarrápidos, empaquetado optimizado para producciones livianas en Nginx. |
| **Validación** | Zod | Joi / Yup | Tipado inferido estricto y validaciones complejas de negocio (comparación de fechas y rangos). |
| **Pruebas** | Jest + Supertest | Mocha / Chai | Suite completa e integrada para ejecución ágil de pruebas de controladores y esquemas. |

---

## 2. Decisiones Clave de Negocio y Backend

### Manejo de Estados de Promoción (`Programada → Activa → Finalizada`)
* **Modelo de Transiciones Claras:** Se definió un control estricto de estados donde una promoción en `Finalizada` no admite modificaciones.
* **Integridad en Borrados:** Se restringe la eliminación física únicamente a promociones en estado `Programada`. Las promociones activas o finalizadas se preservan para garantizar trazabilidad e historial operacional.

### Capa de Validación (Zod + Middleware de Errores)
* Se implementó validación estricta en la entrada de datos (`promotionSchema.js`) para garantizar que:
  * La `fechaFin` sea estrictamente posterior a `fechaInicio`.
  * Los porcentajes de descuento se mantengan dentro del rango `1` a `100`.
  * Todos los errores de validación retornen respuestas estandarizadas con código HTTP `400 Bad Request`.

---

## 3. Decisiones de Infraestructura y Docker

* **Estrategia Multi-stage en Dockerfiles:**
  * **Backend:** Se separan las etapas de `builder` y `runner` sobre imágenes `node:24-alpine` para garantizar imágenes ligeras y un inicio ágil.
  * **Frontend:** Se compila el bundle estático con Vite en la etapa de construcción y se sirve mediante un contenedor `nginx:alpine` para máximo rendimiento en producción.
* **Sincronización Automática de Base de Datos (`docker-entrypoint.sh`):**
  * Para garantizar que el proyecto funcione al instante mediante `docker compose up --build`, el contenedor backend ejecuta automáticamente el despliegue de migraciones (`prisma migrate deploy`) antes de iniciar el servidor Express.

---

## 4. Pipeline CI/CD (GitHub Actions)

El flujo de integración continua está orquestado en 4 etapas dependientes (`lint → test → build → smoke-test`):

1. **Lint & Test:** Ejecuta la verificación de calidad de código y la suite de pruebas automatizadas antes de intentar cualquier construcción.
2. **Build:** Construye las imágenes de Docker para backend y frontend aisladamente.
3. **Smoke Test (`/health`):** Levanta el stack completo en el runner de GitHub, aguarda la disponibilidad de PostgreSQL y confirma mediante consulta HTTP al endpoint `/health` que la base de datos y la API responden `200 OK`.
4. **Cero Secretos Hardcodeados:** Las credenciales requeridas para los tests de integración se inyectan dinámicamente mediante GitHub Secrets y variables de entorno del sistema.

---

## 5. Resumen de Calidad

* **Compleitud:** 100% de requisitos funcionales y restricciones técnicas cubiertas.
* **Seguridad:** Cero credenciales expuestas en el repositorio.
* **Despliegue:** 1 comando de ejecución (`docker compose up --build`) para ambiente totalmente funcional.