"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createCuff,
  deleteCuff,
  getCuffsByColorAndFabric,
  updateCuff, // <-- added updateCuff for editing
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

const CreateAndManageCuffs = ({ fabricId, colorId, gender }: { fabricId: string, colorId: string, gender: string }) => {
  // Create states for creation
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [styleIcon, setStyleIcon] = useState<string | null>(null);
  const [cufflinkImage, setCufflinkImage] = useState<string | null>(null);
  const [cufflinkIcon, setCufflinkIcon] = useState<string | null>(null);
  const [styleName, setStyleName] = useState<string>("");
  const [cufflinkName, setCufflinkName] = useState<string>("");
  const [stylePrice, setStylePrice] = useState<number>(0);
  const [cufflinkPrice, setCufflinkPrice] = useState<number>(0);
  const [cuffs, setCuffs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [cuffIdToDelete, setCuffIdToDelete] = useState<string | null>(null);

  // ----- New: Editing state variables (similar to collar) -----
  const [editingCuffId, setEditingCuffId] = useState<string | null>(null);
  const [editStyleName, setEditStyleName] = useState<string>("");
  const [editStylePrice, setEditStylePrice] = useState<number>(0);
  const [editStyleImage, setEditStyleImage] = useState<string | null>(null);
  const [initialEditStyleImage, setInitialEditStyleImage] = useState<string | null>(null);
  const [editStyleIcon, setEditStyleIcon] = useState<string | null>(null);
  const [initialEditStyleIcon, setInitialEditStyleIcon] = useState<string | null>(null);
  const [editCufflinkName, setEditCufflinkName] = useState<string>("");
  const [editCufflinkPrice, setEditCufflinkPrice] = useState<number>(0);
  const [editCufflinkImage, setEditCufflinkImage] = useState<string | null>(null);
  const [initialEditCufflinkImage, setInitialEditCufflinkImage] = useState<string | null>(null);
  const [editCufflinkIcon, setEditCufflinkIcon] = useState<string | null>(null);
  const [initialEditCufflinkIcon, setInitialEditCufflinkIcon] = useState<string | null>(null);
  // ----- End new states -----

  const fetchCuffs = async () => {
    try {
      const fetchedCuffs = await getCuffsByColorAndFabric(fabricId, colorId, gender);
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

  // ----- New: Handlers for editing similar to collar -----
  const handleEditStyleImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditStyleImage(base64);
  };

  const handleEditStyleIconChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditStyleIcon(base64);
  };

  const handleEditCufflinkImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditCufflinkImage(base64);
  };
  
  const handleEditCufflinkIconChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditCufflinkIcon(base64);
  };

  const openEditForm = (cuff: any) => {
    setEditingCuffId(cuff._id);
    if (cuff.style) {
      setEditStyleName(cuff.style.name);
      setEditStylePrice(cuff.style.price);
      setEditStyleImage(cuff.style.image?.url || null);
      setEditStyleIcon(cuff.style.icon?.url || null);
      setInitialEditStyleImage(cuff.style.image?.url || null);
      setInitialEditStyleIcon(cuff.style.icon?.url || null);
    }
    if (cuff.cufflinks) {
      setEditCufflinkName(cuff.cufflinks.name);
      setEditCufflinkPrice(cuff.cufflinks.price);
      setEditCufflinkImage(cuff.cufflinks.image?.url || null);
      setEditCufflinkIcon(cuff.cufflinks.icon?.url || null);
      setInitialEditCufflinkImage(cuff.cufflinks.image?.url || null);
      setInitialEditCufflinkIcon(cuff.cufflinks.icon?.url || null);
    }
  };

  const cancelEdit = () => {
    setEditingCuffId(null);
    setEditStyleName("");
    setEditStylePrice(0);
    setEditStyleImage(null);
    setEditStyleIcon(null);
    setInitialEditStyleImage(null);
    setInitialEditStyleIcon(null);
    setEditCufflinkName("");
    setEditCufflinkPrice(0);
    setEditCufflinkImage(null);
    setEditCufflinkIcon(null);
    setInitialEditCufflinkImage(null);
    setInitialEditCufflinkIcon(null);
  };

  const handleEditSubmit = async (cuffId: string) => {
    try {
      // New images only if changed; otherwise, send empty string for no update
      const newStyleImage =
        editStyleImage !== initialEditStyleImage ? editStyleImage || "" : "";
      const newStyleIcon =
        editStyleIcon !== initialEditStyleIcon ? editStyleIcon || "" : "";
      const newCufflinkImage =
        editCufflinkImage !== initialEditCufflinkImage ? editCufflinkImage || "" : "";
      const newCufflinkIcon =
        editCufflinkIcon !== initialEditCufflinkIcon ? editCufflinkIcon || "" : "";
      
      const res = await updateCuff(
        cuffId,
        {
          name: editStyleName,
          price: editStylePrice,
          image: newStyleImage,
          icon: newStyleIcon,
        },
        {
          name: editCufflinkName,
          price: editCufflinkPrice,
          image: newCufflinkImage,
          icon: newCufflinkIcon,
        }
      );
      if (res?.success) {
        toast.success(res.message || "Cuff updated successfully!");
        const updated = await getCuffsByColorAndFabric(fabricId, colorId, gender);
        setCuffs(updated);
        cancelEdit();
      } else {
        toast.error("There was an error updating the cuff.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the cuff.");
    }
  };
  // ----- End new handlers -----

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
        colorId,
        gender
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
                  <>
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
                      <td className="px-4 py-2 text-center space-x-2">
                        <button
                          className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                          onClick={() => openEditForm(cuff)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                          onClick={() => openDeleteConfirmation(cuff._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {editingCuffId === cuff._id && (
                      <tr className="border-t">
                        <td colSpan={3} className="px-4 py-4">
                          <div className="flex flex-col gap-4">
                            {cuff.style && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Edit Style Name
                                  </label>
                                  <input
                                    type="text"
                                    value={editStyleName}
                                    onChange={(e) => setEditStyleName(e.target.value)}
                                    className="mt-1 p-2 border rounded w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Edit Style Price
                                  </label>
                                  <input
                                    type="number"
                                    value={editStylePrice}
                                    onChange={(e) => setEditStylePrice(Number(e.target.value))}
                                    className="mt-1 p-2 border rounded w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Edit Style Image
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleEditStyleImageChange(e.target.files)}
                                    className="mt-1"
                                  />
                                  {(editStyleImage || initialEditStyleImage) && (
                                    <img
                                      src={editStyleImage || initialEditStyleImage || undefined}
                                      alt="Style Preview"
                                      className="mt-2 w-24 h-24 object-cover rounded"
                                    />
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Edit Style Icon
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleEditStyleIconChange(e.target.files)}
                                    className="mt-1"
                                  />
                                  {(editStyleIcon || initialEditStyleIcon) && (
                                    <img
                                      src={editStyleIcon || initialEditStyleIcon || undefined}
                                      alt="Icon Preview"
                                      className="mt-2 w-24 h-24 object-cover rounded"
                                    />
                                  )}
                                </div>
                              </>
                            )}
                            {cuff.cufflinks && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Edit Cufflink Name
                                  </label>
                                  <input
                                    type="text"
                                    value={editCufflinkName}
                                    onChange={(e) => setEditCufflinkName(e.target.value)}
                                    className="mt-1 p-2 border rounded w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Edit Cufflink Price
                                  </label>
                                  <input
                                    type="number"
                                    value={editCufflinkPrice}
                                    onChange={(e) => setEditCufflinkPrice(Number(e.target.value))}
                                    className="mt-1 p-2 border rounded w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Edit Cufflink Image
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleEditCufflinkImageChange(e.target.files)}
                                    className="mt-1"
                                  />
                                  {(editCufflinkImage || initialEditCufflinkImage) && (
                                    <img
                                      src={editCufflinkImage || initialEditCufflinkImage || undefined}
                                      alt="Cufflink Preview"
                                      className="mt-2 w-24 h-24 object-cover rounded"
                                    />
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700">
                                    Edit Cufflink Icon
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleEditCufflinkIconChange(e.target.files)}
                                    className="mt-1"
                                  />
                                  {(editCufflinkIcon || initialEditCufflinkIcon) && (
                                    <img
                                      src={editCufflinkIcon || initialEditCufflinkIcon || undefined}
                                      alt="Cufflink Icon Preview"
                                      className="mt-2 w-24 h-24 object-cover rounded"
                                    />
                                  )}
                                </div>
                              </>
                            )}
                            <div className="flex justify-end gap-4">
                              <button
                                onClick={cancelEdit}
                                className="bg-gray-300 px-4 py-2 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleEditSubmit(cuff._id)}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                              >
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
