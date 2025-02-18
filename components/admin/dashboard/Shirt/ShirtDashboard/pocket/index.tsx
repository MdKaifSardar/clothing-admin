"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createPocket,
  getPocketsByColorAndFabric,
  deletePocket,
  updatePocket, // newly imported updatePocket
} from "@/lib/database/actions/admin/ShirtArea/Pocket/pocket.actions"; // Adjust path as needed

// Utility function to convert file to base64 string
const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CreateAndManagePockets = ({ fabricId, colorId, gender }: { fabricId: string, colorId: string, gender: string }) => {
  const [image, setImage] = useState<string | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [pockets, setPockets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [pocketIdToDelete, setPocketIdToDelete] = useState<string | null>(null);

  // ----- New: Editing state variables for pockets -----
  const [editingPocketId, setEditingPocketId] = useState<string | null>(null);
  const [editPocketName, setEditPocketName] = useState<string>("");
  const [editPocketPrice, setEditPocketPrice] = useState<number>(0);
  const [editPocketImage, setEditPocketImage] = useState<string | null>(null);
  const [initialEditPocketImage, setInitialEditPocketImage] = useState<string | null>(null);
  const [editPocketIcon, setEditPocketIcon] = useState<string | null>(null);
  const [initialEditPocketIcon, setInitialEditPocketIcon] = useState<string | null>(null);
  // ----- End new states -----

  const fetchPockets = async () => {
    try {
      const fetchedPockets = await getPocketsByColorAndFabric(fabricId, colorId, gender);
      setPockets(fetchedPockets);
    } catch (error) {
      console.log("Error fetching pockets:", error);
    }
  };

  useEffect(() => {
    fetchPockets();
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

  // ----- New: Handlers for pocket editing -----
  const handleEditPocketImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditPocketImage(base64);
  };

  const handleEditPocketIconChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditPocketIcon(base64);
  };

  const openEditPocketForm = (pocket: any) => {
    setEditingPocketId(pocket._id);
    setEditPocketName(pocket.name);
    setEditPocketPrice(pocket.price);
    // Use image.url and icon.url to avoid rendering issues
    setEditPocketImage(pocket.image?.url || null);
    setEditPocketIcon(pocket.icon?.url || null);
    setInitialEditPocketImage(pocket.image?.url || null);
    setInitialEditPocketIcon(pocket.icon?.url || null);
  };

  const cancelPocketEdit = () => {
    setEditingPocketId(null);
    setEditPocketName("");
    setEditPocketPrice(0);
    setEditPocketImage(null);
    setEditPocketIcon(null);
    setInitialEditPocketImage(null);
    setInitialEditPocketIcon(null);
  };

  const handleEditPocketSubmit = async (pocketId: string) => {
    try {
      const newImage = editPocketImage !== initialEditPocketImage ? editPocketImage || "" : "";
      const newIcon = editPocketIcon !== initialEditPocketIcon ? editPocketIcon || "" : "";
      const res = await updatePocket(pocketId, editPocketName, newImage, editPocketPrice, newIcon);
      if (res?.success) {
        toast.success(res.message || "Pocket updated successfully!");
        fetchPockets();
        cancelPocketEdit();
      } else {
        toast.error("Error updating the pocket.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the pocket.");
    }
  };
  // ----- End new handlers -----

  const submitHandler = async () => {
    try {
      setLoading(true);
      const res = await createPocket(name, image!, price, icon!, fabricId, colorId, gender);
      if (res?.success) {
        fetchPockets(); // Fetch updated pockets after successful creation
        setName("");
        setPrice(0);
        setImage(null);
        setIcon(null);
        toast.success(res.message || "Pocket created successfully!");
      } else {
        toast.error("There was an error creating the pocket.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the pocket.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePocket = async () => {
    if (!pocketIdToDelete) return;
    try {
      const res = await deletePocket(pocketIdToDelete);
      if (res?.success) {
        fetchPockets(); // Refresh the list after successful deletion
        toast.success(res.message || "Pocket deleted successfully!");
        setShowConfirmationModal(false); // Close the modal
      } else {
        toast.error("There was an error deleting the pocket.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the pocket.");
      setShowConfirmationModal(false);
    }
  };

  const openDeleteConfirmation = (pocketId: string) => {
    setPocketIdToDelete(pocketId);
    setShowConfirmationModal(true);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Create Pocket Form */}
      <div className="create-form bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Create New Pocket</h3>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="form-group">
            <label htmlFor="pocket-name" className="block mb-1 font-medium">Pocket Name</label>
            <input
              id="pocket-name"
              type="text"
              placeholder="Enter pocket name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div className="form-group">
            <label htmlFor="pocket-price" className="block mb-1 font-medium">Price</label>
            <input
              id="pocket-price"
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div className="form-group">
            <label htmlFor="pocket-image" className="block mb-1 font-medium">Pocket Image</label>
            <input
              id="pocket-image"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            {image && (
              <img src={image} alt="Selected Image" className="mt-2 w-32 h-32 object-cover" />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="pocket-icon" className="block mb-1 font-medium">Pocket Icon</label>
            <input
              id="pocket-icon"
              type="file"
              accept="image/*"
              onChange={(e) => handleIconChange(e.target.files)}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            {icon && (
              <img src={icon} alt="Selected Icon" className="mt-2 w-32 h-32 object-cover" />
            )}
          </div>
          <div className="form-group text-center">
            <button
              onClick={submitHandler}
              disabled={loading}
              className="w-full bg-blue-500 text-white p-3 rounded-md"
            >
              {loading ? "Creating..." : "Create Pocket"}
            </button>
          </div>
        </form>
      </div>

      {/* Pocket List */}
      <div className="pocket-list bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Pockets</h3>
        <ul>
          {pockets.map((pocket) => (
            <li key={pocket._id} className="flex flex-col border p-4 rounded-md mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p>{pocket.name}</p>
                  <p>{`$${pocket.price}`}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => openEditPocketForm(pocket)}
                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteConfirmation(pocket._id)}
                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {/* New: Edit form for this pocket */}
              {editingPocketId === pocket._id && (
                <div className="mt-4 border-t pt-4">
                  <div className="mb-2">
                    <label htmlFor="edit-pocket-name" className="block mb-1 font-medium">Edit Pocket Name</label>
                    <input
                      id="edit-pocket-name"
                      type="text"
                      value={editPocketName}
                      onChange={(e) => setEditPocketName(e.target.value)}
                      placeholder="Update pocket name"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="edit-pocket-price" className="block mb-1 font-medium">Edit Price</label>
                    <input
                      id="edit-pocket-price"
                      type="number"
                      value={editPocketPrice}
                      onChange={(e) => setEditPocketPrice(Number(e.target.value))}
                      placeholder="Update price"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="edit-pocket-image" className="block mb-1 font-medium">Change Pocket Image</label>
                    <input
                      id="edit-pocket-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditPocketImageChange(e.target.files)}
                      className="w-full p-2 border rounded"
                    />
                    {editPocketImage && (
                      <img src={editPocketImage} alt="Edit Image" className="w-32 h-32 object-cover rounded-md mt-1" />
                    )}
                  </div>
                  <div className="mb-2">
                    <label htmlFor="edit-pocket-icon" className="block mb-1 font-medium">Change Pocket Icon</label>
                    <input
                      id="edit-pocket-icon"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditPocketIconChange(e.target.files)}
                      className="w-full p-2 border rounded"
                    />
                    {editPocketIcon && (
                      <img src={editPocketIcon} alt="Edit Icon" className="w-32 h-32 object-cover rounded-md mt-1" />
                    )}
                  </div>
                  <div className="flex gap-4 justify-end">
                    <button onClick={cancelPocketEdit} className="bg-gray-300 px-4 py-2 rounded">
                      Cancel
                    </button>
                    <button onClick={() => handleEditPocketSubmit(pocket._id)} className="bg-blue-600 text-white px-4 py-2 rounded">
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
              Are you sure you want to delete this pocket?
            </h3>
            <div className="flex justify-between space-x-4">
              <button
                onClick={handleDeletePocket}
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

export default CreateAndManagePockets;
