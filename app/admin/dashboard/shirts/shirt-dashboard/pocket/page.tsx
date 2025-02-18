"use client";

import { useEffect, useState } from "react";
import CreateAndManagePockets from "@/components/admin/dashboard/Shirt/ShirtDashboard/pocket";
import { ToastContainer } from "react-toastify";

const Page = () => {
  const [fabricId, setFabricId] = useState<string | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  useEffect(() => {
    const storedFabricId = localStorage.getItem("fabricId");
    const storedColorId = localStorage.getItem("colorId");
    const storedGender = localStorage.getItem("gender");

    // Validate MongoDB ObjectId (24-character hex string)
    if (storedFabricId && storedFabricId.length === 24)
      setFabricId(storedFabricId);
    if (storedColorId && storedColorId.length === 24) setColorId(storedColorId);
    if (storedGender) setGender(storedGender);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center px-[.5rem] w-[98%] md:w-[70%]">
      <ToastContainer />
      {fabricId && colorId && gender ? (
        <CreateAndManagePockets fabricId={fabricId} colorId={colorId} gender={gender} />
      ) : (
        <p>Loading...</p> // Show loading message until valid IDs are available
      )}
    </div>
  );
};

export default Page;
