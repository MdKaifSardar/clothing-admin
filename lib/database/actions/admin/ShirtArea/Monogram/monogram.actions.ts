"use server";

import mongoose from "mongoose";
import cloudinary from "cloudinary";
import MonogramModel from "@/lib/database/models/shirtModel/MonogramModel";
import { connectToDatabase } from "@/lib/database/connect";

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Helper function to convert base64 string to buffer
const base64ToBuffer = (base: string) => {
  const base64String = base.split(";base64,").pop();
  if (!base64String) {
    throw new Error("Invalid base64 string");
  }
  return Buffer.from(base64String, "base64");
};

// Create new Monogram entry
export const createMonogram = async (
  style: {
    name?: string;
    image?: string; // Base64 string for style image upload
    price?: number;
  },
  position: {
    name?: string;
    image?: string; // Base64 string for style image upload
    price?: number;
  },
  fabricId: string,
  colorId: string
) => {
  try {
    await connectToDatabase();

    // Validate required fields
    if (!fabricId || !colorId) {
      return { message: "Fabric ID is required.", success: false };
    }

    let uploadedStyleImage, uploadedPositionImage;

    // Upload style image if provided
    if (style?.image) {
      const styleImageBuffer = base64ToBuffer(style.image);
      const styleImageFormData = new FormData();
      styleImageFormData.append(
        "file",
        new Blob([styleImageBuffer], { type: "image/jpeg" })
      );
      styleImageFormData.append("upload_preset", "monogram_style_images");

      const styleImageResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
        { method: "POST", body: styleImageFormData }
      );
      uploadedStyleImage = await styleImageResponse.json();
    }

    // Upload position image if provided
    if (position?.image) {
      const positionImageBuffer = base64ToBuffer(position.image);
      const positionImageFormData = new FormData();
      positionImageFormData.append(
        "file",
        new Blob([positionImageBuffer], { type: "image/jpeg" })
      );
      positionImageFormData.append("upload_preset", "monogram_position_images");

      const positionImageResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
        { method: "POST", body: positionImageFormData }
      );
      uploadedPositionImage = await positionImageResponse.json();
    }

    const fabricObjectId = new mongoose.Types.ObjectId(fabricId);
    const colorObjectId = new mongoose.Types.ObjectId(colorId);

    // Save the monogram with uploaded images
    const monogram = new MonogramModel({
      style: style?.name?.trim()
        ? {
            name: style.name,
            image: uploadedStyleImage
              ? {
                  url: uploadedStyleImage.secure_url,
                  public_id: uploadedStyleImage.public_id,
                }
              : undefined,
            price: style.price,
          }
        : undefined,
      position: position?.name?.trim()
        ? {
            name: position.name,
            image: uploadedPositionImage
              ? {
                  url: uploadedPositionImage.secure_url,
                  public_id: uploadedPositionImage.public_id,
                }
              : undefined,
            price: position.price,
          }
        : undefined,
      fabricId: fabricObjectId,
      colorId: colorObjectId,
    });

    await monogram.save();

    return {
      message: "Monogram has been successfully created.",
      success: true,
    };
  } catch (error) {
    console.log(error);
    return { message: "Error creating monogram.", success: false };
  }
};

export const getMonogramsByColorAndFabric = async (
  fabricId: string,
  colorId: string
) => {
  try {
    await connectToDatabase();

    const fabricObjectId = new mongoose.Types.ObjectId(fabricId);
    const colorObjectId = new mongoose.Types.ObjectId(colorId);

    const Monograms = await MonogramModel.find({
      fabricId: fabricObjectId,
      colorId: colorObjectId,
    })
      .sort({ updatedAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(Monograms));
  } catch (error: any) {
    console.error("Error fetching monograms:", error);
    return [];
  }
};

export const deleteMonogram = async (monogramId: string) => {
  try {
    await connectToDatabase();

    const monogram = await MonogramModel.findById(monogramId);

    if (!monogram) {
      return {
        message: "Monogram not found with this ID!",
        success: false,
      };
    }

    // Delete images from Cloudinary if they exist
    const styleImagePublicId = monogram.style?.image?.public_id;
    const positionImagePublicId = monogram.position?.image?.public_id;

    try {
      if (styleImagePublicId) {
        await cloudinary.v2.uploader.destroy(styleImagePublicId);
      }
      if (positionImagePublicId) {
        await cloudinary.v2.uploader.destroy(positionImagePublicId);
      }
    } catch (cloudinaryError) {
      console.error("Error deleting images from Cloudinary:", cloudinaryError);
    }

    // Delete monogram document from MongoDB
    await MonogramModel.findByIdAndDelete(monogramId);

    return {
      message: "Successfully deleted monogram and its associated images.",
      success: true,
    };
  } catch (error: any) {
    console.error("Error deleting monogram:", error);
    return {
      message: "Error deleting monogram.",
      success: false,
    };
  }
};
