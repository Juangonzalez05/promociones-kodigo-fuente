import { z } from "zod";

export const createPromotionSchema = z
  .object({
    nombre: z
      .string({ required_error: "El nombre es obligatorio" })
      .trim()
      .min(1, "El nombre no puede estar vacío"),
    productId: z
      .number({ required_error: "El ID del producto es obligatorio" })
      .int("El productId debe ser un número entero")
      .positive("El productId debe ser positivo"),
    tipoDescuento: z.enum(["porcentaje", "monto_fijo"], {
      errorMap: () => ({ message: "El tipo de descuento debe ser 'porcentaje' o 'monto_fijo'" }),
    }),
    valorDescuento: z
      .number({ required_error: "El valor de descuento es obligatorio" })
      .positive("El valor de descuento debe ser mayor a 0"),
    fechaInicio: z
      .string({ required_error: "La fecha de inicio es obligatoria" })
      .datetime({ message: "La fecha de inicio debe ser una ISO string válida (ej: 2026-08-27T00:00:00Z)" }),
    fechaFin: z
      .string({ required_error: "La fecha de fin es obligatoria" })
      .datetime({ message: "La fecha de fin debe ser una ISO string válida (ej: 2026-08-30T23:59:59Z)" }),
  })
  .refine(
    (data) => {
      if (data.tipoDescuento === "porcentaje") {
        return data.valorDescuento >= 1 && data.valorDescuento <= 100;
      }
      return true;
    },
    {
      message: "Si el tipo de descuento es porcentaje, el valor debe estar entre 1 y 100",
      path: ["valorDescuento"],
    }
  )
  .refine(
    (data) => new Date(data.fechaFin) > new Date(data.fechaInicio),
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["fechaFin"],
    }
  );

export const updateEstadoSchema = z.object({
  nuevoEstado: z.enum(["activa", "finalizada"], {
    errorMap: () => ({ message: "El nuevo estado debe ser 'activa' o 'finalizada'" }),
  }),
});