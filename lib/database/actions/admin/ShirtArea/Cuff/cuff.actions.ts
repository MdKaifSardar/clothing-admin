import { connectToDatabase } from "@/lib/database/connect";
import CuffModel from "@/lib/database/models/shirtModel/CuffModel";
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

// Create a new Cuff entry
export const createCuff = async (
  styleName: string,
  styleImage: string, // Base64 string for style image upload
  styleIcon: string, // Base64 string for style icon upload
  stylePrice: number,
  cufflinkName: string,
  cufflinkImage: string, // Base64 string for cufflink image upload
  cufflinkIcon: string, // Base64 string for cufflink icon upload
  cufflinkPrice: number,
  watchName: string,
  watchPrice: number
) => {
  try {
    await connectToDatabase();

    if (
      !styleName ||
      !styleImage ||
      !styleIcon ||
      stylePrice === undefined ||
      !cufflinkName ||
      !cufflinkImage ||
      !cufflinkIcon ||
      cufflinkPrice === undefined ||
      !watchName ||
      watchPrice === undefined
    ) {
      return {
        message: "All fields are required.",
        success: false,
      };
    }

    // Check if cuff already exists
    const existingCuff = await CuffModel.findOne({ "style.name": styleName });
    if (existingCuff) {
      return {
        message: "Cuff with this style name already exists.",
        success: false,
      };
    }

    // Upload style image and icon to Cloudinary
    const styleImageBuffer = base64ToBuffer(styleImage);
    const styleIconBuffer = base64ToBuffer(styleIcon);

    const styleImageFormData = new FormData();
    styleImageFormData.append(
      "file",
      new Blob([styleImageBuffer], { type: "image/jpeg" })
    );
    styleImageFormData.append("upload_preset", "style_images");

    const styleIconFormData = new FormData();
    styleIconFormData.append(
      "file",
      new Blob([styleIconBuffer], { type: "image/jpeg" })
    );
    styleIconFormData.append("upload_preset", "style_icons");

    // Upload cufflink image and icon to Cloudinary
    const cufflinkImageBuffer = base64ToBuffer(cufflinkImage);
    const cufflinkIconBuffer = base64ToBuffer(cufflinkIcon);

    const cufflinkImageFormData = new FormData();
    cufflinkImageFormData.append(
      "file",
      new Blob([cufflinkImageBuffer], { type: "image/jpeg" })
    );
    cufflinkImageFormData.append("upload_preset", "cufflink_images");

    const cufflinkIconFormData = new FormData();
    cufflinkIconFormData.append(
      "file",
      new Blob([cufflinkIconBuffer], { type: "image/jpeg" })
    );
    cufflinkIconFormData.append("upload_preset", "cufflink_icons");

    const styleImageResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      { method: "POST", body: styleImageFormData }
    );

    const styleIconResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      { method: "POST", body: styleIconFormData }
    );

    const cufflinkImageResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      { method: "POST", body: cufflinkImageFormData }
    );

    const cufflinkIconResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      { method: "POST", body: cufflinkIconFormData }
    );

    const styleImage = await styleImageResponse.json();
    const styleIcon = await styleIconResponse.json();
    const cufflinkImage = await cufflinkImageResponse.json();
    const cufflinkIcon = await cufflinkIconResponse.json();

    // Create a new cuff entry in the database
    await new CuffModel({
      style: {
        name: styleName,
        image: {
          url: styleImage.secure_url,
          public_id: styleImage.public_id,
        },
        icon: {
          url: styleIcon.secure_url,
          public_id: styleIcon.public_id,
        },
        price: stylePrice,
      },
      cufflinks: {
        name: cufflinkName,
        image: {
          url: cufflinkImage.secure_url,
          public_id: cufflinkImage.public_id,
        },
        icon: {
          url: cufflinkIcon.secure_url,
          public_id: cufflinkIcon.public_id,
        },
        price: cufflinkPrice,
      },
      watch_compatible: {
        name: watchName,
        price: watchPrice,
      },
    }).save();

    return {
      message: `Cuff ${styleName} has been successfully created.`,
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: "Error creating cuff.",
      success: false,
    };
  }
};

// Delete Cuff entry and its images from Cloudinary
export const deleteCuff = async (cuffId: string) => {
  try {
    await connectToDatabase();

    const cuff = await CuffModel.findById(cuffId);

    if (!cuff) {
      return {
        message: "Cuff not found with this Id!",
        success: false,
      };
    }

    // Delete images from Cloudinary
    const styleImagePublicId = cuff.style.image.public_id;
    const styleIconPublicId = cuff.style.icon.public_id;
    const cufflinkImagePublicId = cuff.cufflinks.image.public_id;
    const cufflinkIconPublicId = cuff.cufflinks.icon.public_id;

    await cloudinary.v2.uploader.destroy(styleImagePublicId);
    await cloudinary.v2.uploader.destroy(styleIconPublicId);
    await cloudinary.v2.uploader.destroy(cufflinkImagePublicId);
    await cloudinary.v2.uploader.destroy(cufflinkIconPublicId);

    // Delete cuff document from MongoDB
    await CuffModel.findByIdAndDelete(cuffId);

    return {
      message:
        "Successfully deleted cuff and its associated images from Cloudinary.",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: "Error deleting cuff.",
      success: false,
    };
  }
};

