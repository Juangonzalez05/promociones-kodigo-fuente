import { jest } from "@jest/globals";
import request from "supertest";

// Mock de Prisma
jest.unstable_mockModule("../src/lib/prisma.js", () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

const { prisma } = await import("../src/lib/prisma.js");
const app = (await import("../src/app.js")).default;

describe("GET /health", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Debe responder 200 OK con status 'ok' cuando la BD está conectada", async () => {
    prisma.$queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  test("Debe responder 503 Service Unavailable si la BD falla", async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error("Database connection error"));

    const response = await request(app).get("/health");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: "error",
      message: "Sin conexión a la base de datos",
    });
  });
});