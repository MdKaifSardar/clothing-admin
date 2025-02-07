"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createPlacket,
  getPlacketsByColorAndFabric,
  deletePlacket,
} from "@/lib/database/actions/admin/ShirtArea/Placket/placket.actions"; // Adjust path as needed

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
  const [image, setImage] = useState<string | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [plackets, setPlackets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [placketIdToDelete, setPlacketIdToDelete] = useState<string | null>(null);

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

  const submitHandler = async () => {
    try {
      setLoading(true);
      const res = await createPlacket(
        name,
        image!, // Ensure image is provided
        price,
        icon!, // Ensure icon is provided
        fabricId,
        colorId
      );
      if (res?.success) {
        fetchPlackets(); // Fetch updated plackets after successful creation
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
        fetchPlackets(); // Refresh the list after successful deletion
        toast.success(res.message || "Placket deleted successfully!");
        setShowConfirmationModal(false); // Close the modal
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
              {loading ? "Creating..." : "Create Placket"}
            </button>
          </div>
        </form>
      </div>

      {/* Placket List */}
      <div className="placket-list bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Plackets</h3>
        <ul>
          {plackets.map((placket) => (
            <li key={placket._id} className="flex justify-between items-center mb-4">
              <div>
                <p>{placket.name}</p>
                <p>{placket.price}</p>
              </div>
              <div>
                <button
                  onClick={() => openDeleteConfirmation(placket._id)}
                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">Are you sure you want to delete this placket?</h3>
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
