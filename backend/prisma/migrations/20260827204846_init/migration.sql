-- CreateEnum
CREATE TYPE "TipoDescuento" AS ENUM ('porcentaje', 'monto_fijo');

-- CreateEnum
CREATE TYPE "EstadoPromocion" AS ENUM ('programada', 'activa', 'finalizada');

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "tipo_descuento" "TipoDescuento" NOT NULL,
    "valor_descuento" DECIMAL(65,30) NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoPromocion" NOT NULL DEFAULT 'programada',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
