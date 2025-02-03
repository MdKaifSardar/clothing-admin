"use client";

import { ToastContainer } from "react-toastify";
import CreateAndManageColors from "@/components/admin/dashboard/Colors";

const Page = () => {
  return (
    <div className="flex flex-col justify-center items-center w-[70%]">
      <ToastContainer />
      <CreateAndManageColors />
    </div>
  );
};

export default Page;
