"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createCollar,
  deleteCollar,
  getCollarsByColorAndFabric,
} from "@/lib/database/actions/admin/ShirtArea/Collar/collar.actions";

// Utility function to convert file to base64 string
const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CreateAndManageCollars = ({ fabricId, colorId }: { fabricId: string, colorId: string }) => {
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [styleIcon, setStyleIcon] = useState<string | null>(null);
  const [heightIcon, setHeightIcon] = useState<string | null>(null);
  const [collarButtonImage, setCollarButtonImage] = useState<string | null>(
    null
  );
  const [collarButtonIcon, setCollarButtonIcon] = useState<string | null>(null);
  const [styleName, setStyleName] = useState<string>("");
  const [heightName, setHeightName] = useState<string>("");
  const [collarButtonName, setCollarButtonName] = useState<string>("");
  const [stylePrice, setStylePrice] = useState<number>(0); // Price for style
  const [heightPrice, setHeightPrice] = useState<number>(0); // Price for height
  const [collarButtonPrice, setCollarButtonPrice] = useState<number>(0); // Price for collar button
  const [collars, setCollars] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [collarIdToDelete, setCollarIdToDelete] = useState<string | null>(null);

  const fetchCollars = async () => {
    try {
      const fetchedCollars = await getCollarsByColorAndFabric(fabricId, colorId);
      setCollars(fetchedCollars);
    } catch (error) {
      console.log("Error fetching collars:", error);
    }
  };

  useEffect(() => {
    fetchCollars();
  }, [fabricId]);

  const handleImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64Image = await fileToBase64(files[0]);
    setStyleImage(base64Image);
  };

  const handleIconChange = async (files: FileList | null) => {
    if (!files) return;
    const base64Icon = await fileToBase64(files[0]);
    setStyleIcon(base64Icon);
  };

  const handleHeightIconChange = async (files: FileList | null) => {
    if (!files) return;
    const base64HeightIcon = await fileToBase64(files[0]);
    setHeightIcon(base64HeightIcon);
  };

  const handleCollarButtonImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64CollarButtonImage = await fileToBase64(files[0]);
    setCollarButtonImage(base64CollarButtonImage);
  };

  const handleCollarButtonIconChange = async (files: FileList | null) => {
    if (!files) return;
    const base64CollarButtonIcon = await fileToBase64(files[0]);
    setCollarButtonIcon(base64CollarButtonIcon);
  };

  const submitHandler = async () => {
    try {
      setLoading(true);

      const res = await createCollar(
        {
          name: styleName,
          image: styleImage!,
          icon: styleIcon!,
          price: stylePrice, // Pass style price
        },
        {
          name: heightName,
          icon: heightIcon!,
          price: heightPrice, // Pass height price
        },
        {
          name: collarButtonName,
          image: collarButtonImage!,
          icon: collarButtonIcon!,
          price: collarButtonPrice, // Pass collar button price
        },
        fabricId,
        colorId
      );

      if (res?.success) {
        fetchCollars(); // Fetch updated collars after successful creation
        setStyleName("");
        setHeightName("");
        setCollarButtonName("");
        setStylePrice(0);
        setHeightPrice(0);
        setCollarButtonPrice(0); // Reset the price fields
        setStyleImage(null);
        setStyleIcon(null);
        setHeightIcon(null);
        setCollarButtonImage(null);
        setCollarButtonIcon(null);
        toast.success(res.message || "Collar created successfully!");
      } else {
        toast.error("There was an error creating the collar.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the collar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollar = async () => {
    if (!collarIdToDelete) return;
    try {
      const res = await deleteCollar(collarIdToDelete);
      if (res?.success) {
        fetchCollars();
        toast.success(res.message || "Collar deleted successfully!");
        setShowConfirmationModal(false);
      } else {
        toast.error("There was an error deleting the collar.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the collar.");
      setShowConfirmationModal(false);
    }
  };

  const openDeleteConfirmation = (collarId: string) => {
    setCollarIdToDelete(collarId);
    setShowConfirmationModal(true);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Create Collar Form */}
      <div className="create-form bg-white p-8 rounded-lg shadow-lg mb-8 max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold mb-6">Create New Collar</h3>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Style Name */}
          <div className="form-group">
            <label
              htmlFor="styleName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Style Name
            </label>
            <input
              type="text"
              id="styleName"
              placeholder="Enter Style Name"
              value={styleName}
              onChange={(e) => setStyleName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Style Image */}
          <div className="form-group">
            <label
              htmlFor="styleImage"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Style Image
            </label>
            <input
              type="file"
              id="styleImage"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {styleImage && (
              <img
                src={styleImage}
                alt="Selected Image"
                className="mt-3 w-32 h-32 object-cover border border-gray-200 rounded-md"
              />
            )}
          </div>

          {/* Style Icon */}
          <div className="form-group">
            <label
              htmlFor="styleIcon"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Style Icon
            </label>
            <input
              type="file"
              id="styleIcon"
              accept="image/*"
              onChange={(e) => handleIconChange(e.target.files)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {styleIcon && (
              <img
                src={styleIcon}
                alt="Selected Icon"
                className="mt-3 w-32 h-32 object-cover border border-gray-200 rounded-md"
              />
            )}
          </div>

          {/* Style Price */}
          <div className="form-group">
            <label
              htmlFor="stylePrice"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Style Price
            </label>
            <input
              type="number"
              id="stylePrice"
              placeholder="Enter Style Price"
              value={stylePrice}
              onChange={(e) => setStylePrice(Number(e.target.value))}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Height Name */}
          <div className="form-group">
            <label
              htmlFor="heightName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Height Name
            </label>
            <input
              type="text"
              id="heightName"
              placeholder="Enter Height Name"
              value={heightName}
              onChange={(e) => setHeightName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Height Icon */}
          <div className="form-group">
            <label
              htmlFor="heightIcon"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Height Icon
            </label>
            <input
              type="file"
              id="heightIcon"
              accept="image/*"
              onChange={(e) => handleHeightIconChange(e.target.files)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {heightIcon && (
              <img
                src={heightIcon}
                alt="Selected Height Icon"
                className="mt-3 w-32 h-32 object-cover border border-gray-200 rounded-md"
              />
            )}
          </div>

          {/* Height Price */}
          <div className="form-group">
            <label
              htmlFor="heightPrice"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Height Price
            </label>
            <input
              type="number"
              id="heightPrice"
              placeholder="Enter Height Price"
              value={heightPrice}
              onChange={(e) => setHeightPrice(Number(e.target.value))}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Collar Button Name */}
          <div className="form-group">
            <label
              htmlFor="collarButtonName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Collar Button Name
            </label>
            <input
              type="text"
              id="collarButtonName"
              placeholder="Enter Collar Button Name"
              value={collarButtonName}
              onChange={(e) => setCollarButtonName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Collar Button Image */}
          <div className="form-group">
            <label
              htmlFor="collarButtonImage"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Collar Button Image
            </label>
            <input
              type="file"
              id="collarButtonImage"
              accept="image/*"
              onChange={(e) => handleCollarButtonImageChange(e.target.files)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {collarButtonImage && (
              <img
                src={collarButtonImage}
                alt="Selected Collar Button Image"
                className="mt-3 w-32 h-32 object-cover border border-gray-200 rounded-md"
              />
            )}
          </div>

          {/* Collar Button Icon */}
          <div className="form-group">
            <label
              htmlFor="collarButtonIcon"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Collar Button Icon
            </label>
            <input
              type="file"
              id="collarButtonIcon"
              accept="image/*"
              onChange={(e) => handleCollarButtonIconChange(e.target.files)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {collarButtonIcon && (
              <img
                src={collarButtonIcon}
                alt="Selected Collar Button Icon"
                className="mt-3 w-32 h-32 object-cover border border-gray-200 rounded-md"
              />
            )}
          </div>

          {/* Collar Button Price */}
          <div className="form-group">
            <label
              htmlFor="collarButtonPrice"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Collar Button Price
            </label>
            <input
              type="number"
              id="collarButtonPrice"
              placeholder="Enter Collar Button Price"
              value={collarButtonPrice}
              onChange={(e) => setCollarButtonPrice(Number(e.target.value))}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={submitHandler}
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Collar"}
          </button>
        </form>
      </div>

      {/* Collar List */}
      <div className="collar-list bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Manage Collars</h3>
        {collars.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              {/* Table Header */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">
                    Collar Style
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Collar Height
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Collar Button
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {collars.map((collar) => (
                  <tr key={collar._id} className="border-t">
                    <td className="px-4 py-2">
                      {collar.style ? (
                        <>
                          <p className="font-semibold">{collar.style.name}</p>
                          <p>Price: ₹{collar.style.price}</p>
                        </>
                      ) : (
                        <p></p>
                      )}
                    </td>

                    <td className="px-4 py-2">
                      {collar.height ? (
                        <>
                          <p className="font-semibold">{collar.height.name}</p>
                          <p>Price: ₹{collar.height.price}</p>
                        </>
                      ) : (
                        <p></p>
                      )}
                    </td>

                    <td className="px-4 py-2">
                      {collar.collar_button ? (
                        <>
                          <p className="font-semibold">
                            {collar.collar_button.name}
                          </p>
                          <p>Price: ₹{collar.collar_button.price}</p>
                        </>
                      ) : (
                        <p></p>
                      )}
                    </td>

                    {/* Delete Button */}
                    <td className="px-4 py-2 text-center">
                      <button
                        className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                        onClick={() => openDeleteConfirmation(collar._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No collars found.</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmationModal && (
        <div className="modal fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="modal-content bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this collar?</p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={handleDeleteCollar}
                className="bg-red-600 text-white py-2 px-4 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-600 text-white py-2 px-4 rounded"
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

export default CreateAndManageCollars;
