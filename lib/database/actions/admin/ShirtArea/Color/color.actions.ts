"use server";

import { connectToDatabase } from "@/lib/database/connect";
import ColorModel from "@/lib/database/models/shirtModel/ColorModel";

// Create a color element
export const createColor = async (name: string, hexCode: string) => {
  try {
    await connectToDatabase(); // Ensure DB connection

    const newColor = new ColorModel({
      name,
      hexCode,
    });
    await newColor.save();
    return {
      success: true,
      message: "Color successfully added.",
      color: newColor,
    };
  } catch (error: any) {
    console.log("Error creating color:", error);
    return {
      success: false,
      message: error.message || "An error occurred while creating the color.",
    };
  }
};

// Delete a color by ID
export const deleteColorById = async (colorId: string) => {
  try {
    await connectToDatabase(); // Ensure DB connection

    const result = await ColorModel.findByIdAndDelete(colorId);
    if (result) {
      return {
        success: true,
        message: "Color successfully deleted.",
      };
    } else {
      return {
        success: false,
        message: "Color not found.",
      };
    }
  } catch (error: any) {
    console.log("Error deleting color:", error);
    return {
      success: false,
      message: error.message || "An error occurred while deleting the color.",
    };
  }
};

// Get all colors
export const getAllColors = async () => {
  try {
    await connectToDatabase(); // Ensure DB connection

    const colors = await ColorModel.find()
      .sort({ updatedAt: -1 }) // Sort by the latest updated entries
      .lean();

    return JSON.parse(JSON.stringify(colors));
  } catch (error: any) {
    console.log(error);
    return [];
  }
};
