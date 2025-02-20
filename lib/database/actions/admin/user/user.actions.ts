"use server";

import { connectToDatabase } from "@/lib/database/connect";
import User from "@/lib/database/models/user.model";
import mongoose from "mongoose";

// get all users for admin
export async function getAllUsers() {
  try {
    await connectToDatabase();
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    return {
      success: true,
      users: JSON.parse(JSON.stringify(users)),
      message: "Users fetched successfully",
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      users: [],
      message: "Failed to fetch users",
    };
  }
}

// fetch user by userId or clerkId
export const fetchUserById = async (userId: string) => {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId }).lean();

    if (!user) {
      return {
        message: "User not found",
        success: false,
      };
    }

    return {
      user: JSON.parse(JSON.stringify(user)),
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: "An error occurred while fetching the user.",
      success: false,
    };
  }
};

// New function to fetch a user by its mongoose id
export const getUserByMongoId = async (mongoId: string) => {
  try {
    await connectToDatabase();
    const user = await User.findById(mongoId).lean();
    if (!user) {
      return { message: "User not found", success: false };
    }
    return { user: JSON.parse(JSON.stringify(user)), success: true };
  } catch (error: any) {
    console.error(error);
    return { message: "Error fetching user", success: false };
  }
};

// delete Single user by id for admin
export async function deleteSingleUser(id: string) {
  try {
    await connectToDatabase();
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return {
        message: "User not found with this id!",
        success: false,
      };
    }
    return {
      message: "Successfully deleted user",
      success: true,
    };
  } catch (error) {
    console.log(error);
  }
}
