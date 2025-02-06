import React from "react";
import { HiCurrencyRupee } from "react-icons/hi";
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { calculateTotalOrders } from "@/lib/database/actions/admin/dashboard/dashboard.actions";

const AdminDashboardPage = async () => {
  const allOrdersData = await calculateTotalOrders().catch((err) =>
    console.log(err)
  );

  return (
    <div className="w-[90%]">
      <div className=" text-center text-2xl md:text-3xl mb-6">
        Orders
      </div>

      {/* Sales Summary Boxes */}
      <div className="flex flex-wrap justify-evenly items-center gap-6 my-[20px]">
        <div className="h-[100px] gap-[10px] border-2 border-gray-400 p-[10px] w-full sm:w-[200px] shadow-2xl flex items-center justify-center rounded-3xl">
          <HiCurrencyRupee size={60} />{" "}
          <span className="text-xl">
            ₹ {allOrdersData?.totalSales} Total Sales
          </span>
        </div>
        <div className="h-[100px] gap-[10px] border-2 border-gray-400 p-[10px] w-full sm:w-[200px] shadow-2xl flex items-center justify-center rounded-3xl">
          <HiCurrencyRupee size={60} />{" "}
          <span className="text-xl">
            ₹ {allOrdersData?.lastMonthSales} Last Month Sales
          </span>
        </div>
        <div className="h-[100px] gap-[10px] border-2 border-gray-400 p-[10px] w-full sm:w-[200px] shadow-2xl flex items-center justify-center rounded-3xl">
          <HiCurrencyRupee size={60} />{" "}
          <span className="text-xl">
            ₹ {allOrdersData?.growthPercentage} Growth Percentage
          </span>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="my-[20px]">
        <div className="">
          <div className="text-xl md:text-2xl mb-4">
            Recent Orders
          </div>
        </div>
        <div className="w-full">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    style={{ border: "2px solid black" }}
                    className="md:table-cell block text-sm md:text-base"
                  >
                    Name
                  </TableCell>
                  <TableCell
                    style={{ border: "2px solid black" }}
                    className="md:table-cell block text-sm md:text-base"
                  >
                    Total
                  </TableCell>
                  <TableCell
                    style={{ border: "2px solid black" }}
                    className="md:table-cell block text-sm md:text-base"
                  >
                    Payment
                  </TableCell>
                  <TableCell
                    style={{ border: "2px solid black" }}
                    className="md:table-cell block text-sm md:text-base"
                  >
                    View
                  </TableCell>
                </TableRow>
              </TableHead>
              {/* Add the rows here */}
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
