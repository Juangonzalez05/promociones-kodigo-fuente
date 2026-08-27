import { jest } from "@jest/globals";
import request from "supertest";

// Mock de Prisma
jest.unstable_mockModule("../src/lib/prisma.js", () => ({
  prisma: {
    product: {
      findUnique: jest.fn(),
    },
    promotion: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const { prisma } = await import("../src/lib/prisma.js");
const app = (await import("../src/app.js")).default;

describe("Módulo de Promociones (API POS)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /promotions (Creación y Validaciones)", () => {
    test("Debe rechazar la creación si faltan campos obligatorios", async () => {
      const response = await request(app).post("/promotions").send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Error de validación");
    });

    test("Debe rechazar si la fechaFin es anterior a fechaInicio", async () => {
      const payload = {
        nombre: "Promo Invalida Fechas",
        productId: 1,
        tipoDescuento: "monto_fijo",
        valorDescuento: 5000,
        fechaInicio: "2026-09-10T00:00:00Z",
        fechaFin: "2026-09-01T00:00:00Z",
      };

      const response = await request(app).post("/promotions").send(payload);

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "fechaFin",
            message: "La fecha de fin debe ser posterior a la fecha de inicio",
          }),
        ])
      );
    });

    test("Debe rechazar un porcentaje fuera del rango 1-100", async () => {
      const payload = {
        nombre: "Promo Porcentaje Alto",
        productId: 1,
        tipoDescuento: "porcentaje",
        valorDescuento: 150,
        fechaInicio: "2026-09-01T00:00:00Z",
        fechaFin: "2026-09-10T00:00:00Z",
      };

      const response = await request(app).post("/promotions").send(payload);

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "valorDescuento",
            message: "Si el tipo de descuento es porcentaje, el valor debe estar entre 1 y 100",
          }),
        ])
      );
    });

    test("Debe crear la promoción exitosamente si todo es válido", async () => {
      const payload = {
        nombre: "Descuento Especial",
        productId: 1,
        tipoDescuento: "porcentaje",
        valorDescuento: 15,
        fechaInicio: "2026-09-01T00:00:00Z",
        fechaFin: "2026-09-10T00:00:00Z",
      };

      prisma.product.findUnique.mockResolvedValueOnce({ id: 1, nombre: "Camiseta" });
      prisma.promotion.create.mockResolvedValueOnce({
        id: 1,
        ...payload,
        estado: "programada",
        fechaInicio: new Date(payload.fechaInicio),
        fechaFin: new Date(payload.fechaFin),
      });

      const response = await request(app).post("/promotions").send(payload);

      expect(response.status).toBe(201);
      expect(response.body.nombre).toBe("Descuento Especial");
      expect(response.body.estado).toBe("programada");
    });
  });

  describe("PATCH /promotions/:id/estado (Transiciones de Estado)", () => {
    test("Debe permitir transición de 'programada' a 'activa'", async () => {
      prisma.promotion.findUnique.mockResolvedValueOnce({
        id: 1,
        estado: "programada",
      });
      prisma.promotion.update.mockResolvedValueOnce({
        id: 1,
        estado: "activa",
      });

      const response = await request(app)
        .patch("/promotions/1/estado")
        .send({ nuevoEstado: "activa" });

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe("activa");
    });

    test("Debe rechazar modificar una promoción en estado 'finalizada'", async () => {
      prisma.promotion.findUnique.mockResolvedValueOnce({
        id: 1,
        estado: "finalizada",
      });

      const response = await request(app)
        .patch("/promotions/1/estado")
        .send({ nuevoEstado: "activa" });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("Una promoción en estado 'finalizada' no puede modificarse");
    });
  });

  describe("DELETE /promotions/:id (Eliminación Restringida)", () => {
    test("Debe permitir eliminar si la promoción está 'programada'", async () => {
      prisma.promotion.findUnique.mockResolvedValueOnce({
        id: 1,
        estado: "programada",
      });
      prisma.promotion.delete.mockResolvedValueOnce({});

      const response = await request(app).delete("/promotions/1");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Promoción eliminada exitosamente");
    });

    test("Debe rechazar la eliminación si la promoción está 'activa'", async () => {
      prisma.promotion.findUnique.mockResolvedValueOnce({
        id: 1,
        estado: "activa",
      });

      const response = await request(app).delete("/promotions/1");

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("Solo se pueden eliminar promociones en estado 'programada'");
    });
  });

  describe("GET /promotions/resumen", () => {
    test("Debe retornar los contadores correctos por estado y vigencia", async () => {
      prisma.promotion.count
        .mockResolvedValueOnce(3) // programadas
        .mockResolvedValueOnce(2) // activas
        .mockResolvedValueOnce(1) // finalizadas
        .mockResolvedValueOnce(2); // vigentesHoy

      const response = await request(app).get("/promotions/resumen");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        resumenEstado: {
          programadas: 3,
          activas: 2,
          finalizadas: 1,
          total: 6,
        },
        vigentesHoy: 2,
      });
    });
  });
});