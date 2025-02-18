import {
  createSleeves,
  deleteSleeves,
  getSleevesByColorAndFabric,
  updateSleeves, // newly imported updateSleeves
} from "@/lib/database/actions/admin/ShirtArea/Sleeve/sleeve.action";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Utility function to convert file to base64 string
const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CreateAndManageSleeves = ({ fabricId, colorId, gender }: { fabricId: string, colorId: string, gender: string }) => {
  // ...existing state variables...
  const [image, setImage] = useState<string | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [sleeves, setSleeves] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [sleeveIdToDelete, setSleeveIdToDelete] = useState<string | null>(null);

  // ----- New: Editing state variables for sleeves -----
  const [editingSleeveId, setEditingSleeveId] = useState<string | null>(null);
  const [editSleeveName, setEditSleeveName] = useState<string>("");
  const [editSleevePrice, setEditSleevePrice] = useState<number>(0);
  const [editSleeveImage, setEditSleeveImage] = useState<string | null>(null);
  const [initialEditSleeveImage, setInitialEditSleeveImage] = useState<string | null>(null);
  const [editSleeveIcon, setEditSleeveIcon] = useState<string | null>(null);
  const [initialEditSleeveIcon, setInitialEditSleeveIcon] = useState<string | null>(null);
  // ----- End new states -----

  const fetchSleeves = async () => {
    try {
      const fetchedSleeves = await getSleevesByColorAndFabric(fabricId, colorId, gender);
      setSleeves(fetchedSleeves);
    } catch (error) {
      console.log("Error fetching sleeves:", error);
    }
  };

  useEffect(() => {
    fetchSleeves();
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

  // ----- New: Handlers for sleeve editing -----
  const handleEditSleeveImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditSleeveImage(base64);
  };

  const handleEditSleeveIconChange = async (files: FileList | null) => {
    if (!files) return;
    const base64 = await fileToBase64(files[0]);
    setEditSleeveIcon(base64);
  };

  const openEditSleeveForm = (sleeve: any) => {
    setEditingSleeveId(sleeve._id);
    setEditSleeveName(sleeve.name);
    setEditSleevePrice(sleeve.price);
    // Use sleeve.image.url and sleeve.icon.url to avoid rendering issues
    setEditSleeveImage(sleeve.image?.url || null);
    setEditSleeveIcon(sleeve.icon?.url || null);
    setInitialEditSleeveImage(sleeve.image?.url || null);
    setInitialEditSleeveIcon(sleeve.icon?.url || null);
  };

  const cancelSleeveEdit = () => {
    setEditingSleeveId(null);
    setEditSleeveName("");
    setEditSleevePrice(0);
    setEditSleeveImage(null);
    setEditSleeveIcon(null);
    setInitialEditSleeveImage(null);
    setInitialEditSleeveIcon(null);
  };

  const handleEditSleeveSubmit = async (sleeveId: string) => {
    try {
      const newImage = editSleeveImage !== initialEditSleeveImage ? editSleeveImage || "" : "";
      const newIcon = editSleeveIcon !== initialEditSleeveIcon ? editSleeveIcon || "" : "";
      const res = await updateSleeves(sleeveId, editSleeveName, newImage, newIcon, editSleevePrice);
      if (res?.success) {
        toast.success(res.message || "Sleeve updated successfully!");
        fetchSleeves();
        cancelSleeveEdit();
      } else {
        toast.error("Error updating the sleeve.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the sleeve.");
    }
  };
  // ----- End new handlers -----

  const submitHandler = async () => {
    try {
      setLoading(true);
      const res = await createSleeves(name, image!, icon!, price, fabricId, colorId, gender);
      if (res?.success) {
        fetchSleeves();
        setName("");
        setPrice(0);
        setImage(null);
        setIcon(null);
        toast.success(res.message || "Sleeves created successfully!");
      } else {
        toast.error("There was an error creating the sleeves.");
      }
    } catch (error) {
      toast.error("An error occurred while creating the sleeves.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSleeves = async () => {
    if (!sleeveIdToDelete) return;
    try {
      const res = await deleteSleeves(sleeveIdToDelete);
      if (res?.success) {
        fetchSleeves();
        toast.success(res.message || "Sleeves deleted successfully!");
        setShowConfirmationModal(false);
      } else {
        toast.error("There was an error deleting the sleeves.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the sleeves.");
      setShowConfirmationModal(false);
    }
  };

  const openDeleteConfirmation = (sleeveId: string) => {
    setSleeveIdToDelete(sleeveId);
    setShowConfirmationModal(true);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Create Sleeves Form */}
      <div className="create-form bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Create New Sleeves</h3>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label htmlFor="sleeve-name" className="block mb-1 font-medium">Sleeve Name</label>
            <input
              id="sleeve-name"
              type="text"
              placeholder="Enter sleeve name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="sleeve-price" className="block mb-1 font-medium">Price</label>
            <input
              id="sleeve-price"
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="sleeve-image" className="block mb-1 font-medium">Sleeve Image</label>
            <input
              id="sleeve-image"
              type="file"
              onChange={(e) => handleImageChange(e.target.files)}
              accept="image/*"
              required
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            {image && (
              <img src={image} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-md" />
            )}
          </div>
          <div>
            <label htmlFor="sleeve-icon" className="block mb-1 font-medium">Sleeve Icon</label>
            <input
              id="sleeve-icon"
              type="file"
              onChange={(e) => handleIconChange(e.target.files)}
              accept="image/*"
              required
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            {icon && (
              <img src={icon} alt="Icon Preview" className="mt-2 w-16 h-16 object-cover rounded-md" />
            )}
          </div>
          <button
            onClick={submitHandler}
            className="w-full p-3 bg-blue-500 text-white rounded-md"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Sleeves"}
          </button>
        </form>
      </div>

      {/* Sleeves List */}
      <div className="sleeves-list bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Manage Sleeves</h3>
        <ul className="space-y-4">
          {sleeves.map((sleeve: any) => (
            <li key={sleeve._id} className="flex flex-col border p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <img src={sleeve.icon.url} alt={sleeve.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p>{sleeve.name}</p>
                    <p>{`$${sleeve.price}`}</p>
                  </div>
                </div>
                <div className="space-x-2">
                  <button onClick={() => openEditSleeveForm(sleeve)} className="bg-green-500 text-white p-2 rounded-md">
                    Edit
                  </button>
                  <button onClick={() => openDeleteConfirmation(sleeve._id)} className="bg-red-500 text-white p-2 rounded-md">
                    Delete
                  </button>
                </div>
              </div>
              {editingSleeveId === sleeve._id && (
                <div className="mt-4 border-t pt-4">
                  <div className="mb-2">
                    <label htmlFor="edit-sleeve-name" className="block mb-1 font-medium">Edit Sleeve Name</label>
                    <input
                      id="edit-sleeve-name"
                      type="text"
                      value={editSleeveName}
                      onChange={(e) => setEditSleeveName(e.target.value)}
                      placeholder="Update sleeve name"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="edit-sleeve-price" className="block mb-1 font-medium">Edit Price</label>
                    <input
                      id="edit-sleeve-price"
                      type="number"
                      value={editSleevePrice}
                      onChange={(e) => setEditSleevePrice(Number(e.target.value))}
                      placeholder="Update price"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mb-2">
                    <label htmlFor="edit-sleeve-image" className="block mb-1 font-medium">Change Sleeve Image</label>
                    <input
                      id="edit-sleeve-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditSleeveImageChange(e.target.files)}
                      className="w-full p-2 border rounded"
                    />
                    {editSleeveImage && (
                      <img src={editSleeveImage} alt="Preview Edit Image" className="w-24 h-24 object-cover rounded-md mt-1" />
                    )}
                  </div>
                  <div className="mb-2">
                    <label htmlFor="edit-sleeve-icon" className="block mb-1 font-medium">Change Sleeve Icon</label>
                    <input
                      id="edit-sleeve-icon"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditSleeveIconChange(e.target.files)}
                      className="w-full p-2 border rounded"
                    />
                    {editSleeveIcon && (
                      <img src={editSleeveIcon} alt="Preview Edit Icon" className="w-16 h-16 object-cover rounded-md mt-1" />
                    )}
                  </div>
                  <div className="flex gap-4 justify-end">
                    <button onClick={cancelSleeveEdit} className="bg-gray-300 px-4 py-2 rounded">
                      Cancel
                    </button>
                    <button onClick={() => handleEditSleeveSubmit(sleeve._id)} className="bg-blue-600 text-white px-4 py-2 rounded">
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
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">
              Are you sure you want to delete this sleeve?
            </h3>
            <div className="flex justify-between">
              <button
                onClick={handleDeleteSleeves}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
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

export default CreateAndManageSleeves;
