# DECISIONS.md

## Stack elegido

| Capa | Elección | Justificación |
|---|---|---|
| Backend | Node.js + Express | Rápido de levantar, ecosistema maduro, fácil de testear con Jest/Supertest |
| Base de datos | PostgreSQL + Prisma ORM | Modelo relacional natural (promoción ↔ producto/categoría); migraciones automáticas; healthcheck trivial |
| Frontend | React + Vite | Requisito del enunciado |
| Contenedores | Docker + docker-compose | Requisito del enunciado |
| CI/CD | GitHub Actions | Requisito del enunciado |

## Por qué PostgreSQL sobre SQL Server / MongoDB

El modelo es claramente relacional (promoción → producto/categoría), Prisma elimina casi todo el SQL manual, y la imagen `postgres:18-alpine` es la más ligera de configurar de las tres.

## Decisiones pendientes de documentar

- **PostgreSQL 18 (`postgres:18-alpine`):** versión estable actual. El volumen se monta en `/var/lib/postgresql` (no en `/var/lib/postgresql/data`) porque la imagen oficial cambió esa ruta a partir de la versión 18.
- **Prisma ORM 7, no 8:** Prisma 8 sigue en release candidate. Se fija `prisma@7` explícitamente en cada comando porque el paquete `prisma` en npm ahora resuelve por defecto a la nueva CLI unificada (v8 RC).
- **Cliente vía adapter (`@prisma/adapter-pg`):** obligatorio desde Prisma 7; `new PrismaClient()` sin adapter falla.
- **Backend como ES Module:** necesario porque el cliente generado (`provider = "prisma-client"`) es ESM-only. Se adoptó `"type": "module"` en `package.json` desde esta fase para no mezclar `require`/`import` más adelante.
- **Una sola tabla `products`** (no polimórfica) relacionada con `promotions` vía `productId`, más los enums nativos `TipoDescuento` y `EstadoPromocion`.
- **`docker-compose.yml` sin la clave `version:`**: quedó obsoleta desde Compose V2; Docker la ignora y puede generar una advertencia de confusión si se deja.


- **Express 5 (5.2.1), no Express 4:** Express 4 está en mantenimiento con fin de soporte planeado para octubre de 2026; un proyecto nuevo arranca sobre la línea activa.
- **ESLint 10 con flat config (`eslint.config.js`):** el formato `.eslintrc.*` fue eliminado por completo en ESLint 10, ya no es una opción.
- **`cross-env` para el script de test:** Jest todavía requiere el flag `--experimental-vm-modules` de Node para soportar ESM, y la sintaxis `VAR=valor comando` de bash no funciona en PowerShell; `cross-env` normaliza esto entre shells.
- **Un único `PrismaClient` reutilizable** en `src/lib/prisma.js`, instanciado con el adapter `@prisma/adapter-pg` definido en la Fase 1.
- **`/health` valida la conexión real a la base de datos** con `prisma.$queryRaw`SELECT 1`` y responde `503` si falla, no solo `200` porque el proceso está corriendo.

- **Zod 3 para validación de esquemas:** Se seleccionó Zod por su soporte nativo de ESM, inferencia limpia de tipos y potente API de refinamientos (`.refine()`), ideal para validar reglas como `fechaFin > fechaInicio` y la restricción del valor de porcentaje entre 1 y 100.
- **Transición estricta de estados (`programada` -> `activa` -> `finalizada`):** Se implementó validación lógica en el controlador lanzando un código `409 Conflict` si se intenta saltar estados o modificar promociones ya finalizadas.
- **Eliminación restrictiva:** Solamente se permite borrar promociones en estado `programada`; en cualquier otro estado devuelve un error de conflicto `409 Conflict`.
- **Vista de resumen optimizada:** La consulta de resumen (`GET /promotions/resumen`) ejecuta de forma paralela (`Promise.all`) la cuantificación de estados y el conteo de promociones cuya vigencia abarca la fecha y hora actual (`lte: now`, `gte: now`).
- **Middleware centralizado de errores:** Captura de forma uniforme las excepciones de Zod (400), fallos de claves foráneas de Prisma (400), recursos no encontrados (404) y errores de conflicto de reglas de negocio (409).

- **Jest 30 + Supertest con ESM y Type-Stripping:** Se configuró Jest utilizando `cross-env NODE_OPTIONS="--experimental-vm-modules --experimental-strip-types"` para habilitar tanto el soporte nativo de ES Modules como la lectura directa de archivos TypeScript (`.ts`) por parte de Node.js v24.19.
- **Isolation y Mocking con `jest.unstable_mockModule`:** Las pruebas unitarias de controladores y middleware utilizan mocks dinámicos de Prisma Client en lugar de requerir una conexión activa a la base de datos, lo que garantiza una suite rápida, aislada e ideal para CI/CD.
- **Cobertura completa de reglas de negocio:** Se crearon tests explícitos para:
  1. `/health` (Respuestas 200 y 503 según la salud de la BD).
  2. Validaciones de Zod (Fechas invertidas, porcentaje > 100, campos nulos).
  3. Transiciones de estado permitidas e intentos ilícitos sobre promociones `finalizadas` (409 Conflict).
  4. Eliminación restrictiva (solo en estado `programada`).
  5. Agregación del endpoint `/promotions/resumen`.

- **Vite con React 19:** Elección obligatoria por los requerimientos del desafío, seleccionando un build tool liviano que habilita Fast Refresh instantáneo en desarrollo y empaquetado optimizado para producción.
- **Manejo declarativo del estado:** Se implementaron componentes divididos por responsabilidad (`SummaryPanel`, `PromotionForm`, `PromotionList`) coordinados por un estado superior en `App.jsx`, reduciendo la complejidad y prescindiendo de librerías pesadas de estado global.
- **Validaciones espejo en la interfaz:** El cliente realiza comprobaciones inmediatas (`fechaFin > fechaInicio` y porcentaje `1-100`) antes de realizar la llamada a la red, reduciendo tráfico innecesario hacia la API.
- **Manejo de errores amigable:** Los fallos devueltos por Express/Zod son capturados por el cliente HTTP centralizado (`api.js`) y desplegados en un panel de alerta superior descartable.
- **Validación al inicio con `validateEnv()`:** Se implementó una verificación imperativa en el arranque del servidor (`src/server.js`) que audita las variables requeridas (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`) y detiene la ejecución (`process.exit(1)`) si alguna no se encuentra definida.
- **Inexistencia de secretos en el repositorio:** Toda credencial sensible permanece en archivos `.env` ignorados por Git, proporcionando únicamente plantillas genéricas `.env.example` en la raíz, backend y frontend.