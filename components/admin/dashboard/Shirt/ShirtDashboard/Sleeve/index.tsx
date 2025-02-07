import {
  createSleeves,
  deleteSleeves,
  getSleevesByColorAndFabric,
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

const CreateAndManageSleeves = ({ fabricId, colorId }: { fabricId: string, colorId: string }) => {
  const [image, setImage] = useState<string | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [sleeves, setSleeves] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [sleeveIdToDelete, setSleeveIdToDelete] = useState<string | null>(null);

  const fetchSleeves = async () => {
    try {
      const fetchedSleeves = await getSleevesByColorAndFabric(fabricId, colorId);
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

  const submitHandler = async () => {
    try {
      setLoading(true);
      const res = await createSleeves(name, image!, icon!, price, fabricId, colorId);
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
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload with Preview */}
          <div>
            <input
              type="file"
              onChange={(e) => handleImageChange(e.target.files)}
              accept="image/*"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {image && (
              <img
                src={image}
                alt="Preview"
                className="mt-2 w-24 h-24 object-cover rounded-md border"
              />
            )}
          </div>

          {/* Icon Upload with Preview */}
          <div>
            <input
              type="file"
              onChange={(e) => handleIconChange(e.target.files)}
              accept="image/*"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {icon && (
              <img
                src={icon}
                alt="Icon Preview"
                className="mt-2 w-16 h-16 object-cover rounded-md border"
              />
            )}
          </div>

          <button
            onClick={submitHandler}
            className="w-full p-3 bg-blue-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {sleeves.map((sleeve) => (
            <li key={sleeve._id} className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={sleeve.icon.url}
                  alt={sleeve.name}
                  className="w-10 h-10 mr-4 rounded-full"
                />
                <span>{sleeve.name}</span>
              </div>
              <button
                onClick={() => openDeleteConfirmation(sleeve._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="modal fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
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
