"use client";

import { useEffect, useState } from "react";
import CreateAndManageBacks from "@/components/admin/dashboard/Shirt/ShirtDashboard/Back";
import { ToastContainer } from "react-toastify";

const Page = () => {
  const [fabricId, setFabricId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch fabricId and colorId from localStorage
    const storedFabricId = localStorage.getItem("fabricId");
    const storedColorId = localStorage.getItem("colorId");

    // Ensure the IDs are exactly 24 characters (valid MongoDB ObjectId)
    if (storedFabricId && storedFabricId.length === 24)
      setFabricId(storedFabricId);
    if (storedColorId && storedColorId.length === 24) setColorId(storedColorId);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-[70%]">
      <ToastContainer />
      {fabricId && colorId ? (
        <CreateAndManageBacks fabricId={fabricId} colorId={colorId} />
      ) : (
        <p>Loading...</p> // Show loading text if IDs are not yet set
      )}
    </div>
  );
};

export default Page;
