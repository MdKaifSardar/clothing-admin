"use client";

import { useEffect, useState } from "react";
import CreateAndManageCollars from "@/components/admin/dashboard/Shirt/ShirtDashboard/Collar";
import { ToastContainer } from "react-toastify";

const Page = () => {
  const [fabricId, setFabricId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);

  useEffect(() => {
    const storedFabricId = localStorage.getItem("fabricId");
    const storedColorId = localStorage.getItem("colorId");

    // Validate IDs (MongoDB ObjectId should be exactly 24 characters)
    if (storedFabricId && storedFabricId.length === 24)
      setFabricId(storedFabricId);
    if (storedColorId && storedColorId.length === 24) setColorId(storedColorId);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-[70%]">
      <ToastContainer />
      {fabricId && colorId ? (
        <CreateAndManageCollars fabricId={fabricId} colorId={colorId} />
      ) : (
        <p>Loading...</p> // Show loading text until valid IDs are available
      )}
    </div>
  );
};

export default Page;
