"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createCuff,
  deleteCuff,
  getCuffsByColorAndFabric,
} from "@/lib/database/actions/admin/ShirtArea/Cuff/cuff.actions";

// Utility function to convert file to base64 string
const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CreateAndManageCuffs = ({ fabricId, colorId }: { fabricId: string, colorId: string }) => {
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [styleIcon, setStyleIcon] = useState<string | null>(null);
  const [cufflinkImage, setCufflinkImage] = useState<string | null>(null);
  const [cufflinkIcon, setCufflinkIcon] = useState<string | null>(null);
  const [styleName, setStyleName] = useState<string>("");
  const [cufflinkName, setCufflinkName] = useState<string>("");
  const [stylePrice, setStylePrice] = useState<number>(0); // Price for style
  const [cufflinkPrice, setCufflinkPrice] = useState<number>(0); // Price for cufflinks
  const [cuffs, setCuffs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [cuffIdToDelete, setCuffIdToDelete] = useState<string | null>(null);

  const fetchCuffs = async () => {
    try {
      const fetchedCuffs = await getCuffsByColorAndFabric(fabricId, colorId);
      setCuffs(fetchedCuffs);
    } catch (error) {
      console.log("Error fetching cuffs:", error);
    }
  };

  useEffect(() => {
    fetchCuffs();
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

  const handleCufflinkImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64CufflinkImage = await fileToBase64(files[0]);
    setCufflinkImage(base64CufflinkImage);
  };

  const handleCufflinkIconChange = async (files: FileList | null) => {
    if (!files) return;
    const base64CufflinkIcon = await fileToBase64(files[0]);
    setCufflinkIcon(base64CufflinkIcon);
  };

  const submitHandler = async () => {
    try {
      setLoading(true);

      const res = await createCuff(
        {
          name: styleName,
          image: styleImage!,
          icon: styleIcon!,
          price: stylePrice, // Pass style price
        },
        {
          name: cufflinkName,
          image: cufflinkImage!,
          icon: cufflinkIcon!,
          price: cufflinkPrice, // Pass cufflink price
        },
        fabricId,
        colorId
      );

      if (res?.success) {
        fetchCuffs(); // Fetch updated cuffs after successful creation
        setStyleName("");
        setCufflinkName("");
        setStylePrice(0);
        setCufflinkPrice(0);
        setStyleImage(null);
        setStyleIcon(null);
        setCufflinkImage(null);
        setCufflinkIcon(null);
        toast.success(res.message || "Cuff created successfully!");
      } else {
        toast.error("There was an error creating the cuff.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the cuff.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCuff = async () => {
    if (!cuffIdToDelete) return;
    try {
      const res = await deleteCuff(cuffIdToDelete);
      if (res?.success) {
        fetchCuffs();
        toast.success(res.message || "Cuff deleted successfully!");
        setShowConfirmationModal(false);
      } else {
        toast.error("There was an error deleting the cuff.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the cuff.");
      setShowConfirmationModal(false);
    }
  };

  const openDeleteConfirmation = (cuffId: string) => {
    setCuffIdToDelete(cuffId);
    setShowConfirmationModal(true);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Create Cuff Form */}
      <div className="w-full create-form bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Create New Cuff</h3>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-full p-6 bg-white shadow-md rounded-md space-y-6"
        >
          {/* Style Name */}
          <div>
            <label
              htmlFor="styleName"
              className="block text-sm font-medium text-gray-700"
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
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Style Image */}
          <div>
            <label
              htmlFor="styleImage"
              className="block text-sm font-medium text-gray-700"
            >
              Style Image
            </label>
            <input
              type="file"
              id="styleImage"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {styleImage && (
              <img
                src={styleImage}
                alt="Selected Style"
                className="mt-3 w-32 h-32 object-cover rounded-md border"
              />
            )}
          </div>

          {/* Style Icon */}
          <div>
            <label
              htmlFor="styleIcon"
              className="block text-sm font-medium text-gray-700"
            >
              Style Icon
            </label>
            <input
              type="file"
              id="styleIcon"
              accept="image/*"
              onChange={(e) => handleIconChange(e.target.files)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {styleIcon && (
              <img
                src={styleIcon}
                alt="Selected Icon"
                className="mt-3 w-32 h-32 object-cover rounded-md border"
              />
            )}
          </div>

          {/* Style Price */}
          <div>
            <label
              htmlFor="stylePrice"
              className="block text-sm font-medium text-gray-700"
            >
              Style Price
            </label>
            <input
              type="number"
              id="stylePrice"
              value={stylePrice}
              onChange={(e) => setStylePrice(Number(e.target.value))}
              required
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Cufflink Name */}
          <div>
            <label
              htmlFor="cufflinkName"
              className="block text-sm font-medium text-gray-700"
            >
              Cufflink Name
            </label>
            <input
              type="text"
              id="cufflinkName"
              placeholder="Enter Cufflink Name"
              value={cufflinkName}
              onChange={(e) => setCufflinkName(e.target.value)}
              required
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Cufflink Image */}
          <div>
            <label
              htmlFor="cufflinkImage"
              className="block text-sm font-medium text-gray-700"
            >
              Cufflink Image
            </label>
            <input
              type="file"
              id="cufflinkImage"
              accept="image/*"
              onChange={(e) => handleCufflinkImageChange(e.target.files)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {cufflinkImage && (
              <img
                src={cufflinkImage}
                alt="Selected Cufflink"
                className="mt-3 w-32 h-32 object-cover rounded-md border"
              />
            )}
          </div>

          {/* Cufflink Icon */}
          <div>
            <label
              htmlFor="cufflinkIcon"
              className="block text-sm font-medium text-gray-700"
            >
              Cufflink Icon
            </label>
            <input
              type="file"
              id="cufflinkIcon"
              accept="image/*"
              onChange={(e) => handleCufflinkIconChange(e.target.files)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {cufflinkIcon && (
              <img
                src={cufflinkIcon}
                alt="Selected Cufflink Icon"
                className="mt-3 w-32 h-32 object-cover rounded-md border"
              />
            )}
          </div>

          {/* Cufflink Price */}
          <div>
            <label
              htmlFor="cufflinkPrice"
              className="block text-sm font-medium text-gray-700"
            >
              Cufflink Price
            </label>
            <input
              type="number"
              id="cufflinkPrice"
              value={cufflinkPrice}
              onChange={(e) => setCufflinkPrice(Number(e.target.value))}
              required
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={submitHandler}
            disabled={loading}
            className={`w-full py-3 rounded-md text-white font-semibold ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {loading ? "Creating..." : "Create Cuff"}
          </button>
        </form>
      </div>

      {/* Cuffs List */}
      <div className="collar-list bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Manage Cuffs</h3>
        {cuffs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              {/* Table Header */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">
                    Cuff Style
                  </th>
                  <th className="px-4 py-2 text-left font-semibold">
                    Cufflinks
                  </th>
                  <th className="px-4 py-2 text-center font-semibold">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {cuffs.map((cuff) => (
                  <tr key={cuff._id} className="border-t">
                    {/* Cuff Style */}
                    <td className="px-4 py-2">
                      {cuff.style ? (
                        <>
                          <p className="font-semibold">{cuff.style.name}</p>
                          <p>Price: ₹{cuff.style.price}</p>
                        </>
                      ) : (
                        <p className="text-gray-500"></p>
                      )}
                    </td>

                    {/* Cufflinks */}
                    <td className="px-4 py-2">
                      {cuff.cufflinks ? (
                        <>
                          <p className="font-semibold">{cuff.cufflinks.name}</p>
                          <p>Price: ₹{cuff.cufflinks.price}</p>
                        </>
                      ) : (
                        <p className="text-gray-500"></p>
                      )}
                    </td>

                    {/* Delete Button */}
                    <td className="px-4 py-2 text-center">
                      <button
                        className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                        onClick={() => openDeleteConfirmation(cuff._id)}
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
          <p>No cuffs found.</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p>Are you sure you want to delete this cuff?</p>
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCuff}
                className="bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAndManageCuffs;
