"use server";

import ColorModel from "@/lib/database/models/shirtModel/ColorModel";

// Create a color element
export const createColor = async (name: string, hexCode: string) => {
  try {
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

// Fetch all color elements
export const fetchAllColors = async () => {
  try {
    const colors = await ColorModel.find();
    return colors;
  } catch (error: any) {
    console.log("Error fetching colors:", error);
    return {
      success: false,
      message: error.message || "An error occurred while fetching colors.",
    };
  }
};

// Delete a color by ID
export const deleteColorById = async (colorId: string) => {
  try {
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
