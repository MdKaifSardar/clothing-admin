import { connectToDatabase } from "@/lib/database/connect";
import CollarModel from "@/lib/database/models/shirtModel/CollarModel";
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

// Create new Collar entry
export const createCollar = async (
  style: {
    name: string;
    image: string; // Base64 string for style image upload
    icon: string; // Base64 string for style icon upload
    price: number;
  },
  height: {
    name: string;
    icon: string; // Base64 string for height icon upload
    price: number;
  },
  collarButton: {
    name: string;
    image: string; // Base64 string for button image upload
    icon: string; // Base64 string for button icon upload
    price: number;
  }
) => {
  try {
    await connectToDatabase();

    if (
      !style.name ||
      !style.image ||
      !style.icon ||
      style.price === undefined ||
      !height.name ||
      !height.icon ||
      height.price === undefined ||
      !collarButton.name ||
      !collarButton.image ||
      !collarButton.icon ||
      collarButton.price === undefined
    ) {
      return {
        message: "All fields are required for style, height, and collar button.",
        success: false,
      };
    }

    // Upload style image and icon to Cloudinary
    const styleImageBuffer = base64ToBuffer(style.image);
    const styleIconBuffer = base64ToBuffer(style.icon);

    const styleImageFormData = new FormData();
    styleImageFormData.append("file", new Blob([styleImageBuffer], { type: "image/jpeg" }));
    styleImageFormData.append("upload_preset", "collar_style_images");

    const styleIconFormData = new FormData();
    styleIconFormData.append("file", new Blob([styleIconBuffer], { type: "image/jpeg" }));
    styleIconFormData.append("upload_preset", "collar_style_icons");

    const styleImageResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      {
        method: "POST",
        body: styleImageFormData,
      }
    );

    const styleIconResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      {
        method: "POST",
        body: styleIconFormData,
      }
    );

    const uploadedStyleImage = await styleImageResponse.json();
    const uploadedStyleIcon = await styleIconResponse.json();

    // Upload height icon to Cloudinary
    const heightIconBuffer = base64ToBuffer(height.icon);
    const heightIconFormData = new FormData();
    heightIconFormData.append("file", new Blob([heightIconBuffer], { type: "image/jpeg" }));
    heightIconFormData.append("upload_preset", "collar_height_icons");

    const heightIconResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      {
        method: "POST",
        body: heightIconFormData,
      }
    );

    const uploadedHeightIcon = await heightIconResponse.json();

    // Upload collar button image and icon to Cloudinary
    const collarButtonImageBuffer = base64ToBuffer(collarButton.image);
    const collarButtonIconBuffer = base64ToBuffer(collarButton.icon);

    const collarButtonImageFormData = new FormData();
    collarButtonImageFormData.append("file", new Blob([collarButtonImageBuffer], { type: "image/jpeg" }));
    collarButtonImageFormData.append("upload_preset", "collar_button_images");

    const collarButtonIconFormData = new FormData();
    collarButtonIconFormData.append("file", new Blob([collarButtonIconBuffer], { type: "image/jpeg" }));
    collarButtonIconFormData.append("upload_preset", "collar_button_icons");

    const collarButtonImageResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      {
        method: "POST",
        body: collarButtonImageFormData,
      }
    );

    const collarButtonIconResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
      {
        method: "POST",
        body: collarButtonIconFormData,
      }
    );

    const uploadedCollarButtonImage = await collarButtonImageResponse.json();
    const uploadedCollarButtonIcon = await collarButtonIconResponse.json();

    // Create a new collar entry in the database
    await new CollarModel({
      style: {
        name: style.name,
        image: {
          url: uploadedStyleImage.secure_url,
          public_id: uploadedStyleImage.public_id,
        },
        icon: {
          url: uploadedStyleIcon.secure_url,
          public_id: uploadedStyleIcon.public_id,
        },
        price: style.price,
      },
      height: {
        name: height.name,
        icon: {
          url: uploadedHeightIcon.secure_url,
          public_id: uploadedHeightIcon.public_id,
        },
        price: height.price,
      },
      collar_button: {
        name: collarButton.name,
        image: {
          url: uploadedCollarButtonImage.secure_url,
          public_id: uploadedCollarButtonImage.public_id,
        },
        icon: {
          url: uploadedCollarButtonIcon.secure_url,
          public_id: uploadedCollarButtonIcon.public_id,
        },
        price: collarButton.price,
      },
    }).save();

    return {
      message: "Collar has been successfully created.",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: "Error creating collar.",
      success: false,
    };
  }
};

// Delete Collar entry and its images from Cloudinary
export const deleteCollar = async (collarId: string) => {
  try {
    await connectToDatabase();

    const collar = await CollarModel.findById(collarId);

    if (!collar) {
      return {
        message: "Collar not found with this Id!",
        success: false,
      };
    }

    // Delete images from Cloudinary
    const styleImagePublicId = collar.style.image.public_id;
    const styleIconPublicId = collar.style.icon.public_id;
    const heightIconPublicId = collar.height.icon.public_id;
    const collarButtonImagePublicId = collar.collar_button.image.public_id;
    const collarButtonIconPublicId = collar.collar_button.icon.public_id;

    await cloudinary.v2.uploader.destroy(styleImagePublicId);
    await cloudinary.v2.uploader.destroy(styleIconPublicId);
    await cloudinary.v2.uploader.destroy(heightIconPublicId);
    await cloudinary.v2.uploader.destroy(collarButtonImagePublicId);
    await cloudinary.v2.uploader.destroy(collarButtonIconPublicId);

    // Delete collar document from MongoDB
    await CollarModel.findByIdAndDelete(collarId);

    return {
      message: "Successfully deleted collar and its associated images from Cloudinary.",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: "Error deleting collar.",
      success: false,
    };
  }
};

