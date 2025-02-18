"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createMonogram,
  getMonogramsByColorAndFabric,
  deleteMonogram,
  updateMonogram, // newly imported updateMonogram
} from "@/lib/database/actions/admin/ShirtArea/Monogram/monogram.actions";

// Utility function to convert file to base64 string
const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CreateAndManageMonograms = ({ fabricId, colorId, gender }: { fabricId: string; colorId: string; gender: string }) => {
  // Create states for creation
  const [styleName, setStyleName] = useState<string>("");
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [stylePrice, setStylePrice] = useState<number>(0);
  const [positionName, setPositionName] = useState<string>("");
  const [positionImage, setPositionImage] = useState<string | null>(null);
  const [positionPrice, setPositionPrice] = useState<number>(0);
  const [monograms, setMonograms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [monogramIdToDelete, setMonogramIdToDelete] = useState<string | null>(null);
  // ----- New: Editing state variables -----
  const [editingMonogramId, setEditingMonogramId] = useState<string | null>(null);
  const [editStyleName, setEditStyleName] = useState<string>("");
  const [editStylePrice, setEditStylePrice] = useState<number>(0);
  const [editStyleImage, setEditStyleImage] = useState<string | null>(null);
  const [initialEditStyleImage, setInitialEditStyleImage] = useState<string | null>(null);
  const [editPositionName, setEditPositionName] = useState<string>("");
  const [editPositionPrice, setEditPositionPrice] = useState<number>(0);
  const [editPositionImage, setEditPositionImage] = useState<string | null>(null);
  const [initialEditPositionImage, setInitialEditPositionImage] = useState<string | null>(null);
  // ----- End new states -----

  const fetchMonograms = async () => {
    try {
      const fetchedMonograms = await getMonogramsByColorAndFabric(fabricId, colorId, gender);
      setMonograms(fetchedMonograms);
    } catch (error) {
      console.error("Error fetching monograms:", error);
    }
  };

  useEffect(() => {
    fetchMonograms();
  }, [fabricId]);

  const handleStyleImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64Image = await fileToBase64(files[0]);
    setStyleImage(base64Image);
  };

  const handlePositionImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64Image = await fileToBase64(files[0]);
    setPositionImage(base64Image);
  };

  // ----- New: Handlers for monogram editing -----
  const handleEditStyleImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditStyleImage(base64);
  };

  const handleEditPositionImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditPositionImage(base64);
  };

  const openEditMonogramForm = (monogram: any) => {
    setEditingMonogramId(monogram._id);
    if (monogram.style) {
      setEditStyleName(monogram.style.name);
      setEditStylePrice(monogram.style.price);
      setEditStyleImage(monogram.style.image?.url || null);
      setInitialEditStyleImage(monogram.style.image?.url || null);
    }
    if (monogram.position) {
      setEditPositionName(monogram.position.name);
      setEditPositionPrice(monogram.position.price);
      setEditPositionImage(monogram.position.image?.url || null);
      setInitialEditPositionImage(monogram.position.image?.url || null);
    }
  };

  const cancelEdit = () => {
    setEditingMonogramId(null);
    setEditStyleName("");
    setEditStylePrice(0);
    setEditStyleImage(null);
    setInitialEditStyleImage(null);
    setEditPositionName("");
    setEditPositionPrice(0);
    setEditPositionImage(null);
    setInitialEditPositionImage(null);
  };

  const handleEditSubmit = async (monogramId: string) => {
    try {
      const newStyleImage = editStyleImage !== initialEditStyleImage ? editStyleImage || "" : "";
      const newPositionImage = editPositionImage !== initialEditPositionImage ? editPositionImage || "" : "";
      const res = await updateMonogram(
        monogramId,
        {
          name: editStyleName,
          image: newStyleImage,
          price: editStylePrice,
        },
        {
          name: editPositionName,
          image: newPositionImage,
          price: editPositionPrice,
        }
      );
      if (res?.success) {
        toast.success(res.message || "Monogram updated successfully!");
        fetchMonograms();
        cancelEdit();
      } else {
        toast.error("Error updating the monogram.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the monogram.");
    }
  };
  // ----- End new handlers -----

  const submitHandler = async () => {
    try {
      setLoading(true);
      const res = await createMonogram(
        {
          name: styleName,
          image: styleImage!,
          price: stylePrice,
        },
        {
          name: positionName,
          image: positionImage!,
          price: positionPrice,
        },
        fabricId,
        colorId,
        gender
      );

      if (res?.success) {
        fetchMonograms();
        setStyleName("");
        setStylePrice(0);
        setStyleImage(null);
        setPositionName("");
        setPositionPrice(0);
        setPositionImage(null);
        toast.success(res.message || "Monogram created successfully!");
      } else {
        toast.error(res.message || "Error creating monogram.");
      }
    } catch (error) {
      console.error("Error in submitHandler:", error);
      toast.error("An error occurred while creating the monogram.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMonogram = async () => {
    if (!monogramIdToDelete) return;
    try {
      const res = await deleteMonogram(monogramIdToDelete);
      if (res?.success) {
        fetchMonograms();
        toast.success(res.message || "Monogram deleted successfully!");
      } else {
        toast.error("There was an error deleting the monogram.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the monogram.");
    } finally {
      setShowConfirmationModal(false);
    }
  };

  const openDeleteConfirmation = (monogramId: string) => {
    setMonogramIdToDelete(monogramId);
    setShowConfirmationModal(true);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="create-form bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Create New Monogram</h3>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <input
            type="text"
            placeholder="Style Name"
            value={styleName}
            onChange={(e) => setStyleName(e.target.value)}
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            type="number"
            placeholder="Style Price"
            value={stylePrice}
            onChange={(e) => setStylePrice(Number(e.target.value))}
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleStyleImageChange(e.target.files)}
            className="w-full p-3 border rounded-md"
          />
          {styleImage && (
            <img src={styleImage} alt="Style Preview" className="mt-2 w-32 h-32" />
          )}
          <input
            type="text"
            placeholder="Position Name"
            value={positionName}
            onChange={(e) => setPositionName(e.target.value)}
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            type="number"
            placeholder="Position Price"
            value={positionPrice}
            onChange={(e) => setPositionPrice(Number(e.target.value))}
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handlePositionImageChange(e.target.files)}
            className="w-full p-3 border rounded-md"
          />
          {positionImage && (
            <img src={positionImage} alt="Position Preview" className="mt-2 w-32 h-32" />
          )}
          <button
            onClick={submitHandler}
            disabled={loading}
            className="w-full bg-blue-500 text-white p-3 rounded-md"
          >
            {loading ? "Creating..." : "Create Monogram"}
          </button>
        </form>
      </div>

      <div className="monograms-list bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">All Monograms</h3>
        {monograms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              {/* Table Header */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Style</th>
                  <th className="px-4 py-2 text-left font-semibold">Style Price</th>
                  <th className="px-4 py-2 text-left font-semibold">Position</th>
                  <th className="px-4 py-2 text-left font-semibold">Position Price</th>
                  <th className="px-4 py-2 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {monograms.map((monogram) => (
                  <>
                    <tr key={monogram._id} className="border-t">
                      <td className="px-4 py-2">
                        {monogram.style ? <p className="font-semibold">{monogram.style.name}</p> : <p>-</p>}
                      </td>
                      <td className="px-4 py-2">
                        {monogram.style ? <p>₹{monogram.style.price}</p> : <p>-</p>}
                      </td>
                      <td className="px-4 py-2">
                        {monogram.position ? <p className="font-semibold">{monogram.position.name}</p> : <p>-</p>}
                      </td>
                      <td className="px-4 py-2">
                        {monogram.position ? <p>₹{monogram.position.price}</p> : <p>-</p>}
                      </td>
                      <td className="px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => openEditMonogramForm(monogram)}
                          className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteConfirmation(monogram._id)}
                          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {editingMonogramId === monogram._id && (
                      <tr className="border-t">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="flex flex-col gap-4">
                            {/* Edit Style */}
                            {monogram.style && (
                              <>
                                <div>
                                  <label className="block mb-1 font-medium">Edit Style Name</label>
                                  <input
                                    type="text"
                                    value={editStyleName}
                                    onChange={(e) => setEditStyleName(e.target.value)}
                                    className="mt-1 p-2 border rounded w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 font-medium">Edit Style Price</label>
                                  <input
                                    type="number"
                                    value={editStylePrice}
                                    onChange={(e) => setEditStylePrice(Number(e.target.value))}
                                    className="mt-1 p-2 border rounded w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 font-medium">Change Style Image</label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleEditStyleImageChange(e.target.files)}
                                    className="mt-1"
                                  />
                                  {/* Preview updated or default style image */}
                                  {editStyleImage && (
                                    <img
                                      src={editStyleImage}
                                      alt="Style Preview"
                                      className="mt-2 w-32 h-32"
                                    />
                                  )}
                                </div>
                              </>
                            )}
                            {/* Edit Position */}
                            {monogram.position && (
                              <>
                                <div>
                                  <label className="block mb-1 font-medium">Edit Position Name</label>
                                  <input
                                    type="text"
                                    value={editPositionName}
                                    onChange={(e) => setEditPositionName(e.target.value)}
                                    className="mt-1 p-2 border rounded w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 font-medium">Edit Position Price</label>
                                  <input
                                    type="number"
                                    value={editPositionPrice}
                                    onChange={(e) => setEditPositionPrice(Number(e.target.value))}
                                    className="mt-1 p-2 border rounded w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 font-medium">Change Position Image</label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleEditPositionImageChange(e.target.files)}
                                    className="mt-1"
                                  />
                                  {/* Preview updated or default position image */}
                                  {editPositionImage && (
                                    <img
                                      src={editPositionImage}
                                      alt="Position Preview"
                                      className="mt-2 w-32 h-32"
                                    />
                                  )}
                                </div>
                              </>
                            )}
                            <div className="flex gap-4 justify-end">
                              <button onClick={cancelEdit} className="bg-gray-300 px-4 py-2 rounded">
                                Cancel
                              </button>
                              <button onClick={() => handleEditSubmit(monogram._id)} className="bg-blue-600 text-white px-4 py-2 rounded">
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No monograms found.</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p>Are you sure you want to delete this monogram?</p>
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={() => setShowConfirmationModal(false)} className="px-4 py-2 bg-gray-300 rounded-md">
                Cancel
              </button>
              <button onClick={handleDeleteMonogram} className="px-4 py-2 bg-red-500 text-white rounded-md">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAndManageMonograms;
