import { useState, useEffect } from "react";
import { toast } from "react-toastify"; // Ensure react-toastify is installed
import {
  createBottom,
  deleteBottom,
  getBottomsByColorAndFabric,
} from "@/lib/database/actions/admin/ShirtArea/Bottom/bottom.actions";
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

const CreateAndManageBottoms = ({
  fabricId,
  colorId,
}: {
  fabricId: string,
  colorId: string
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [bottoms, setBottoms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [bottomIdToDelete, setBottomIdToDelete] = useState<string | null>(null); // Use ObjectId type

  const fetchBottoms = async () => {
    try {
      const fetchedBottoms = await getBottomsByColorAndFabric(fabricId, colorId); // Pass fabricId as a string directly
      setBottoms(fetchedBottoms);
    } catch (error) {
      console.log("Error fetching bottoms:", error);
    }
  };

  useEffect(() => {
    fetchBottoms();
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
      const res = await createBottom(
        name,
        image!, // Ensure image is provided
        icon!, // Ensure icon is provided
        price,
        fabricId,
        colorId // Pass the fabricId as a string (no need to convert to ObjectId)
      );
      if (res?.success) {
        fetchBottoms(); // Fetch updated bottoms after successful creation
        setName("");
        setPrice(0);
        setImage(null);
        setIcon(null);
        toast.success(res.message || "Bottom created successfully!");
      } else {
        toast.error("There was an error creating the bottom.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the bottom.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBottom = async () => {
    if (!bottomIdToDelete) return;
    try {
      const res = await deleteBottom(bottomIdToDelete); // bottomIdToDelete is now ObjectId
      if (res?.success) {
        fetchBottoms(); // Refresh the list after successful deletion
        toast.success(res.message || "Bottom deleted successfully!");
        setShowConfirmationModal(false); // Close the modal
      } else {
        toast.error("There was an error deleting the bottom.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the bottom.");
      setShowConfirmationModal(false);
    }
  };

  const openDeleteConfirmation = (bottomId: string) => {
    setBottomIdToDelete(bottomId); // Convert string to ObjectId
    setShowConfirmationModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Create Bottom Form */}
      <div className="create-form bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Create New Bottom</h3>
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
            {loading ? "Creating..." : "Create Bottom"}
          </button>
        </form>
      </div>

      {/* Bottoms List */}
      <div className="bottoms-list bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Bottoms List</h3>
        <ul className="space-y-4">
          {bottoms.length > 0 ? (
            bottoms.map((bottom) => (
              <li
                key={bottom._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-md shadow-sm hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={bottom.image.url}
                    alt={bottom.name}
                    className="w-12 h-12 object-cover rounded-full"
                  />
                  <div>
                    <h4 className="text-lg font-semibold">{bottom.name}</h4>
                    <p className="text-sm text-gray-600">${bottom.price}</p>
                  </div>
                </div>
                <button
                  onClick={() => openDeleteConfirmation(bottom._id)}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-500">
              No bottoms available for this color and fabric combination.
            </p>
          )}
        </ul>
      </div>

      {/* Custom Modal for Deleting */}
      {showConfirmationModal && (
        <div className="modal-overlay fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">
              Are you sure you want to delete this bottom?
            </h3>
            <div className="flex justify-between">
              <button
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleDeleteBottom}
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

export default CreateAndManageBottoms;
