"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify"; // Ensure react-toastify is installed
import {
  createBack,
  deleteBack,
  getBacksByColorAndFabric,
  updateBack,
} from "@/lib/database/actions/admin/ShirtArea/Back/back.actions";

// Utility function to convert file to base64 string
const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CreateAndManageBacks = ({
  fabricId,
  colorId,
}: {
  fabricId: string;
  colorId: string;
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [backs, setBacks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [backIdToDelete, setBackIdToDelete] = useState<string | null>(null); // Use ObjectId type

  // New state for editing
  const [editingBackId, setEditingBackId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    price: number;
  }>({ name: "", price: 0 });
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editIcon, setEditIcon] = useState<string | null>(null);

  // Add new states for original images
  const [initialEditImage, setInitialEditImage] = useState<string | null>(null);
  const [initialEditIcon, setInitialEditIcon] = useState<string | null>(null);

  const fetchBacks = async () => {
    try {
      const fetchedBacks = await getBacksByColorAndFabric(fabricId, colorId); // Pass fabricId as a string directly
      setBacks(fetchedBacks);
    } catch (error) {
      console.log("Error fetching backs:", error);
    }
  };

  useEffect(() => {
    fetchBacks();
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

  // New handlers for edit form
  const handleEditImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64Image = await fileToBase64(files[0]);
    setEditImage(base64Image);
  };

  const handleEditIconChange = async (files: FileList | null) => {
    if (!files) return;
    const base64Icon = await fileToBase64(files[0]);
    setEditIcon(base64Icon);
  };

  const submitHandler = async () => {
    try {
      setLoading(true);
      const res = await createBack(
        name,
        image!,
        icon!,
        price,
        fabricId,
        colorId // Pass the fabricId as a string (no need to convert to ObjectId)
      );
      if (res?.success) {
        fetchBacks(); // Fetch updated backs after successful creation
        setName("");
        setPrice(0);
        setImage(null);
        setIcon(null);
        toast.success(res.message || "Back created successfully!");
      } else {
        toast.error("There was an error creating the back.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the back.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBack = async () => {
    if (!backIdToDelete) return;
    try {
      const res = await deleteBack(backIdToDelete); // backIdToDelete is now ObjectId
      if (res?.success) {
        fetchBacks(); // Refresh the list after successful deletion
        toast.success(res.message || "Back deleted successfully!");
        setShowConfirmationModal(false); // Close the modal
      } else {
        toast.error("There was an error deleting the back.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the back.");
      setShowConfirmationModal(false);
    }
  };

  const openDeleteConfirmation = (backId: string) => {
    setBackIdToDelete(backId); // Convert string to ObjectId
    setShowConfirmationModal(true);
  };

  // Modify openEditForm to store original image/icon URLs
  const openEditForm = (back: any) => {
    setEditingBackId(back._id);
    setEditFormData({ name: back.name, price: back.price });
    setEditImage(back.image.url);
    setEditIcon(back.icon.url);
    setInitialEditImage(back.image.url);
    setInitialEditIcon(back.icon.url);
  };

  // Modify cancelEdit to reset new states
  const cancelEdit = () => {
    setEditingBackId(null);
    setEditFormData({ name: "", price: 0 });
    setEditImage(null);
    setEditIcon(null);
    setInitialEditImage(null);
    setInitialEditIcon(null);
  };

  // Modify handleEditSubmit to pass images only if changed
  const handleEditSubmit = async (backId: string) => {
    try {
      // Pass new image/icon only if they have been changed
      const newImage = editImage !== initialEditImage ? editImage || "" : "";
      const newIcon = editIcon !== initialEditIcon ? editIcon || "" : "";

      const res = await updateBack(
        backId,
        editFormData.name,
        newImage,
        newIcon,
        editFormData.price
      );
      if (res?.success) {
        toast.success(res.message || "Back updated successfully!");
        fetchBacks(); // Refresh list after successful edit
        cancelEdit();
      } else {
        toast.error("There was an error updating the back.");
      }
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("An error occurred while updating the back.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* Create Back Form */}
      <div className="create-form bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Create New Back</h3>
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
          <button
            type="button"
            onClick={submitHandler}
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Creating..." : "Create Back"}
          </button>
        </form>
      </div>

      {/* Backs List */}
      <div className="backs-list bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Backs List</h3>
        <ul className="space-y-4">
          {backs.length > 0 ? (
            backs.map((back) => (
              <li key={back._id}>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md shadow-sm hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <img
                      src={back.image.url}
                      alt={back.name}
                      className="w-12 h-12 object-cover rounded-full"
                    />
                    <div>
                      <h4 className="text-lg font-semibold">{back.name}</h4>
                      <p className="text-sm text-gray-600">${back.price}</p>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => openEditForm(back)}
                      className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteConfirmation(back._id)}
                      className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {editingBackId === back._id && (
                  <div className="w-full mt-2 p-4">
                    <h5 className="text-xl font-semibold mb-2">Edit Back</h5>
                    <div className="flex flex-col justify-center items-center gap-2">
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            name: e.target.value,
                          })
                        }
                        placeholder="Back Name"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />

                      <input
                        type="number"
                        value={editFormData.price}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            price: Number(e.target.value),
                          })
                        }
                        placeholder="Price"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />

                      <div className="w-full flex flex-col justify-center items-start gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleEditImageChange(e.target.files)
                          }
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

                      <div className="w-full flex flex-col justify-center items-start gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleEditIconChange(e.target.files)}
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
                      <div className="flex flex-row justify-center items-center w-full gap-2">
                        <button
                          onClick={() => handleEditSubmit(back._id)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Update
                        </button>

                        <button
                          onClick={cancelEdit}
                          className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
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
              No backs available for this color and fabric combination.
            </p>
          )}
        </ul>
      </div>

      {/* Custom Modal for Deleting */}
      {showConfirmationModal && (
        <div className="modal-overlay fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">
              Are you sure you want to delete this back?
            </h3>
            <div className="flex justify-between">
              <button
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleDeleteBack}
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

export default CreateAndManageBacks;
