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
import {
  calculateTotalOrders,
} from "@/lib/database/actions/admin/dashboard/dashboard.actions";

const AdminDashboardPage = async () => {
  const allOrdersData = await calculateTotalOrders().catch((err) =>
    console.log(err)
  );

  return (
    <div className="container">
      <div className="titleStyle">Orders</div>
      <div className="flex justify-evenly items-center my-[20px]">
        <div className="h-[100px] gap-[10px] border-2 border-gray-400 p-[10px] w-[200px] shadow-2xl flex items-center justify-center rounded-3xl">
          <HiCurrencyRupee size={100} /> ₹ {allOrdersData?.totalSales} Total
          Sales
        </div>
        <div className="h-[100px] gap-[10px] border-2 border-gray-400 p-[10px] w-[200px] shadow-2xl flex items-center justify-center rounded-3xl">
          <HiCurrencyRupee size={100} /> ₹ {allOrdersData?.lastMonthSales} Last
          Month Sales
        </div>{" "}
        <div className="h-[100px] gap-[10px] border-2 border-gray-400 p-[10px] w-[200px] shadow-2xl flex items-center justify-center rounded-3xl">
          <HiCurrencyRupee size={100} /> ₹ {allOrdersData?.growthPercentage}{" "}
          Growth Percentage
        </div>
      </div>
      <div className="my-[20px]">
        <div className="">
          <div className="SecondaryTitleStyle">Recent Orders</div>
        </div>
        <div className="w-full">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ border: "2px solid black" }}>
                    Name
                  </TableCell>
                  <TableCell style={{ border: "2px solid black" }}>
                    Total
                  </TableCell>
                  <TableCell style={{ border: "2px solid black" }}>
                    Payment
                  </TableCell>
                  <TableCell style={{ border: "2px solid black" }}>
                    View
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
