"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createPlacket,
  getPlacketsByColorAndFabric,
  deletePlacket,
  updatePlacket, // newly imported updatePlacket
} from "@/lib/database/actions/admin/ShirtArea/Placket/placket.actions";

// Utility function to convert file to base64 string
const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CreateAndManagePlackets = ({ fabricId, colorId }: { fabricId: string, colorId: string }) => {
  // ...existing state variables...
  const [image, setImage] = useState<string | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [plackets, setPlackets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [placketIdToDelete, setPlacketIdToDelete] = useState<string | null>(null);

  // ----- New: Editing state variables for plackets -----
  const [editingPlacketId, setEditingPlacketId] = useState<string | null>(null);
  const [editPlacketName, setEditPlacketName] = useState<string>("");
  const [editPlacketPrice, setEditPlacketPrice] = useState<number>(0);
  const [editPlacketImage, setEditPlacketImage] = useState<string | null>(null);
  const [initialEditPlacketImage, setInitialEditPlacketImage] = useState<string | null>(null);
  const [editPlacketIcon, setEditPlacketIcon] = useState<string | null>(null);
  const [initialEditPlacketIcon, setInitialEditPlacketIcon] = useState<string | null>(null);
  // ----- End new states -----

  const fetchPlackets = async () => {
    try {
      const fetchedPlackets = await getPlacketsByColorAndFabric(fabricId, colorId);
      setPlackets(fetchedPlackets);
    } catch (error) {
      console.log("Error fetching plackets:", error);
    }
  };

  useEffect(() => {
    fetchPlackets();
  }, [fabricId]);

  const handleImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64Image = await fileToBase64(files[0]);
    setImage(base64Image);
  };

  const handleIconChange = async (files: FileList | null) => {
    if (!files) return;
    const base64Icon = await fileToBase64(files[0]);
    setIcon(base64Icon);
  };

  // ----- New: Handlers for placket editing -----
  const handleEditPlacketImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditPlacketImage(base64);
  };

  const handleEditPlacketIconChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditPlacketIcon(base64);
  };

  const openEditPlacketForm = (placket: any) => {
    setEditingPlacketId(placket._id);
    setEditPlacketName(placket.name);
    setEditPlacketPrice(placket.price);
    // Use image.url and icon.url everywhere to avoid rendering issues
    setEditPlacketImage(placket.image?.url || null);
    setEditPlacketIcon(placket.icon?.url || null);
    setInitialEditPlacketImage(placket.image?.url || null);
    setInitialEditPlacketIcon(placket.icon?.url || null);
  };

  const cancelPlacketEdit = () => {
    setEditingPlacketId(null);
    setEditPlacketName("");
    setEditPlacketPrice(0);
    setEditPlacketImage(null);
    setEditPlacketIcon(null);
    setInitialEditPlacketImage(null);
    setInitialEditPlacketIcon(null);
  };

  const handleEditPlacketSubmit = async (placketId: string) => {
    try {
      const newImage = editPlacketImage !== initialEditPlacketImage ? editPlacketImage || "" : "";
      const newIcon = editPlacketIcon !== initialEditPlacketIcon ? editPlacketIcon || "" : "";
      const res = await updatePlacket(placketId, editPlacketName, newImage, editPlacketPrice, newIcon);
      if (res?.success) {
        toast.success(res.message || "Placket updated successfully!");
        fetchPlackets();
        cancelPlacketEdit();
      } else {
        toast.error("Error updating the placket.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the placket.");
    }
  };
  // ----- End new handlers -----

  const submitHandler = async () => {
    try {
      setLoading(true);
      const res = await createPlacket(
        name,
        image!, // Ensure image is provided
        price,
        icon!,  // Ensure icon is provided
        fabricId,
        colorId
      );
      if (res?.success) {
        fetchPlackets();
        setName("");
        setPrice(0);
        setImage(null);
        setIcon(null);
        toast.success(res.message || "Placket created successfully!");
      } else {
        toast.error("There was an error creating the placket.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the placket.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlacket = async () => {
    if (!placketIdToDelete) return;
    try {
      const res = await deletePlacket(placketIdToDelete);
      if (res?.success) {
        fetchPlackets();
        toast.success(res.message || "Placket deleted successfully!");
        setShowConfirmationModal(false);
      } else {
        toast.error("There was an error deleting the placket.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the placket.");
      setShowConfirmationModal(false);
    }
  };

  const openDeleteConfirmation = (placketId: string) => {
    setPlacketIdToDelete(placketId);
    setShowConfirmationModal(true);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Create Placket Form */}
      <div className="create-form bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Create New Placket</h3>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* ...existing input fields... */}
          <div className="form-group">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div className="form-group">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files)}
              className="w-full p-3 border border-gray-300 rounded-md"
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleIconChange(e.target.files)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            {icon && (
              <img
                src={icon}
                alt="Selected Icon"
                className="mt-2 w-32 h-32 object-cover"
              />
            )}
          </div>
          <div className="form-group text-center">
            <button
              onClick={submitHandler}
              disabled={loading}
              className="w-full bg-blue-500 text-white p-3 rounded-md"
            >
              {loading ? "Creating..." : "Create Placket"}
            </button>
          </div>
        </form>
      </div>

      {/* Placket List */}
      <div className="placket-list bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Plackets</h3>
        <ul>
          {plackets.map((placket: any) => (
            <li key={placket._id} className="flex flex-col border p-4 rounded-md mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p>{placket.name}</p>
                  <p>{placket.price}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => openEditPlacketForm(placket)}
                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteConfirmation(placket._id)}
                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {/* New: Edit form for this placket */}
              {editingPlacketId === placket._id && (
                <div className="mt-4 border-t pt-4">
                  <input
                    type="text"
                    value={editPlacketName}
                    onChange={(e) => setEditPlacketName(e.target.value)}
                    placeholder="Edit Name"
                    className="w-full p-2 border rounded mb-2"
                  />
                  <input
                    type="number"
                    value={editPlacketPrice}
                    onChange={(e) => setEditPlacketPrice(Number(e.target.value))}
                    placeholder="Edit Price"
                    className="w-full p-2 border rounded mb-2"
                  />
                  <div className="w-full flex flex-col gap-2 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditPlacketImageChange(e.target.files)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {editPlacketImage && (
                      <img
                        src={editPlacketImage}
                        alt="Preview Edit Image"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    )}
                  </div>
                  <div className="w-full flex flex-col gap-2 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditPlacketIconChange(e.target.files)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {editPlacketIcon && (
                      <img
                        src={editPlacketIcon}
                        alt="Preview Edit Icon"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    )}
                  </div>
                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={cancelPlacketEdit}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditPlacketSubmit(placket._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">
              Are you sure you want to delete this placket?
            </h3>
            <div className="flex justify-between space-x-4">
              <button
                onClick={handleDeletePlacket}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAndManagePlackets;
