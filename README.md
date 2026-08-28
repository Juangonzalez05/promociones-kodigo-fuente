# Módulo de Gestión de Promociones — Kódigo Fuente

Aplicación web para registrar y gestionar promociones de productos, controlando su estado (`Programada → Activa → Finalizada`) y su vigencia.

## Stack

- **Backend:** Node.js + Express 5 + Prisma ORM 7 (adapter `@prisma/adapter-pg`)
- **Base de datos:** PostgreSQL 18
- **Frontend:** React 19 + Vite
- **Contenedores:** Docker + docker-compose
- **CI/CD:** GitHub Actions (lint → test → build → smoke test)

Justificación completa de cada decisión en [`DECISIONS.md`](./DECISIONS.md).

## Requisitos previos

- Docker Desktop (con el backend WSL2 en Windows)
- Node.js v24+ (solo si quieres correr algo fuera de Docker)

## Levantar el proyecto

1. Copia `.env.example` a `.env` y completa las contraseñas:

```powershell
   Copy-Item .env.example .env
```

2. Levanta todo con un solo comando:

```powershell
   docker compose up --build
```

   Esto levanta PostgreSQL, aplica las migraciones automáticamente, arranca el backend en `http://localhost:4000` y el frontend en `http://localhost:80`.

3. Abre `http://localhost` en el navegador.

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado de la app y su conexión a la BD |
| GET | `/products` | Lista de productos disponibles |
| GET | `/promotions` | Lista de promociones |
| POST | `/promotions` | Crear una promoción |
| PATCH | `/promotions/:id/estado` | Cambiar el estado de una promoción |
| DELETE | `/promotions/:id` | Eliminar una promoción (solo en estado `Programada`) |
| GET | `/promotions/resumen` | Contadores por estado y vigencia actual |

## Correr los tests

```powershell
cd backend
npm run test
```

## Variables de entorno

Ver `.env.example` para la lista completa. Ninguna credencial real está en el repositorio.