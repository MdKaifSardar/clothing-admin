"use server";

import OrderModel from "@/lib/database/models/order.model";
import User from "@/lib/database/models/user.model";
import mongoose from "mongoose";
import { unstable_cache } from "next/cache";
import { connectToDatabase } from "@/lib/database/connect";
import ShirtModel from "@/lib/database/models/shirtModel/ShirtModel";
import { fetchUserById } from "@/lib/database/actions/admin/user/user.actions";

const { ObjectId } = mongoose.Types;

export async function createOrder(
  products: {
    product: string;
    name: string;
    image: string;
    size: string;
    qty: number;
    color: { color: string; image: string };
    price: number;
    status: string;
    productCompletedAt: Date | null;
    _id: string;
  }[],
  shippingAddress: {
    phoneNumber: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  },
  paymentMethod: "paypal" | "cash_on_delivery",
  total: number,
  totalBeforeDiscount: number,
  couponApplied: string,
  userId: string,
  totalSaved: number
) {
  try {
    await connectToDatabase();

    // If userId is not a valid ObjectId, assume it's a clerkId.
    let user;
    if (ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ clerkId: userId });
    }

    if (!user) {
      return {
        message: "User not found with provided ID!",
        success: false,
        orderId: null,
      };
    }

    const newOrder = await new OrderModel({
      user: user._id,
      products: products.map((product) => ({
        product: product._id,
        qty: product.qty.toString(),
        price: product.price,
      })),
      orderAddress: {
        ...shippingAddress,
        active: true,
      },
      paymentMethod,
      cartTotal: total,
      totalAfterDiscount: totalBeforeDiscount,
      // For cash on delivery orders, we confirm immediately and use pending status
      orderConfirmation: paymentMethod === "cash_on_delivery" ? true : false,
      deliveryStatus: "pending",
      price: total,
      deliveryCost: 0,
      // For cash on delivery, set paymentTime at order placement; others can update later
      paymentTime: new Date(),
      // If cash_on_delivery, receipt shows a default note
      receipt:
        paymentMethod === "cash_on_delivery" ? "Cash payment pending" : "",
    }).save();

    // Add the order to the user's orders array
    user.orders = user.orders || [];
    user.orders.push(newOrder._id);
    await user.save();

    return {
      message: "Order created successfully",
      orderId: JSON.parse(JSON.stringify(newOrder._id)),
      success: true,
    };
  } catch (error: any) {
    console.error("Error creating order:", error);
    return {
      message: error.message || "Failed to create order",
      success: false,
      orderId: null,
    };
  }
}

export const getOrderDetailsById = unstable_cache(
  async (orderId: string) => {
    try {
      if (!ObjectId.isValid(orderId)) {
        return {
          message: "Invalid order ID format",
          success: false,
        };
      }

      await connectToDatabase();

      const order = await OrderModel.findById(orderId).populate(
        "products.product"
      );

      if (!order) {
        return {
          message: "Order not found",
          success: false,
        };
      }

      const userResult = await fetchUserById(order.userid);
      if (!userResult.success) {
        return {
          message: "User not found",
          success: false,
        };
      }

      return {
        order: JSON.parse(JSON.stringify(order)),
        user: userResult.user,
        success: true,
      };
    } catch (error: any) {
      return {
        message: error.message || "Failed to fetch order details",
        success: false,
      };
    }
  },
  ["order_details"],
  {
    revalidate: 300,
  }
);

export async function updateOrderPaymentStatus(
  orderId: string,
  paypalTransactionId: string
) {
  try {
    await connectToDatabase();

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        orderConfirmation: true,
        receipt: paypalTransactionId,
        paymentTime: new Date(),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return {
        message: "Order not found",
        success: false,
      };
    }

    return {
      message: "Payment status updated successfully",
      success: true,
      order: JSON.parse(JSON.stringify(updatedOrder)),
    };
  } catch (error: any) {
    return {
      message: error.message || "Failed to update payment status",
      success: false,
    };
  }
}

export async function getUserOrders(userId: string) {
  try {
    await connectToDatabase();

    const orders = await OrderModel.find({ user: userId })
      .populate("products.product")
      .sort({ paymentTime: -1 });

    return {
      orders: JSON.parse(JSON.stringify(orders)),
      success: true,
    };
  } catch (error: any) {
    return {
      message: error.message || "Failed to fetch user orders",
      success: false,
      orders: [],
    };
  }
}

export async function updateOrderDeliveryStatus(
  orderId: string,
  newStatus: "pending" | "shipped" | "delivered"
) {
  try {
    await connectToDatabase();

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      { deliveryStatus: newStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return {
        message: "Order not found",
        success: false,
      };
    }

    return {
      message: "Delivery status updated successfully",
      success: true,
      order: JSON.parse(JSON.stringify(updatedOrder)),
    };
  } catch (error: any) {
    return {
      message: error.message || "Failed to update delivery status",
      success: false,
    };
  }
}

export const fetchOrders = async () => {
  try {
    // Connect to the database
    await connectToDatabase();
    console.log("Connected to database");

    // Fetch orders from the database, populate the 'products' field
    const orders = await OrderModel.find()
      .populate({
        path: "products",
        model: ShirtModel,
        select: "name price",
      })
      .lean();

    // Fetch user details for each order
    const ordersWithUserDetails = await Promise.all(
      orders.map(async (order) => {
        const userDetails = await fetchUserById(order.userid);

        return {
          orderId: (order._id as mongoose.Types.ObjectId).toString(),
          products: order.products
            .filter((product: any) => product.product) // Filter out null products
            .map((product: any) => ({
              productId: product.product.toString(),
              qty: product.qty,
              price: product.price,
            })),
          user: userDetails.success ? userDetails.user : null, // Include user details if found
          cartTotal: order.cartTotal,
          totalAfterDiscount: order.totalAfterDiscount,
          orderConfirmation: order.orderConfirmation,
          deliveryStatus: order.deliveryStatus,
          price: order.price,
          deliveryCost: order.deliveryCost,
          paymentMethod: order.paymentMethod,
          paymentTime: order.paymentTime,
          receipt: order.receipt,
          orderAddress: order.orderAddress,
        };
      })
    );

    return ordersWithUserDetails;
  } catch (error) {
    console.error("Error fetching orders:", (error as any).message);
    return [];
  }
};

export const updateOrderConfirmation = async (orderId: string) => {
  try {
    // Find the order by ID
    const order = await OrderModel.findById(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    // Toggle the order confirmation status
    order.orderConfirmation = !order.orderConfirmation;

    // Save the updated order
    await order.save();

    // Return a plain object with the updated order details
    return {
      orderId: order._id.toString(),
      orderConfirmation: order.orderConfirmation,
      deliveryStatus: order.deliveryStatus,
      price: order.price,
      deliveryCost: order.deliveryCost,
      paymentMethod: order.paymentMethod,
      paymentTime: order.paymentTime,
      receipt: order.receipt,
      orderAddress: order.orderAddress,
      success: true,
    };
  } catch (error) {
    console.error("Error updating order confirmation:", error);
    throw new Error("Failed to update order confirmation");
  }
};
