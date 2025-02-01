import { connectToDatabase } from "@/lib/database/connect";
import SleevesModel from "@/lib/database/models/shirtModel/SleeveModel";
import cloudinary from "cloudinary";

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUNDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Helper function to convert base64 string to buffer
const base64ToBuffer = (base: any) => {
  const base64String = base.split(";base64,").pop();
  return Buffer.from(base64String, "base64");
};

// Create new Sleeves entry
export const createSleeves = async (
  sleevesName: string,
  image: string, // Base64 string for image upload
  icon: string, // Base64 string for icon upload
  price: number
) => {
  try {
    await connectToDatabase();

    if (!sleevesName || !image || !icon || !price) {
      return {
        message: "Sleeves name, image, icon, and price are required.",
        success: false,
      };
    }

    // Check if sleeves already exists
    const existingSleeves = await SleevesModel.findOne({ name: sleevesName });
    if (existingSleeves) {
      return {
        message: "Sleeves with this name already exists.",
        success: false,
      };
    }

    // Upload image to Cloudinary
    const imageBuffer = base64ToBuffer(image);
    const imageFormData = new FormData();
    imageFormData.append(
      "file",
      new Blob([imageBuffer], { type: "image/jpeg" })
    );
    imageFormData.append("upload_preset", "sleeves_images");

    const imageResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      {
        method: "POST",
        body: imageFormData,
      }
    );
    const uploadedImage = await imageResponse.json();

    // Upload icon to Cloudinary
    const iconBuffer = base64ToBuffer(icon);
    const iconFormData = new FormData();
    iconFormData.append("file", new Blob([iconBuffer], { type: "image/jpeg" }));
    iconFormData.append("upload_preset", "sleeves_icons");

    const iconResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      {
        method: "POST",
        body: iconFormData,
      }
    );
    const uploadedIcon = await iconResponse.json();

    // Create a new sleeves entry in the database
    await new SleevesModel({
      name: sleevesName,
      image: {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      },
      price,
      icon: {
        url: uploadedIcon.secure_url,
        public_id: uploadedIcon.public_id,
      },
    }).save();

    return {
      message: `Sleeves ${sleevesName} has been successfully created.`,
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: "Error creating sleeves.",
      success: false,
    };
  }
};

// Delete Sleeves entry and its images from Cloudinary
export const deleteSleeves = async (sleevesId: string) => {
  try {
    await connectToDatabase();

    const sleeves = await SleevesModel.findById(sleevesId);

    if (!sleeves) {
      return {
        message: "Sleeves not found with this Id!",
        success: false,
      };
    }

    // Delete image and icon from Cloudinary
    const imagePublicId = sleeves.image.public_id;
    const iconPublicId = sleeves.icon.public_id;
    await cloudinary.v2.uploader.destroy(imagePublicId);
    await cloudinary.v2.uploader.destroy(iconPublicId);

    // Delete sleeves document from MongoDB
    await SleevesModel.findByIdAndDelete(sleevesId);

    return {
      message:
        "Successfully deleted sleeves and its associated images from Cloudinary.",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: "Error deleting sleeves.",
      success: false,
    };
  }
};

// Update the sleeves' name, image, or icon by its ID
export const updateSleeves = async (
  sleevesId: string,
  newSleevesName: string,
  newImage: string, // Base64 string for image upload (if updated)
  newIcon: string, // Base64 string for icon upload (if updated)
  newPrice: number // Updated price
) => {
  try {
    await connectToDatabase();

    const sleeves = await SleevesModel.findById(sleevesId);

    if (!sleeves) {
      return {
        message: "Sleeves not found with this Id!",
        success: false,
      };
    }

    if (newSleevesName) {
      sleeves.name = newSleevesName;
    }

    if (newImage) {
      // Upload new image to Cloudinary
      const imageBuffer = base64ToBuffer(newImage);
      const imageFormData = new FormData();
      imageFormData.append(
        "file",
        new Blob([imageBuffer], { type: "image/jpeg" })
      );
      imageFormData.append("upload_preset", "sleeves_images");

      const imageResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
        {
          method: "POST",
          body: imageFormData,
        }
      );
      const uploadedImage = await imageResponse.json();
      sleeves.image = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    }

    if (newIcon) {
      // Upload new icon to Cloudinary
      const iconBuffer = base64ToBuffer(newIcon);
      const iconFormData = new FormData();
      iconFormData.append(
        "file",
        new Blob([iconBuffer], { type: "image/jpeg" })
      );
      iconFormData.append("upload_preset", "sleeves_icons");

      const iconResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
        {
          method: "POST",
          body: iconFormData,
        }
      );
      const uploadedIcon = await iconResponse.json();
      sleeves.icon = {
        url: uploadedIcon.secure_url,
        public_id: uploadedIcon.public_id,
      };
    }

    if (newPrice) {
      sleeves.price = newPrice;
    }

    // Save the updated sleeves
    await sleeves.save();

    return {
      message: "Successfully updated the sleeves!",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: "Error updating sleeves.",
      success: false,
    };
  }
};
