#!/bin/sh
set -e

echo "=== Aplicando migraciones de Prisma (migrate deploy) ==="
npx prisma@7 migrate deploy

echo "=== Iniciando servidor Backend Express ==="
exec "$@"