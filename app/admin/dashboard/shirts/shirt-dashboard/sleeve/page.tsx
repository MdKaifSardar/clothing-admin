"use client";
import { useEffect, useState } from "react";
import CreateAndManageSleeves from "@/components/admin/dashboard/Shirt/ShirtDashboard/Sleeve";
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
      <CreateAndManageSleeves
        fabricId={fabricId || "default-fabric-id"}
        colorId={colorId || "default-color-id"}
      />
    </div>
  );
};

export default Page;
