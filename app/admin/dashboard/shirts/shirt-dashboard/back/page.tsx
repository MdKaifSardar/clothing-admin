"use client";

import { useEffect, useState } from "react";
import CreateAndManageBacks from "@/components/admin/dashboard/Shirt/ShirtDashboard/Back";
import { ToastContainer } from "react-toastify";

const Page = () => {
  const [fabricId, setFabricId] = useState("");
  const [colorId, setColorId] = useState("");

  useEffect(() => {
    // Fetch fabricId and colorId from localStorage
    const storedFabricId = localStorage.getItem("fabricId");
    const storedColorId = localStorage.getItem("colorId");

    if (storedFabricId) setFabricId(storedFabricId);
    if (storedColorId) setColorId(storedColorId);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-[70%]">
      <ToastContainer />
      <CreateAndManageBacks
        fabricId={fabricId} // Fallback if localStorage is empty
        colorId={colorId} // Fallback if localStorage is empty
      />
    </div>
  );
};

export default Page;
