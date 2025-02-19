import GenderDashboard from "@/components/admin/dashboard/Gender";
import React from "react";
import { ToastContainer } from "react-toastify";

const page = () => {
  return (
    <div className="flex flex-col justify-center items-center h-fit w-[90%] md:w-[70%]">
      <ToastContainer />
      <GenderDashboard />
    </div>
  );
};

export default page;