// Update Collar details (style, height, and collar button)
export const updateCollar = async (
  collarId: string,
  newStyle: {
    name: string;
    image: string; // Base64 string for style image upload (if updated)
    icon: string; // Base64 string for style icon upload (if updated)
    price: number;
  },
  newHeight: {
    name: string;
    icon: string; // Base64 string for height icon upload (if updated)
    price: number;
  },
  newCollarButton: {
    name: string;
    image: string; // Base64 string for button image upload (if updated)
    icon: string; // Base64 string for button icon upload (if updated)
    price: number;
  }
) => {
  try {
    await connectToDatabase();

    const collar = await CollarModel.findById(collarId);

    if (!collar) {
      return {
        message: "Collar not found with this Id!",
        success: false,
      };
    }

    // Update Style
    if (newStyle.name) {
      collar.style.name = newStyle.name;
    }

    if (newStyle.price !== undefined) {
      collar.style.price = newStyle.price;
    }

    if (newStyle.image || newStyle.icon) {
      // Upload new style image and icon to Cloudinary if updated
      if (newStyle.image) {
        const styleImageBuffer = base64ToBuffer(newStyle.image);
        const styleImageFormData = new FormData();
        styleImageFormData.append("file", new Blob([styleImageBuffer], { type: "image/jpeg" }));
        styleImageFormData.append("upload_preset", "collar_style_images");

        const styleImageResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
          {
            method: "POST",
            body: styleImageFormData,
          }
        );

        const uploadedStyleImage = await styleImageResponse.json();
        collar.style.image = {
          url: uploadedStyleImage.secure_url,
          public_id: uploadedStyleImage.public_id,
        };
      }

      if (newStyle.icon) {
        const styleIconBuffer = base64ToBuffer(newStyle.icon);
        const styleIconFormData = new FormData();
        styleIconFormData.append("file", new Blob([styleIconBuffer], { type: "image/jpeg" }));
        styleIconFormData.append("upload_preset", "collar_style_icons");

        const styleIconResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
          {
            method: "POST",
            body: styleIconFormData,
          }
        );

        const uploadedStyleIcon = await styleIconResponse.json();
        collar.style.icon = {
          url: uploadedStyleIcon.secure_url,
          public_id: uploadedStyleIcon.public_id,
        };
      }
    }

    // Update Height
    if (newHeight.name) {
      collar.height.name = newHeight.name;
    }

    if (newHeight.price !== undefined) {
      collar.height.price = newHeight.price;
    }

    if (newHeight.icon) {
      const heightIconBuffer = base64ToBuffer(newHeight.icon);
      const heightIconFormData = new FormData();
      heightIconFormData.append("file", new Blob([heightIconBuffer], { type: "image/jpeg" }));
      heightIconFormData.append("upload_preset", "collar_height_icons");

      const heightIconResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
        {
          method: "POST",
          body: heightIconFormData,
        }
      );

      const uploadedHeightIcon = await heightIconResponse.json();
      collar.height.icon = {
        url: uploadedHeightIcon.secure_url,
        public_id: uploadedHeightIcon.public_id,
      };
    }

    // Update Collar Button
    if (newCollarButton.name) {
      collar.collar_button.name = newCollarButton.name;
    }

    if (newCollarButton.price !== undefined) {
      collar.collar_button.price = newCollarButton.price;
    }

    if (newCollarButton.image || newCollarButton.icon) {
      if (newCollarButton.image) {
        const collarButtonImageBuffer = base64ToBuffer(newCollarButton.image);
        const collarButtonImageFormData = new FormData();
        collarButtonImageFormData.append("file", new Blob([collarButtonImageBuffer], { type: "image/jpeg" }));
        collarButtonImageFormData.append("upload_preset", "collar_button_images");

        const collarButtonImageResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
          {
            method: "POST",
            body: collarButtonImageFormData,
          }
        );

        const uploadedCollarButtonImage = await collarButtonImageResponse.json();
        collar.collar_button.image = {
          url: uploadedCollarButtonImage.secure_url,
          public_id: uploadedCollarButtonImage.public_id,
        };
      }

      if (newCollarButton.icon) {
        const collarButtonIconBuffer = base64ToBuffer(newCollarButton.icon);
        const collarButtonIconFormData = new FormData();
        collarButtonIconFormData.append("file", new Blob([collarButtonIconBuffer], { type: "image/jpeg" }));
        collarButtonIconFormData.append("upload_preset", "collar_button_icons");

        const collarButtonIconResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_NAME}/image/upload`,
          {
            method: "POST",
            body: collarButtonIconFormData,
          }
        );

        const uploadedCollarButtonIcon = await collarButtonIconResponse.json();
        collar.collar_button.icon = {
          url: uploadedCollarButtonIcon.secure_url,
          public_id: uploadedCollarButtonIcon.public_id,
        };
      }
    }

    await collar.save();

    return {
      message: "Collar successfully updated.",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      message: "Error updating collar.",
      success: false,
    };
  }
};

export const getAllCollars = async () => {
  try {
    await connectToDatabase();

    const collars = await CollarModel.find()
      .sort({ updatedAt: -1 }) // Sort by the latest updated entries
      .lean();

    return JSON.parse(JSON.stringify(collars));
  } catch (error: any) {
    console.log(error);
    return [];
  }
};

