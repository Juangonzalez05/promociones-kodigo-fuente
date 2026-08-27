#!/bin/sh
set -e

echo "=== Aplicando esquema de base de datos con Prisma ==="
npx prisma db push --accept-data-loss

echo "=== Iniciando servidor Backend Express ==="
exec "$@"