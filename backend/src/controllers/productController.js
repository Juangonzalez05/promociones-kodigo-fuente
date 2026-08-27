import { prisma } from "../lib/prisma.js";

export const getProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });
    return res.status(200).json(products);
  } catch (error) {
    return next(error);
  }
};