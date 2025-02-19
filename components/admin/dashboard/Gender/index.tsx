"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createGender,
  getGendersByColorAndFabric,
  deleteGender,
  updateGender,
} from "@/lib/database/actions/admin/ShirtArea/Gender/gender.actions";
import { getAllFabrics } from "@/lib/database/actions/admin/ShirtArea/Fabric/fabric.actions";
import { getColorByFabric } from "@/lib/database/actions/admin/ShirtArea/Color/color.actions";

// Utility to convert file to base64
const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const GenderDashboard = () => {
  // Dropdown states for fabric and color
  const [fabrics, setFabrics] = useState<{ _id: string; fabricName: string }[]>(
    []
  );
  const [colors, setColors] = useState<{ _id: string; name: string }[]>([]);
  const [selectedFabric, setSelectedFabric] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Gender form states
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [genders, setGenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteGenderId, setDeleteGenderId] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // For editing
  const [editingGenderId, setEditingGenderId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);
  const [initialEditImage, setInitialEditImage] = useState<string | null>(null);

  // Fetch all fabrics on mount
  useEffect(() => {
    const fetchFabrics = async () => {
      try {
        const data = await getAllFabrics();
        setFabrics(data);
      } catch (error) {
        console.log("Error fetching fabrics:", error);
      }
    };
    fetchFabrics();
  }, []);

  // Fetch colors when the selected fabric changes
  useEffect(() => {
    if (selectedFabric) {
      const fetchColors = async () => {
        try {
          const data = await getColorByFabric(selectedFabric);
          setColors(data);
        } catch (error) {
          console.log("Error fetching colors:", error);
        }
      };
      fetchColors();
    } else {
      setColors([]);
    }
    // Clear any previously selected color when fabric changes
    setSelectedColor("");
  }, [selectedFabric]);

  // Fetch genders when both fabric and color are selected
  const fetchGenders = async () => {
    if (!selectedFabric || !selectedColor) return;
    try {
      const fetched = await getGendersByColorAndFabric(
        selectedFabric,
        selectedColor
      );
      setGenders(fetched);
    } catch (error) {
      console.log("Error fetching genders:", error);
    }
  };

  // Refetch genders on dropdown change
  useEffect(() => {
    if (selectedFabric && selectedColor) {
      fetchGenders();
    }
  }, [selectedFabric, selectedColor]);

  const handleImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setImage(base64);
  };

  const handleEditImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditImage(base64);
  };

  const submitHandler = async () => {
    if (!selectedFabric || !selectedColor) {
      toast.error("Please select both fabric and color.");
      return;
    }
    try {
      setLoading(true);
      const res = await createGender(
        name,
        image!,
        selectedFabric,
        selectedColor
      );
      if (res?.success) {
        fetchGenders();
        setName("");
        setImage(null);
        toast.success(res.message || "Gender created successfully!");
      } else {
        toast.error("Error creating gender.");
      }
    } catch (err) {
      toast.error("Error occurred while creating gender.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGender = async () => {
    if (!deleteGenderId) return;
    try {
      const res = await deleteGender(deleteGenderId);
      if (res?.success) {
        fetchGenders();
        toast.success(res.message || "Gender deleted successfully!");
        setShowConfirmationModal(false);
      } else {
        toast.error("Error deleting gender.");
      }
    } catch (err) {
      toast.error("Error occurred while deleting gender.");
      setShowConfirmationModal(false);
    }
  };

  const openDeleteConfirmation = (id: string) => {
    setDeleteGenderId(id);
    setShowConfirmationModal(true);
  };

  const openEditForm = (gender: any) => {
    setEditingGenderId(gender._id);
    setEditName(gender.name);
    setEditImage(gender.image.url);
    setInitialEditImage(gender.image.url);
  };

  const cancelEdit = () => {
    setEditingGenderId(null);
    setEditName("");
    setEditImage(null);
    setInitialEditImage(null);
  };

  const handleEditSubmit = async (id: string) => {
    try {
      const newImage = editImage !== initialEditImage ? editImage || "" : "";
      const res = await updateGender(id, editName, newImage);
      if (res?.success) {
        toast.success(res.message || "Gender updated successfully!");
        fetchGenders();
        cancelEdit();
      } else {
        toast.error("Error updating gender.");
      }
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Error occurred while updating gender.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* Fabric and Color Dropdowns */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Select Fabric & Color</h3>
        <div className="space-y-4">
          <select
            value={selectedFabric}
            onChange={(e) => setSelectedFabric(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          >
            <option value="">Select Fabric</option>
            {fabrics.map((fabric) => (
              <option key={fabric._id} value={fabric._id}>
                {fabric.fabricName}
              </option>
            ))}
          </select>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            disabled={!selectedFabric}
          >
            <option value="">Select Color</option>
            {colors.map((color) => (
              <option key={color._id} value={color._id}>
                {color.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create Form */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Create New Gender</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          {image && (
            <img
              src={image}
              alt="Selected"
              className="mt-2 w-32 h-32 object-cover"
            />
          )}
          <button
            onClick={submitHandler}
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded-md"
          >
            {loading ? "Creating..." : "Create Gender"}
          </button>
        </div>
      </div>

      {/* Gender List */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Genders List</h3>
        <ul className="space-y-4">
          {genders.length > 0 ? (
            genders.map((gender) => (
              <li key={gender._id}>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md shadow-sm hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <img
                      src={gender.image.url}
                      alt={gender.name}
                      className="w-12 h-12 object-cover rounded-full"
                    />
                    <div>
                      <h4 className="text-lg font-semibold">{gender.name}</h4>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => openEditForm(gender)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirmation(gender._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {editingGenderId === gender._id && (
                  <div className="w-full mt-2 p-4 border rounded-md">
                    <h5 className="text-xl font-semibold mb-2">Edit Gender</h5>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Edit Name"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleEditImageChange(e.target.files)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                      {editImage && (
                        <img
                          src={editImage}
                          alt="Edit Preview"
                          className="w-32 h-32 object-cover"
                        />
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSubmit(gender._id)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md"
                        >
                          Update
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))
          ) : (
            <p className="text-gray-500">
              No genders available for this selection.
            </p>
          )}
        </ul>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <div className="flex justify-between">
              <button
                onClick={handleDeleteGender}
                className="px-6 py-2 bg-red-600 text-white rounded-md"
              >
                Delete
              </button>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md"
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

export default GenderDashboard;
