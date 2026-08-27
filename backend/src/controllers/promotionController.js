import { prisma } from "../lib/prisma.js";
import { createPromotionSchema, updateEstadoSchema } from "../schemas/promotionSchema.js";

// 1. Crear Promoción
export const createPromotion = async (req, res, next) => {
  try {
    const validatedData = createPromotionSchema.parse(req.body);

    // Verificar que el producto exista
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      return res.status(400).json({ error: "El producto especificado no existe" });
    }

    const promotion = await prisma.promotion.create({
      data: {
        nombre: validatedData.nombre,
        productId: validatedData.productId,
        tipoDescuento: validatedData.tipoDescuento,
        valorDescuento: validatedData.valorDescuento,
        fechaInicio: new Date(validatedData.fechaInicio),
        fechaFin: new Date(validatedData.fechaFin),
        estado: "programada",
      },
      include: {
        product: true,
      },
    });

    return res.status(201).json(promotion);
  } catch (error) {
    return next(error);
  }
};

// 2. Listar todas las promociones
export const getPromotions = async (req, res, next) => {
  try {
    const promotions = await prisma.promotion.findMany({
      include: {
        product: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(promotions);
  } catch (error) {
    return next(error);
  }
};

// 3. Cambiar estado (Transición controlada: programada -> activa -> finalizada)
export const updatePromotionEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nuevoEstado } = updateEstadoSchema.parse(req.body);

    const promotion = await prisma.promotion.findUnique({
      where: { id: Number(id) },
    });

    if (!promotion) {
      return res.status(404).json({ error: "Promoción no encontrada" });
    }

    // Regla: Una promoción finalizada no puede modificarse
    if (promotion.estado === "finalizada") {
      return res.status(409).json({ error: "Una promoción en estado 'finalizada' no puede modificarse" });
    }

    // Validar transición permitida:
    // programada -> activa
    // activa -> finalizada
    if (promotion.estado === "programada" && nuevoEstado !== "activa") {
      return res.status(409).json({ error: "Una promoción 'programada' solo puede pasar a 'activa'" });
    }

    if (promotion.estado === "activa" && nuevoEstado !== "finalizada") {
      return res.status(409).json({ error: "Una promoción 'activa' solo puede pasar a 'finalizada'" });
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id: Number(id) },
      data: { estado: nuevoEstado },
      include: { product: true },
    });

    return res.status(200).json(updatedPromotion);
  } catch (error) {
    return next(error);
  }
};

// 4. Eliminar una promoción (Solo si está en estado 'programada')
export const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const promotion = await prisma.promotion.findUnique({
      where: { id: Number(id) },
    });

    if (!promotion) {
      return res.status(404).json({ error: "Promoción no encontrada" });
    }

    if (promotion.estado !== "programada") {
      return res.status(409).json({
        error: "Solo se pueden eliminar promociones en estado 'programada'",
      });
    }

    await prisma.promotion.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Promoción eliminada exitosamente" });
  } catch (error) {
    return next(error);
  }
};

// 5. Vista de resumen (Contadores por estado y vigencia actual)
export const getPromotionsSummary = async (req, res, next) => {
  try {
    const now = new Date();

    const [programadas, activas, finalizadas, vigentesHoy] = await Promise.all([
      prisma.promotion.count({ where: { estado: "programada" } }),
      prisma.promotion.count({ where: { estado: "activa" } }),
      prisma.promotion.count({ where: { estado: "finalizada" } }),
      prisma.promotion.count({
        where: {
          fechaInicio: { lte: now },
          fechaFin: { gte: now },
        },
      }),
    ]);

    return res.status(200).json({
      resumenEstado: {
        programadas,
        activas,
        finalizadas,
        total: programadas + activas + finalizadas,
      },
      vigentesHoy,
    });
  } catch (error) {
    return next(error);
  }
};