// Update Cuff entry (name, price, and images)
export const updateCuff = async (
  cuffId: string,
  newStyleName: string,
  newStyleImage: string, // Base64 string for style image upload (if updated)
  newStyleIcon: string, // Base64 string for style icon upload (if updated)
  newStylePrice: number,
  newCufflinkName: string,
  newCufflinkImage: string, // Base64 string for cufflink image upload (if updated)
  newCufflinkIcon: string, // Base64 string for cufflink icon upload (if updated)
  newCufflinkPrice: number,
  newWatchName: string,
  newWatchPrice: number
) => {
  try {
    await connectToDatabase();

    const cuff = await CuffModel.findById(cuffId);

    if (!cuff) {
      return {
        message: "Cuff not found with this Id!",
        success: false,
      };
    }

    // Update style if required
    if (newStyleName) {
      cuff.style.name = newStyleName;
    }
    if (newStylePrice !== undefined) {
      cuff.style.price = newStylePrice;
    }

    if (newCufflinkName) {
      cuff.cufflinks.name = newCufflinkName;
    }
    if (newCufflinkPrice !== undefined) {
      cuff.cufflinks.price = newCufflinkPrice;
    }

    if (newWatchName) {
      cuff.watch_compatible.name = newWatchName;
    }
    if (newWatchPrice !== undefined) {
      cuff.watch_compatible.price = newWatchPrice;
    }

    // Upload new style image and icon to Cloudinary if updated
    if (newStyleImage || newStyleIcon) {
      if (newStyleImage) {
        const styleImageBuffer = base64ToBuffer(newStyleImage);
        const styleImageFormData = new FormData();
        styleImageFormData.append(
          "file",
          new Blob([styleImageBuffer], { type: "image/jpeg" })
        );
        styleImageFormData.append("upload_preset", "style_images");

        const styleImageResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
          { method: "POST", body: styleImageFormData }
        );
        const uploadedStyleImage = await styleImageResponse.json();
        cuff.style.image = {
          url: uploadedStyleImage.secure_url,
          public_id: uploadedStyleImage.public_id,
        };
      }

      if (newStyleIcon) {
        const styleIconBuffer = base64ToBuffer(newStyleIcon);
        const styleIconFormData = new FormData();
        styleIconFormData.append(
          "file",
          new Blob([styleIconBuffer], { type: "image/jpeg" })
        );
        styleIconFormData.append("upload_preset", "style_icons");

        const styleIconResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
          { method: "POST", body: styleIconFormData }
        );
        const uploadedStyleIcon = await styleIconResponse.json();
        cuff.style.icon = {
          url: uploadedStyleIcon.secure_url,
          public_id: uploadedStyleIcon.public_id,
        };
      }
    }

    // Upload new cufflink image and icon to Cloudinary if updated
    if (newCufflinkImage || newCufflinkIcon) {
      if (newCufflinkImage) {
        const cufflinkImageBuffer = base64ToBuffer(newCufflinkImage);
        const cufflinkImageFormData = new FormData();
        cufflinkImageFormData.append(
          "file",
          new Blob([cufflinkImageBuffer], { type: "image/jpeg" })
        );
        cufflinkImageFormData.append("upload_preset", "cufflink_images");

        const cufflinkImageResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
          { method: "POST", body: cufflinkImageFormData }
        );
        const uploadedCufflinkImage = await cufflinkImageResponse.json();
        cuff.cufflinks.image = {
          url: uploadedCufflinkImage.secure_url,
          public_id: uploadedCufflinkImage.public_id,
        };
      }

      if (newCufflinkIcon) {
        const cufflinkIconBuffer = base64ToBuffer(newCufflinkIcon);
        const cufflinkIconFormData = new FormData();
        cufflinkIconFormData.append(
          "file",
          new Blob([cufflinkIconBuffer], { type: "image/jpeg" })
        );
        cufflinkIconFormData.append("upload_preset", "cufflink_icons");

        const cufflinkIconResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
          { method: "POST", body: cufflinkIconFormData }
        );
        const uploadedCufflinkIcon = await cufflinkIconResponse.json();
        cuff.cufflinks.icon = {
          url: uploadedCufflinkIcon.secure_url,
          public_id: uploadedCufflinkIcon.public_id,
        };
      }
    }

    // Save the updated cuff
    await cuff.save();

    return {
      message: "Successfully updated the cuff!",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: "Error updating cuff.",
      success: false,
    };
  }
};
