"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  createTopbar,
  getAllTopbars,
  updateTopbar,
  deleteTopbar,
} from "@/lib/database/actions/admin/topbar/topbar.actions";

const TopbarDashboard = () => {
  const [text, setText] = useState("");
  const [type, setType] = useState<"sticky" | "marquee">("sticky");
  const [topbars, setTopbars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [topbarIdToDelete, setTopbarIdToDelete] = useState<string | null>(null);
  
  // Editing state variables
  const [editingTopbarId, setEditingTopbarId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editType, setEditType] = useState<"sticky" | "marquee">("sticky");

  const fetchTopbars = async () => {
    try {
      const res = await getAllTopbars();
      if (res.success) {
        setTopbars(res.topbars || []);
      }
    } catch (error) {
      console.log("Error fetching topbars:", error);
    }
  };

  useEffect(() => {
    fetchTopbars();
  }, []);

  const submitHandler = async () => {
    try {
      setLoading(true);
      const res = await createTopbar({ text, type });
      if (res.success) {
        toast.success(res.message || "Topbar created successfully!");
        fetchTopbars();
        setText("");
        setType("sticky");
      } else {
        toast.error("Error creating topbar");
      }
    } catch (error) {
      toast.error("An error occurred while creating topbar.");
    } finally {
      setLoading(false);
    }
  };

  const openEditForm = (topbar: any) => {
    setEditingTopbarId(topbar._id);
    setEditText(topbar.text);
    setEditType(topbar.type);
  };

  const cancelEdit = () => {
    setEditingTopbarId(null);
    setEditText("");
    setEditType("sticky");
  };

  const handleEditSubmit = async (topbarId: string) => {
    try {
      const res = await updateTopbar(topbarId, { text: editText, type: editType });
      if (res.success) {
        toast.success(res.message || "Topbar updated successfully!");
        fetchTopbars();
        cancelEdit();
      } else {
        toast.error("Error updating topbar.");
      }
    } catch (error) {
      toast.error("An error occurred while updating topbar.");
    }
  };

  const handleDeleteTopbar = async () => {
    if (!topbarIdToDelete) return;
    try {
      const res = await deleteTopbar(topbarIdToDelete);
      if (res.success) {
        toast.success(res.message || "Topbar deleted successfully!");
        fetchTopbars();
        setShowConfirmationModal(false);
      } else {
        toast.error("Error deleting topbar.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting topbar.");
      setShowConfirmationModal(false);
    }
  };

  const openDeleteConfirmation = (topbarId: string) => {
    setTopbarIdToDelete(topbarId);
    setShowConfirmationModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 w-full">
      {/* Create Topbar Form */}
      <div className="create-form bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4">Create New Topbar</h3>
        <form onSubmit={(e) => { e.preventDefault(); submitHandler(); }} className="space-y-4">
          <div className="form-group">
            <input
              type="text"
              placeholder="Text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="form-group">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "sticky" | "marquee")}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sticky">Sticky</option>
              <option value="marquee">Marquee</option>
            </select>
          </div>
          <div className="form-group text-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600"
            >
              {loading ? "Creating..." : "Create Topbar"}
            </button>
          </div>
        </form>
      </div>

      {/* Topbar List */}
      <div className="topbar-list bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">All Topbars</h3>
        <ul className="space-y-4">
          {topbars.map((topbar) => (
            <li key={topbar._id} className="border p-4 rounded-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="topbar-info mb-4 sm:mb-0">
                  <h4 className="font-semibold">{topbar.text}</h4>
                  <p>Type: {topbar.type}</p>
                </div>
                <div className="actions space-x-2 flex-shrink-0">
                  <button
                    onClick={() => openEditForm(topbar)}
                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteConfirmation(topbar._id)}
                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {editingTopbarId === topbar._id && (
                <div className="mt-4 border-t pt-4">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Edit Text"
                    className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as "sticky" | "marquee")}
                    className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sticky">Sticky</option>
                    <option value="marquee">Marquee</option>
                  </select>
                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditSubmit(topbar._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmationModal && (
        <div className="modal-overlay fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="modal-content bg-white p-6 rounded-lg w-11/12 sm:w-96">
            <h4 className="text-xl font-semibold mb-4">
              Are you sure you want to delete this topbar?
            </h4>
            <div className="flex justify-between">
              <button
                onClick={handleDeleteTopbar}
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

export default TopbarDashboard;
