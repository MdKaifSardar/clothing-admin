"use client";

import { useEffect, useState } from "react";
import CreateAndManageBacks from "@/components/admin/dashboard/Shirt/ShirtDashboard/Back";
import { ToastContainer } from "react-toastify";

const Page = () => {
  const [fabricId, setFabricId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  useEffect(() => {
    // Fetch fabricId, colorId, and gender from localStorage
    const storedFabricId = localStorage.getItem("fabricId");
    const storedColorId = localStorage.getItem("colorId");
    const storedGender = localStorage.getItem("gender");

    // Ensure the IDs are exactly 24 characters (valid MongoDB ObjectId)
    if (storedFabricId && storedFabricId.length === 24)
      setFabricId(storedFabricId);
    if (storedColorId && storedColorId.length === 24)
      setColorId(storedColorId);
    if (storedGender) setGender(storedGender);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center px-[.5rem] w-[98%] md:w-[70%]">
      <ToastContainer />
      {fabricId && colorId && gender ? (
        <CreateAndManageBacks fabricId={fabricId} colorId={colorId} gender={gender} />
      ) : (
        <p>Loading...</p> // Show loading text if IDs are not yet set
      )}
    </div>
  );
};

export default Page;
