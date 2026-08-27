import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(503).json({ status: "error", message: "Sin conexión a la base de datos" });
  }
});

// Rutas de la API
app.use("/products", productRoutes);
app.use("/promotions", promotionRoutes);

// Middleware centralizado de manejo de errores
app.use(errorHandler);

export default app;