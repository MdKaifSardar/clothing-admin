"use client";
import { useEffect, useState } from "react";
import CreateAndManageBottoms from "@/components/admin/dashboard/Shirt/ShirtDashboard/Bottom";
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
      <CreateAndManageBottoms
        fabricId={fabricId}
        colorId={colorId}
      />
    </div>
  );
};

export default Page;
