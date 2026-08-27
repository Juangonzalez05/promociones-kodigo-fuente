import { ZodError } from "zod";

export const errorHandler = (err, req, res, next) => {
  // Error de validación de esquema (Zod)
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({
      error: "Error de validación",
      details: formattedErrors,
    });
  }

  // Errores de regla de negocio o conflicto de estado
  if (err.status) {
    return res.status(err.status).json({
      error: err.message,
    });
  }

  // Error de Prisma: P2025 (Registro no encontrado)
  if (err.code === "P2025") {
    return res.status(404).json({
      error: "Recurso no encontrado",
    });
  }

  // Error de Prisma: P2003 (Fallo de Clave Foránea / producto inexistente)
  if (err.code === "P2003") {
    return res.status(400).json({
      error: "El producto asociado especificado no existe",
    });
  }

  console.error("Error no controlado:", err);
  return res.status(500).json({
    error: "Error interno del servidor",
  });
};