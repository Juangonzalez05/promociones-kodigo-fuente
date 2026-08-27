import { Router } from "express";
import {
  createPromotion,
  getPromotions,
  updatePromotionEstado,
  deletePromotion,
  getPromotionsSummary,
} from "../controllers/promotionController.js";

const router = Router();

// Importante: /resumen debe ir antes de cualquier parámetro dinámico para evitar colisión de rutas
router.get("/resumen", getPromotionsSummary);
router.post("/", createPromotion);
router.get("/", getPromotions);
router.patch("/:id/estado", updatePromotionEstado);
router.delete("/:id", deletePromotion);

export default router;