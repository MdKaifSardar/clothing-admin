"use client";

import CustomerDetailTable from "@/components/admin/dashboard/customer";

const page = () => {
  return (
    <div className="pt-[2rem] w-[90%] flex flex-col justify-center items-center">
      <CustomerDetailTable />
    </div>
  );
};

export default page;
