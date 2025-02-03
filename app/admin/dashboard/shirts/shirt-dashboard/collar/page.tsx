"use client";
import { useEffect, useState } from "react";
import CreateAndManageCollars from "@/components/admin/dashboard/Shirt/ShirtDashboard/Collar";
import { ToastContainer } from "react-toastify";

const Page = () => {
  const [fabricId, setFabricId] = useState("");
  const [colorId, setColorId] = useState("");

  useEffect(() => {
    const storedFabricId = localStorage.getItem("fabricId");
    const storedColorId = localStorage.getItem("colorId");

    if (storedFabricId) setFabricId(storedFabricId);
    if (storedColorId) setColorId(storedColorId);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-[70%]">
      <ToastContainer />
      <CreateAndManageCollars
        fabricId={fabricId || "67a10e7329f29525b3736445"} // Fallback if localStorage is empty
        colorId={colorId || "67a10ffc552260f904204e77"}
      />
    </div>
  );
};

export default Page;
