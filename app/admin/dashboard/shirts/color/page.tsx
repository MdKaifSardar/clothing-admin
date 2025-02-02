"use client";

import CreateColor from "@/components/admin/dashboard/Colors/AddColor";
import ListAllColors from "@/components/admin/dashboard/Colors/ListAllColors";
import { getAllColors } from "@/lib/database/actions/admin/ShirtArea/Color/color.actions";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";

interface Color {
  _id: string;
  name: string;
  hexCode: string;
}

const VendorColorsPage = () => {
  const [colors, setColors] = useState<Color[]>([]);

  const fetchColors = async () => {
    try {
      const fetchedColors = await getAllColors();
      setColors(fetchedColors);
    } catch (error) {
      console.log("Error fetching colors:", error);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  return (
    <div className="gap-[2rem] flex flex-col justify-center items-center h-fit w-[70%]">
      <ToastContainer />
      <CreateColor fetchColors={fetchColors} />
      <ListAllColors colors={colors} setColors={setColors} />
    </div>
  );
};

export default VendorColorsPage;
