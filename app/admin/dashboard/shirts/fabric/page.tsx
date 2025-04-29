"use client";

// pages/admin/fabrics.tsx
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { getAllFabrics } from "@/lib/database/actions/admin/ShirtArea/Fabric/fabric.actions";
import CreateFabric from "@/components/admin/dashboard/Fabrics/AddFabric";
import ListAllFabrics from "@/components/admin/dashboard/Fabrics/ListAllFabrics";

// Define the Fabric type
export interface Fabric {
  _id: string;
  fabricName: string;
  image: {
    url: string;
    public_id: string;
  };
  price: number;
  discount: number;
  description: string;
}

const VendorFabricsPage = () => {
  const [fabrics, setFabrics] = useState<Fabric[]>([]); // Specify the Fabric[] type

  // Function to fetch fabrics
  const fetchFabrics = async () => {
    try {
      const fetchedFabrics = await getAllFabrics();
      setFabrics(fetchedFabrics);
    } catch (error) {
      console.log("Error fetching fabrics:", error);
    }
  };

  // Fetch fabrics on component mount
  useEffect(() => {
    fetchFabrics();
  }, []);

  return (
    <div className="gap-[2rem] flex flex-col justify-center items-center h-fit w-[90%] md:w-[70%]">
      <ToastContainer />
      <CreateFabric fetchFabrics={fetchFabrics} />
      <ListAllFabrics
        fabrics={fabrics}
        setFabrics={setFabrics}
        fetchFabrics={fetchFabrics} // Pass the fetching function
      />
    </div>
  );
};

export default VendorFabricsPage;
