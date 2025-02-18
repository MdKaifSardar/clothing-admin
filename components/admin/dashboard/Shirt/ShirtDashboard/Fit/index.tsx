"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
// Updated import: include updateFit for editing
import {
  createFit,
  getFitsByColorAndFabric,
  deleteFit,
  updateFit,
} from "@/lib/database/actions/admin/ShirtArea/Fit/fit.actions";

// Utility function to convert file to base64 string
const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CreateAndManageFits = ({
  fabricId,
  colorId,
  gender,
}: {
  fabricId: string;
  colorId: string;
  gender: string;
}) => {
  // ...existing state variables...
  const [image, setImage] = useState<string | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [fits, setFits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [fitIdToDelete, setFitIdToDelete] = useState<string | null>(null);

  // ----- New: Editing state variables -----
  const [editingFitId, setEditingFitId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editImage, setEditImage] = useState<string | null>(null);
  const [initialEditImage, setInitialEditImage] = useState<string | null>(null);
  const [editIcon, setEditIcon] = useState<string | null>(null);
  const [initialEditIcon, setInitialEditIcon] = useState<string | null>(null);
  // ----- End new states -----

  const fetchFits = async () => {
    try {
      const fetchedFits = await getFitsByColorAndFabric(fabricId, colorId, gender); // Pass fabricId as a string directly
      setFits(fetchedFits);
    } catch (error) {
      console.log("Error fetching fits:", error);
    }
  };

  useEffect(() => {
    fetchFits();
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

  // ----- New: Handlers for editing similar to cuff -----
  const handleEditFitImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditImage(base64);
  };

  const handleEditFitIconChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditIcon(base64);
  };

  const openEditForm = (fit: any) => {
    setEditingFitId(fit._id);
    setEditName(fit.name);
    setEditPrice(fit.price);
    setEditImage(fit.image?.url || null);
    setEditIcon(fit.icon?.url || null);
    setInitialEditImage(fit.image?.url || null);
    setInitialEditIcon(fit.icon?.url || null);
  };

  const cancelEdit = () => {
    setEditingFitId(null);
    setEditName("");
    setEditPrice(0);
    setEditImage(null);
    setEditIcon(null);
    setInitialEditImage(null);
    setInitialEditIcon(null);
  };

  const handleEditSubmit = async (fitId: string) => {
    try {
      const newImage = editImage !== initialEditImage ? editImage || "" : "";
      const newIcon = editIcon !== initialEditIcon ? editIcon || "" : "";
      const res = await updateFit(
        fitId,
        editName,
        newImage,
        newIcon,
        editPrice
      );
      if (res?.success) {
        toast.success(res.message || "Fit updated successfully!");
        fetchFits();
        cancelEdit();
      } else {
        toast.error("Error updating the fit.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the fit.");
    }
  };
  // ----- End new handlers -----

  const submitHandler = async () => {
    try {
      setLoading(true);
      const res = await createFit(
        name,
        image!, // Ensure image is provided
        icon!, // Ensure icon is provided
        price,
        fabricId,
        colorId, // Pass the fabricId as a string (no need to convert to ObjectId)
        gender
      );
      if (res?.success) {
        fetchFits(); // Fetch updated fits after successful creation
        setName("");
        setPrice(0);
        setImage(null);
        setIcon(null);
        toast.success(res.message || "Fit created successfully!");
      } else {
        toast.error("There was an error creating the fit.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the fit.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFit = async () => {
    if (!fitIdToDelete) return;
    try {
      const res = await deleteFit(fitIdToDelete); // fitIdToDelete is now ObjectId
      if (res?.success) {
        fetchFits(); // Refresh the list after successful deletion
        toast.success(res.message || "Fit deleted successfully!");
        setShowConfirmationModal(false); // Close the modal
      } else {
        toast.error("There was an error deleting the fit.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the fit.");
      setShowConfirmationModal(false);
    }
  };

  const openDeleteConfirmation = (fitId: string) => {
    setFitIdToDelete(fitId); // Convert string to ObjectId
    setShowConfirmationModal(true);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Create Fit Form */}
      <div className="create-form bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Create New Fit</h3>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="form-group">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleIconChange(e.target.files)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600"
            >
              {loading ? "Creating..." : "Create Fit"}
            </button>
          </div>
        </form>
      </div>

      {/* Fit List */}
      <div className="fits-list bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">All Fits</h3>
        <ul className="space-y-4">
          {fits.map((fit: any) => (
            <li key={fit._id} className="border p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div className="fit-info">
                  <h4 className="font-semibold">{fit.name}</h4>
                  <p>Price: {fit.price}</p>
                </div>
                <div className="actions space-x-2">
                  <button
                    onClick={() => openEditForm(fit)}
                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteConfirmation(fit._id)}
                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {/* New: Edit form for this fit */}
              {editingFitId === fit._id && (
                <div className="mt-4 border-t pt-4">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Edit Name"
                    className="w-full p-2 border rounded mb-2"
                  />
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    placeholder="Edit Price"
                    className="w-full p-2 border rounded mb-2"
                  />
                  <div className="w-full flex flex-col justify-center items-start gap-2 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditFitImageChange(e.target.files)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {editImage && (
                      <img
                        src={editImage}
                        alt="Preview Edit Image"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    )}
                  </div>
                  <div className="w-full flex flex-col justify-center items-start gap-2 mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditFitIconChange(e.target.files)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {editIcon && (
                      <img
                        src={editIcon}
                        alt="Preview Edit Icon"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    )}
                  </div>
                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditSubmit(fit._id)}
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

      {/* Delete Confirmation Modal */}
      {showConfirmationModal && (
        <div className="modal-overlay fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="modal-content bg-white p-6 rounded-lg">
            <h4 className="text-xl font-semibold mb-4">
              Are you sure you want to delete this fit?
            </h4>
            <div className="flex justify-between">
              <button
                onClick={handleDeleteFit}
                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
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

export default CreateAndManageFits;
