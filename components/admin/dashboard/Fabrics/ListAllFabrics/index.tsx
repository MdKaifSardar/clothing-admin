import React, { useState } from "react";
import { deleteFabric, updateFabric } from "@/lib/database/actions/admin/ShirtArea/Fabric/fabric.actions";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Fabric {
  _id: string;
  fabricName: string;
  price: number;
  discount: number;
  description: string;
  image: {
    url: string;
    public_id: string;
  };
}

interface ListAllFabricsProps {
  fabrics: Fabric[];
  setFabrics: React.Dispatch<React.SetStateAction<Fabric[]>>;
  fetchFabrics: () => void; // Added for refetching after edit
}

// Helper to convert file to Base64
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const ListAllFabrics: React.FC<ListAllFabricsProps> = ({ fabrics, setFabrics, fetchFabrics }) => {
  const [editingFabricId, setEditingFabricId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ fabricName: string; price: number; discount: number; description: string }>({
    fabricName: "",
    price: 0,
    discount: 0,
    description: "", // Added description
  });
  const [editImage, setEditImage] = useState<string | null>(null);
  const [initialEditImage, setInitialEditImage] = useState<string | null>(null);

  const openEditForm = (fabric: Fabric) => {
    setEditingFabricId(fabric._id);
    setEditFormData({
      fabricName: fabric.fabricName,
      price: fabric.price,
      discount: fabric.discount,
      description: fabric.description, // Set description
    });
    setEditImage(fabric.image.url);
    setInitialEditImage(fabric.image.url);
  };

  const cancelEdit = () => {
    setEditingFabricId(null);
    setEditFormData({ fabricName: "", price: 0, discount: 0, description: "" });
    setEditImage(null);
    setInitialEditImage(null);
  };

  const handleEditImageChange = async (files: FileList | null) => {
    if (!files) return;
    const base64Image = await fileToBase64(files[0]);
    setEditImage(base64Image);
  };

  const handleEditSubmit = async (fabricId: string) => {
    try {
      const newImage = editImage !== initialEditImage ? editImage || "" : "";
      const res = await updateFabric(
        fabricId,
        editFormData.fabricName,
        newImage,
        editFormData.price,
        editFormData.discount,
        editFormData.description // Pass description
      );
      if (res?.success) {
        toast.success(res.message || "Fabric updated successfully!");
        await fetchFabrics();
        cancelEdit();
        return;
      }
      toast.error(res.message || "There was an error updating the fabric.");
    } catch (error) {
      toast.error("An error occurred while updating the fabric.");
    }
  };

  const handleDelete = async (fabricId: string) => {
    const response = await deleteFabric(fabricId);
    if (response.success) {
      setFabrics((prevFabrics) =>
        prevFabrics.filter((fabric) => fabric._id !== fabricId)
      );
      toast.success("Fabric deleted successfully!");
    } else {
      toast.error("Failed to delete fabric: " + response.message);
    }
  };

  return (
    <div className="w-full mt-8">
      <h2 className="text-xl font-bold mb-4">All Fabrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {fabrics.length > 0 ? (
          fabrics.map((fabric) => (
            <div key={fabric._id} className="bg-white shadow-md rounded-lg p-4">
              <img
                src={fabric.image.url}
                alt={fabric.fabricName}
                className="w-full h-32 object-cover rounded-md mb-4"
              />
              {editingFabricId === fabric._id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editFormData.fabricName}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, fabricName: e.target.value })
                    }
                    placeholder="Fabric Name"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, price: parseFloat(e.target.value) })
                    }
                    placeholder="Price"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    value={editFormData.discount}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, discount: parseFloat(e.target.value) })
                    }
                    placeholder="Discount"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <textarea
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, description: e.target.value })
                    }
                    placeholder="Description"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleEditImageChange(e.target.files)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  {editImage && (
                    <img
                      src={editImage}
                      alt="Edit Preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSubmit(fabric._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Update
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">{fabric.fabricName}</h3>
                  <p className="text-sm text-gray-600">Price: ${fabric.price}</p>
                  <p className="text-sm text-gray-600">Discount: {fabric.discount}%</p>
                  <p className="text-sm text-gray-600">Description: {fabric.description}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => openEditForm(fabric)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(fabric._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p>No fabrics available.</p>
        )}
      </div>
    </div>
  );
};

export default ListAllFabrics;
