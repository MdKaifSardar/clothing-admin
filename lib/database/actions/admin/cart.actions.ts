"use server";

import { connectToDatabase } from "../../connect";
import Cart from "../../models/cart.model";
import { getShirtById } from "./ShirtArea/Shirt/shirt.actions";
import { getUserByMongoId } from "./user/user.actions"; // Updated import

export async function getStaleCarts() {
  await connectToDatabase();
  const now = Date.now();

  const rangeConditions = [
    { updatedAt: { $gte: new Date(now - 9 * 3600000), $lte: new Date(now - 1 * 3600000) } }, // 1 to 9 hours ago
    { updatedAt: { $gte: new Date(now - 12 * 3600000), $lte: new Date(now - 10 * 3600000) } },
    { updatedAt: { $gte: new Date(now - 24 * 3600000), $lte: new Date(now - 22 * 3600000) } },
    { updatedAt: { $gte: new Date(now - 48 * 3600000), $lte: new Date(now - 46 * 3600000) } },
    { updatedAt: { $gte: new Date(now - 72 * 3600000), $lte: new Date(now - 70 * 3600000) } },
  ];

  const carts = await Cart.find({
    "products.0": { $exists: true },
    $or: rangeConditions,
  }).lean();

  const response = await Promise.all(carts.map(async (cart) => {
    const userResp = await getUserByMongoId(cart.user.toString()); // Updated call
    const userEmail = userResp && userResp.user ? userResp.user.email : null;
    const productsDetails = await Promise.all(cart.products.map(async (p: any) => {
      const productResp = await getShirtById(p.product.toString());
      return productResp && productResp.shirt ? productResp.shirt : null;
    }));
    return { userEmail, products: productsDetails };
  }));

  return response;
}

