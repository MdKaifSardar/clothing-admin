"use server";

import { connectToDatabase } from "@/lib/database/connect";
import Order from "@/lib/database/models/order.model";
import User from "@/lib/database/models/user.model";


// ORDERS:
// calculate today orders, total orders, last week orders, and finally last month orders
export const calculateTotalOrders = async () => {
  try {
    const getDayRange = (date: any) => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    };
    await connectToDatabase();

    const orders = await Order.find({});
    const now = new Date();
    const { start: startOfDay, end: endOfDay } = getDayRange(now);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let totalSales = 0;
    let todaySales = 0;
    let lastWeekSales = 0;
    let lastMonthSales = 0;
    orders.forEach((order) => {
      totalSales = totalSales + order.total;
      if (order.createdAt >= startOfDay && order.createdAt <= endOfDay) {
        todaySales = todaySales + order.total;
      }
      if (order.createdAt >= startOfWeek) {
        lastWeekSales = lastWeekSales + order.total;
      }
      if (order.createdAt >= startOfMonth) {
        lastMonthSales = lastMonthSales + order.total;
      }
    });
    const growthPercentage = (todaySales / (totalSales - todaySales)) * 100;
    return {
      todaySales,
      totalSales,
      lastMonthSales,
      lastWeekSales,
      growthPercentage: growthPercentage.toFixed(2),
    };
  } catch (error: any) {
    console.log(error);
  }
};

// calculates new orders, pending orders, completed orders, canceled orders
export const orderSummary = async () => {
  try {
    await connectToDatabase();

    // count new order documents
    const newOrders = await Order.countDocuments({
      isNew: true,
    });
    const pendingOrders = await Order.countDocuments({
      "products.status": "Not Processed",
    });
    const completedOrders = await Order.countDocuments({
      "products.status": "Completed",
    });
    const cancelledOrders = await Order.countDocuments({
      "products.status": "Cancelled",
    });
    return {
      newOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    };
  } catch (error: any) {
    console.log(error);
  }
};
