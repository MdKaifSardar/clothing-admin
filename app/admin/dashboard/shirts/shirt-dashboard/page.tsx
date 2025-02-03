"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllFabrics } from "@/lib/database/actions/admin/ShirtArea/Fabric/fabric.actions";
import { getColorByFabric } from "@/lib/database/actions/admin/ShirtArea/Color/color.actions"; // Import the function to get colors by fabric

export default function CustomizeShirt() {
  const [fabrics, setFabrics] = useState<{ _id: string; fabricName: string }[]>(
    []
  );
  const [colors, setColors] = useState<{ _id: string; name: string }[]>([]);
  const [selectedFabric, setSelectedFabric] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fabricData = await getAllFabrics();
        if (!fabricData.length) throw new Error("No fabrics available.");

        setFabrics(fabricData);

        const storedFabric = localStorage.getItem("fabricId");
        const storedColor = localStorage.getItem("colorId");

        if (storedFabric) setSelectedFabric(storedFabric);
        if (storedColor) setSelectedColor(storedColor);
      } catch (err: any) {
        setError(err.message || "Failed to fetch fabrics.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedFabric) {
      const fetchColors = async () => {
        try {
          const colorData = await getColorByFabric(selectedFabric);
          if (!colorData.length)
            throw new Error("No colors available for this fabric.");

          setColors(colorData);
        } catch (err: any) {
          setError(err.message || "Failed to fetch colors.");
        }
      };

      fetchColors();
    } else {
      setColors([]); // Clear the colors if no fabric is selected
    }
  }, [selectedFabric]);

  const saveSelection = (fabricId: string, colorId: string) => {
    if (fabricId) localStorage.setItem("fabricId", fabricId);
    if (colorId) localStorage.setItem("colorId", colorId);
  };

  const options = [
    { label: "Back", url: "admin/dashboard/shirts/shirt-dashboard/back" },
    { label: "Bottom", url: "admin/dashboard/shirts/shirt-dashboard/bottom" },
    { label: "Collar", url: "admin/dashboard/shirts/shirt-dashboard/collar" },
    { label: "Sleeve", url: "admin/dashboard/shirts/shirt-dashboard/sleeve" },
    { label: "Cuff", url: "admin/dashboard/shirts/shirt-dashboard/cuff" },
    { label: "Fit", url: "admin/dashboard/shirts/shirt-dashboard/fit" },
    { label: "Placket", url: "admin/dashboard/shirts/shirt-dashboard/placket" },
    { label: "Pocket", url: "admin/dashboard/shirts/shirt-dashboard/pocket" },
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Customize Your Shirt
      </h1>

      {error && <p className="text-red-500 text-lg mb-4">{error}</p>}

      {/* Fabric Selection */}
      <div className="w-full max-w-md mb-4">
        <label className="block text-lg font-semibold mb-2">
          Select Fabric:
        </label>
        <select
          className="w-full p-3 border rounded-lg bg-white text-black"
          value={selectedFabric}
          onChange={(e) => {
            const fabricId = e.target.value;
            setSelectedFabric(fabricId);
            saveSelection(fabricId, selectedColor); // Save fabric and color to local storage
          }}
        >
          <option value="" className="text-black">
            Select Fabric
          </option>
          {fabrics.map((fabric) => (
            <option key={fabric._id} value={fabric._id} className="text-black">
              {fabric.fabricName}
            </option>
          ))}
        </select>
      </div>

      {/* Color Selection */}
      <div className="w-full max-w-md mb-6">
        <label className="block text-lg font-semibold mb-2">
          Select Color:
        </label>
        <select
          className="w-full p-3 border rounded-lg bg-white text-black"
          value={selectedColor}
          onChange={(e) => {
            const colorId = e.target.value;
            setSelectedColor(colorId);
            saveSelection(selectedFabric, colorId); // Save fabric and color to local storage
          }}
          disabled={!selectedFabric} // Disable color selection if no fabric is selected
        >
          <option value="" className="text-black">
            Select Color
          </option>
          {colors.map((color) => (
            <option key={color._id} value={color._id} className="text-black">
              {color.name}
            </option>
          ))}
        </select>
      </div>

      {/* Customization Options Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-2xl">
        {options.map((option) => (
          <button
            key={option.label}
            className="p-4 bg-white shadow-md rounded-lg text-center font-semibold hover:bg-gray-200 transition text-black"
            onClick={() => router.push(`/${option.url}`)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
