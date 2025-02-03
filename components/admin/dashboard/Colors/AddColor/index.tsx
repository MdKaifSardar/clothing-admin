"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { toast } from "react-toastify";
import { createColor } from "@/lib/database/actions/admin/ShirtArea/Color/color.actions"; // Modify path as per your structure

const CreateColor: React.FC<{ fetchColors: () => void }> = ({
  fetchColors,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm({
    initialValues: { name: "", hexCode: "" },
    validate: {
      name: (value) =>
        value.length < 3 || value.length > 30
          ? "Color name must be between 3 to 30 characters."
          : null,
      hexCode: (value) =>
        !/^#[0-9A-F]{6}$/i.test(value) ? "Invalid hex code format." : null,
    },
  });

  const submitHandler = async (values: typeof form.values) => {
    try {
      setLoading(true);
      const res = await createColor(values.name, values.hexCode);
      if (res?.success) {
        fetchColors(); // Fetch updated colors list
        form.reset();
        toast.success(res.message || "Color created successfully!");
      } else {
        toast.error("Error creating color.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the color.");
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
        <h2 className="text-xl font-bold mb-4">Create a Color</h2>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-600"
          >
            Color Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="Color name"
            {...form.getInputProps("name")}
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="hexCode"
            className="block text-sm font-medium text-gray-600"
          >
            Hex Code
          </label>
          <input
            type="text"
            id="hexCode"
            placeholder="#HexCode"
            {...form.getInputProps("hexCode")}
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className={`mx-auto w-fit py-2 px-4 text-white bg-blue-600 rounded-md focus:outline-none focus:ring focus:ring-blue-500 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Color"}
        </button>
      </form>
    </div>
  );
};

export default CreateColor;
