"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createColor,
  deleteColorById,
  getColorByFabric, // Assuming this function is defined similarly to getBacksByColorAndFabric
} from "@/lib/database/actions/admin/ShirtArea/Color/color.actions";
import { getAllFabrics } from "@/lib/database/actions/admin/ShirtArea/Fabric/fabric.actions";

// Utility function to convert file to base64 string
const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CreateAndManageColors = () => {
  const [name, setName] = useState<string>("");
  const [hexCode, setHexCode] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [selectedFabricId, setSelectedFabricId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [colorIdToDelete, setColorIdToDelete] = useState<string | null>(null);

  const fetchColors = async () => {
    if (!selectedFabricId) return;
    try {
      const fetchedColors = await getColorByFabric(selectedFabricId);
      setColors(fetchedColors);
    } catch (error) {
      console.log("Error fetching colors:", error);
    }
  };

  const fetchFabrics = async () => {
    try {
      const fetchedFabrics = await getAllFabrics();
      setFabrics(fetchedFabrics);
    } catch (error) {
      console.log("Error fetching fabrics:", error);
    }
  };

  useEffect(() => {
    fetchFabrics();
  }, []);

  useEffect(() => {
    if (selectedFabricId) {
      fetchColors();
    }
  }, [selectedFabricId]);

  const handleImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64Image = await fileToBase64(files[0]);
    setImage(base64Image);
  };

  const submitHandler = async () => {
    try {
      setLoading(true);
      const res = await createColor(
        name,
        hexCode,
        image!,
        selectedFabricId // Pass fabricId as selected
      );
      if (res?.success) {
        fetchColors(); // Fetch updated colors after successful creation
        setName("");
        setHexCode("");
        setImage(null);
        toast.success(res.message || "Color created successfully!");
      } else {
        toast.error("There was an error creating the color.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the color.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColor = async () => {
    if (!colorIdToDelete) return;
    try {
      const res = await deleteColorById(colorIdToDelete);
      if (res?.success) {
        fetchColors(); // Refresh the list after successful deletion
        toast.success(res.message || "Color deleted successfully!");
        setShowConfirmationModal(false);
      } else {
        toast.error("There was an error deleting the color.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the color.");
      setShowConfirmationModal(false);
    }
  };

  const openDeleteConfirmation = (colorId: string) => {
    setColorIdToDelete(colorId);
    setShowConfirmationModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Create Color Form */}
      <div className="create-form bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Create New Color</h3>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="form-group">
            <input
              type="text"
              placeholder="Color Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Hex Code"
              value={hexCode}
              onChange={(e) => setHexCode(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="form-group">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {image && (
              <img
                src={image}
                alt="Selected Image"
                className="mt-2 w-32 h-32 object-cover"
              />
            )}
          </div>
          <div className="form-group">
            <select
              value={selectedFabricId}
              onChange={(e) => setSelectedFabricId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select Fabric
              </option>
              {fabrics.map((fabric) => (
                <option key={fabric._id} value={fabric._id}>
                  {fabric.fabricName}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={submitHandler}
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Creating..." : "Create Color"}
          </button>
        </form>
      </div>

      {/* Colors List */}
      <div className="colors-list bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Colors List</h3>
        <ul className="space-y-4">
          {colors.length > 0 ? (
            colors.map((color) => (
              <li
                key={color._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-md shadow-sm hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={color.image.url}
                    alt={color.name}
                    className="w-12 h-12 object-cover rounded-full"
                  />
                  <div>
                    <h4 className="text-lg font-semibold">{color.name}</h4>
                    <p className="text-sm text-gray-600">{color.hexCode}</p>
                  </div>
                </div>
                <button
                  onClick={() => openDeleteConfirmation(color._id)}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-500">
              No colors available for this fabric.
            </p>
          )}
        </ul>
      </div>

      {/* Custom Modal for Deleting */}
      {showConfirmationModal && (
        <div className="modal-overlay fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">
              Are you sure you want to delete this color?
            </h3>
            <div className="flex justify-between">
              <button
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleDeleteColor}
              >
                Yes, Delete
              </button>
              <button
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                onClick={() => setShowConfirmationModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAndManageColors;
