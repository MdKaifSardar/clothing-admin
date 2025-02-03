"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify"; // Ensure react-toastify is installed
import {
  createFit,
  getFitsByColorAndFabric,
  deleteFit,
} from "@/lib/database/actions/admin/ShirtArea/Fit/fit.actions"; // Update path as needed
import mongoose from "mongoose";

// Utility function to convert file to base64 string
const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CreateAndManageFits = ({ fabricId, colorId }: { fabricId: string, colorId: string }) => {
  const [image, setImage] = useState<string | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [fits, setFits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [fitIdToDelete, setFitIdToDelete] = useState<string | null>(null); // Use ObjectId type

  const fetchFits = async () => {
    try {
      const fetchedFits = await getFitsByColorAndFabric(fabricId, colorId); // Pass fabricId as a string directly
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

  const submitHandler = async () => {
    try {
      setLoading(true);
      const res = await createFit(
        name,
        image!, // Ensure image is provided
        icon!, // Ensure icon is provided
        price,
        fabricId,
        colorId // Pass the fabricId as a string (no need to convert to ObjectId)
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
    <div className="container mx-auto px-4 py-8">
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
            <li key={fit._id} className="flex justify-between items-center">
              <div className="fit-info">
                <h4 className="font-semibold">{fit.name}</h4>
                <p>Price: {fit.price}</p>
              </div>
              <div className="actions">
                <button
                  onClick={() => openDeleteConfirmation(fit._id)}
                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
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
