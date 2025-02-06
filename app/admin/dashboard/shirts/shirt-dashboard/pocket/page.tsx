"use client";

import { useEffect, useState } from "react";
import CreateAndManagePockets from "@/components/admin/dashboard/Shirt/ShirtDashboard/pocket";
import { ToastContainer } from "react-toastify";

const Page = () => {
  const [fabricId, setFabricId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);

  useEffect(() => {
    const storedFabricId = localStorage.getItem("fabricId");
    const storedColorId = localStorage.getItem("colorId");

    // Validate MongoDB ObjectId (24-character hex string)
    if (storedFabricId && storedFabricId.length === 24)
      setFabricId(storedFabricId);
    if (storedColorId && storedColorId.length === 24) setColorId(storedColorId);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-[70%]">
      <ToastContainer />
      {fabricId && colorId ? (
        <CreateAndManagePockets fabricId={fabricId} colorId={colorId} />
      ) : (
        <p>Loading...</p> // Show loading message until valid IDs are available
      )}
    </div>
  );
};

export default Page;
