"use client";

import {
  deleteCustomerDetail,
  fetchCustomerDetail,
} from "@/lib/database/actions/admin/customerDetail.actions";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const CustomerDetailTable = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [limit, setLimit] = useState<number>(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetchCustomerDetail("all");
      if (res.success) {
        setCustomers(res.data);
      } else {
        toast.error(res.message || "Failed to fetch customer details.");
      }
    } catch (error) {
      toast.error("Error fetching customer details.");
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id: string) => {
    setSelectedCustomer(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCustomer) return;
    try {
      const res = await deleteCustomerDetail(selectedCustomer);
      if (res.success) {
        toast.success(res.message);
        await fetchData();
      } else {
        toast.error(res.message || "Failed to delete customer.");
      }
    } catch (error) {
      toast.error("Error deleting customer.");
      console.error("Delete error:", error);
    } finally {
      setIsModalOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLimit(val === "more" ? 50 : parseInt(val, 10));
  };

  const displayedCustomers = Array.isArray(customers)
    ? customers.slice(0, limit)
    : [];

  return (
    <div className="w-full">
      <div className="w-full mb-4">
        <label htmlFor="limit" className="mr-2">
          Show:
        </label>
        <select
          id="limit"
          value={limit === 50 ? "more" : limit}
          onChange={handleLimitChange}
          className="border rounded p-1"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="more">More than 20</option>
        </select>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm md:text-base">
                Prefix
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm md:text-base">
                First Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm md:text-base">
                Last Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm md:text-base">
                Email
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm md:text-base">
                Country
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm md:text-base">
                Mobile
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm md:text-base">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedCustomers.length > 0 ? (
              displayedCustomers.map((cust: any) => (
                <tr key={cust._id}>
                  <td className="border border-gray-300 px-4 py-2">
                    {cust.prefix}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {cust.firstName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {cust.lastName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {cust.email}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {cust.country}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {cust.mobile}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => handleDelete(cust._id)}
                      className="text-white bg-red-500 p-[.5rem] rounded-lg  hover:text-white hover:bg-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-gray-300 px-4 py-2 text-center"
                  colSpan={7}
                >
                  No customer details found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete this customer detail?
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 mr-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailTable;
