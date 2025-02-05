"use client";

import {
  fetchOrders,
  updateOrderConfirmation,
} from "@/lib/database/actions/admin/orders/orders.actions";
import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { toast, ToastContainer } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const OrdersTable = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const loadOrders = async () => {
    toast.info("Fetching orders..."); // Toast for fetching orders
    try {
      const ordersData = await fetchOrders();
      console.log("Fetched orders:", ordersData); // Log the fetched orders
      setOrders(ordersData);
      toast.success("Orders fetched successfully!"); // Success toast
    } catch (error) {
      toast.error("Failed to fetch orders."); // Error toast
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const downloadPDF = (order: any) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Order Details", 20, 20);

    // Order details
    doc.setFontSize(12);
    let yPosition = 30;
    doc.text(`Order ID: ${order.orderId}`, 20, yPosition);
    yPosition += 10;
    doc.text(
      `Order Confirmation: ${
        order.orderConfirmation ? "Confirmed" : "Not Confirmed"
      }`,
      20,
      yPosition
    );
    yPosition += 10;
    doc.text(`Delivery Status: ${order.deliveryStatus}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Price: $${order.price}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Delivery Cost: $${order.deliveryCost}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Payment Method: ${order.paymentMethod}`, 20, yPosition);
    yPosition += 10;
    doc.text(
      `Payment Time: ${new Date(order.paymentTime).toLocaleString()}`,
      20,
      yPosition
    );
    yPosition += 10;
    doc.text(`Receipt: ${order.receipt}`, 20, yPosition);
    yPosition += 10;

    // Order Address
    if (order.orderAddress) {
      doc.text(`Address:`, 20, yPosition);
      yPosition += 10;
      doc.text(
        `${order.orderAddress.address1}, ${order.orderAddress.city}, ${order.orderAddress.state}, ${order.orderAddress.zipCode}, ${order.orderAddress.country}`,
        20,
        yPosition
      );
      yPosition += 10;
    }

    // Product details
    order.products.forEach((product: any, index: number) => {
      doc.text(`Product ${index + 1}:`, 20, yPosition);
      yPosition += 10;
      doc.text(`Product ID: ${product.productId}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Quantity: ${product.qty}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Price: $${product.price}`, 20, yPosition);
      yPosition += 15;
    });

    doc.save(`${order.orderId}-details.pdf`);
  };

  const toggleOrderConfirmation = async (
    orderId: string,
    currentStatus: boolean
  ) => {
    const updatedStatus = !currentStatus;
    toast.info("Updating order confirmation..."); // Toast for toggling status
    try {
      const result = await updateOrderConfirmation(orderId);
      if (result.success) {
        // Update the local state with the new confirmation status
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? { ...order, orderConfirmation: updatedStatus }
              : order
          )
        );

        // Refetch orders after update
        loadOrders();
        toast.success("Order confirmation updated successfully!"); // Success toast
      } else {
        toast.error("Failed to update order confirmation."); // Error toast
      }
    } catch (error) {
      toast.error("An error occurred while updating order confirmation."); // Error toast
    }
  };

  return (
    <div>
      <h1>Orders</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Order Id</th>
              <th className="border p-2">Order Confirmation</th>
              <th className="border p-2">Delivery Status</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Delivery Cost</th>
              <th className="border p-2">Payment Method</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <tr key={index}>
                  <td className="border p-2">{order.orderId}</td>
                  <td className="border p-2">
                    <button
                      className={`${
                        order.orderConfirmation ? "bg-green-500" : "bg-red-500"
                      } text-white px-4 py-2 rounded hover:scale-105 transition-all`}
                      onClick={() =>
                        toggleOrderConfirmation(
                          order.orderId,
                          order.orderConfirmation
                        )
                      }
                    >
                      {order.orderConfirmation ? "Confirmed" : "Not Confirmed"}
                    </button>
                  </td>
                  <td className="border p-2">{order.deliveryStatus}</td>
                  <td className="border p-2">{order.price}</td>
                  <td className="border p-2">{order.deliveryCost}</td>
                  <td className="border p-2">{order.paymentMethod}</td>
                  <td className="border p-2">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:scale-105 transition-all"
                      onClick={() => openOrderDetails(order)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="border p-2 text-center">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-3/4 max-h-[80vh] overflow-y-auto p-6 rounded-lg">
            <h2 className="text-2xl mb-4">Order Details</h2>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded mb-4"
              onClick={closeModal}
            >
              Close
            </button>
            <div className="space-y-4">
              <p>
                <strong>Order ID:</strong> {selectedOrder.orderId}
              </p>
              <p>
                <strong>Order Confirmation:</strong>{" "}
                {selectedOrder.orderConfirmation
                  ? "Confirmed"
                  : "Not Confirmed"}
              </p>
              <p>
                <strong>Delivery Status:</strong> {selectedOrder.deliveryStatus}
              </p>
              <p>
                <strong>Price:</strong> ${selectedOrder.price}
              </p>
              <p>
                <strong>Delivery Cost:</strong> ${selectedOrder.deliveryCost}
              </p>
              <p>
                <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
              </p>
              <p>
                <strong>Payment Time:</strong>{" "}
                {new Date(selectedOrder.paymentTime).toLocaleString()}
              </p>
              <p>
                <strong>Receipt:</strong> {selectedOrder.receipt}
              </p>
              <p>
                <strong>Address:</strong>
              </p>
              {selectedOrder.orderAddress ? (
                <>
                  <p>
                    {selectedOrder.orderAddress.address1},{" "}
                    {selectedOrder.orderAddress.city},{" "}
                    {selectedOrder.orderAddress.state},{" "}
                    {selectedOrder.orderAddress.zipCode},{" "}
                    {selectedOrder.orderAddress.country}
                  </p>
                </>
              ) : (
                <p>No Address</p>
              )}

              <h3 className="mt-4 font-bold">Products:</h3>
              {selectedOrder.products.map((product: any, index: number) => (
                <div key={index}>
                  <p>
                    <strong>Product {index + 1}:</strong>
                  </p>
                  <p>Product ID: {product.productId}</p>
                  <p>Quantity: {product.qty}</p>
                  <p>Price: ${product.price}</p>
                </div>
              ))}
            </div>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded mt-4"
              onClick={() => downloadPDF(selectedOrder)}
            >
              Download PDF
            </button>
          </div>
        </div>
      )}
      <ToastContainer />{" "}
      {/* Add ToastContainer to show the toast notifications */}
    </div>
  );
};

export default OrdersTable;
