import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.product.createMany({
    data: [
      { nombre: "Camiseta básica" },
      { nombre: "Zapatillas running" },
      { nombre: "Chaqueta impermeable" },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => console.log("Seed completado exitosamente"))
  .catch((error) => {
    console.error("Error al ejecutar el seed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());