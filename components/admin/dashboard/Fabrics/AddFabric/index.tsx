"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { toast } from "react-toastify";
import { createFabric } from "@/lib/database/actions/admin/ShirtArea/Fabric/fabric.actions";

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

interface CreateFabricProps {
  fetchFabrics: () => void; // Expecting a function that fetches fabrics
}

const CreateFabric: React.FC<CreateFabricProps> = ({ fetchFabrics }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm({
    initialValues: { fabricName: "", price: 0, discount: 0, description: "" }, // Added description
    validate: {
      fabricName: (value) =>
        value.length < 3 || value.length > 30
          ? "Fabric name must be between 3 to 30 characters."
          : null,
      price: (value) => (value <= 0 ? "Price must be greater than 0." : null),
      discount: (value) =>
        value < 0 || value > 100 ? "Discount must be between 0 and 100." : null,
      description: (value) =>
        value.length > 200 ? "Description must be less than 200 characters." : null, // Validation for description
    },
  });

  const handleImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64Image = await fileToBase64(files[0]);
    setImage(base64Image);
  };

  const submitHandler = async (values: typeof form.values) => {
    try {
      setLoading(true);
      const res = await createFabric(
        values.fabricName,
        image!,
        values.price,
        values.discount,
        values.description // Pass description
      );
      if (res?.success) {
        fetchFabrics();
        form.reset();
        setImage(null);
        toast.success(res.message || "Fabric created successfully!");
      } else {
        toast.error("There was an error creating the fabric.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the fabric.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col justify-center items-center w-full h-fit">
      {loading && (
        <div className="absolute inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-10">
          <div className="text-white">Loading...</div>
        </div>
      )}
      <form
        onSubmit={form.onSubmit(submitHandler)}
        className="w-full flex flex-col justify-center p-6 bg-white rounded-lg shadow-lg"
      >
        <h2 className="text-xl font-bold mb-4">Create a Fabric</h2>
        <div>
          <label
            htmlFor="fabricName"
            className="block text-sm font-medium text-gray-600"
          >
            Fabric Name
          </label>
          <input
            type="text"
            id="fabricName"
            placeholder="Fabric name"
            {...form.getInputProps("fabricName")}
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-600"
          >
            Price
          </label>
          <input
            type="number"
            id="price"
            placeholder="Price"
            {...form.getInputProps("price")}
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="discount"
            className="block text-sm font-medium text-gray-600"
          >
            Discount (%)
          </label>
          <input
            type="number"
            id="discount"
            placeholder="Discount"
            {...form.getInputProps("discount")}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-600"
          >
            Description
          </label>
          <textarea
            id="description"
            placeholder="Fabric description"
            {...form.getInputProps("description")}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-600"
          >
            Upload Image for Fabric
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {image && (
          <div className="mt-4 w-full h-32 overflow-hidden rounded-md">
            <img
              src={image}
              alt="Uploaded fabric image"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <button
          type="submit"
          className={`mx-auto w-fit py-2 px-4 text-white bg-blue-600 rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Fabric"}
        </button>
      </form>
    </div>
  );
};

export default CreateFabric;
