"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllFabrics } from "@/lib/database/actions/admin/ShirtArea/Fabric/fabric.actions";
import { getColorByFabric } from "@/lib/database/actions/admin/ShirtArea/Color/color.actions";

export default function CustomizeShirt() {
  const [fabrics, setFabrics] = useState<{ _id: string; fabricName: string }[]>(
    []
  );
  const [colors, setColors] = useState<{ _id: string; name: string }[]>([]);
  const [selectedFabric, setSelectedFabric] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [error, setError] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fabricData = await getAllFabrics();
        if (!fabricData.length) throw new Error("No fabrics available.");
        setFabrics(fabricData);

        const storedFabric = localStorage.getItem("fabricId");
        const storedColor = localStorage.getItem("colorId");
        const storedGender = localStorage.getItem("gender");

        if (storedFabric) setSelectedFabric(storedFabric);
        if (storedColor) setSelectedColor(storedColor);
        if (storedGender) setSelectedGender(storedGender);
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
      setColors([]);
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
    {
      label: "Monogram",
      url: "admin/dashboard/shirts/shirt-dashboard/monogram",
    },
  ];

  return (
    <div className="h-fit w-[90%] p-[.5rem] flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-black mb-8 tracking-wide">
        Customize Your Shirt
      </h1>

      {error && <p className="text-red-400 text-lg mb-6">{error}</p>}

      {/* Fabric Selection */}
      <div className="w-full mb-6">
        <label className="block text-lg font-medium text-black mb-2">
          Select Fabric:
        </label>
        <select
          className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
          value={selectedFabric}
          onChange={(e) => {
            const fabricId = e.target.value;
            setSelectedFabric(fabricId);
            saveSelection(fabricId, selectedColor);
          }}
        >
          <option value="" className="text-gray-500">
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
      <div className="w-full mb-6">
        <label className="block text-lg font-medium text-black mb-2">
          Select Color:
        </label>
        <select
          className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
          value={selectedColor}
          onChange={(e) => {
            const colorId = e.target.value;
            setSelectedColor(colorId);
            saveSelection(selectedFabric, colorId);
          }}
          disabled={!selectedFabric}
        >
          <option value="" className="text-gray-500">
            Select Color
          </option>
          {colors.map((color) => (
            <option key={color._id} value={color._id} className="text-black">
              {color.name}
            </option>
          ))}
        </select>
      </div>

      {/* Gender Selection */}
      <div className="w-full mb-8">
        <label className="block text-lg font-medium text-black mb-2">
          Select Gender:
        </label>
        <select
          className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
          value={selectedGender}
          onChange={(e) => {
            const gender = e.target.value;
            setSelectedGender(gender);
            localStorage.setItem("gender", gender);
          }}
        >
          <option value="" className="text-gray-500">
            Select Gender
          </option>
          <option value="male" className="text-black">Male</option>
          <option value="female" className="text-black">Female</option>
          <option value="other" className="text-black">Other</option>
        </select>
      </div>

      {/* Customization Options Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full mb-8">
        {options.map((option) => (
          <button
            key={option.label}
            className="p-5 bg-white shadow-lg rounded-lg text-lg font-semibold text-gray-800 hover:bg-gray-300 hover:text-black transition-all duration-200 ease-in-out"
            onClick={() => router.push(`/${option.url}`)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
