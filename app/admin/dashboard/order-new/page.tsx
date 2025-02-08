"use client";

import {
  fetchOrders,
  updateOrderConfirmation,
  updateOrderDeliveryStatus,
} from "@/lib/database/actions/admin/orders/orders.actions";
import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { toast, ToastContainer } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import { getShirtById } from "@/lib/database/actions/admin/ShirtArea/Shirt/shirt.actions";

const OrdersTable = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [productDetails, setProductDetails] = useState<{ [key: string]: any }>(
    {}
  );

  useEffect(() => {
    const fetchShirt = async () => {
      const response = await getShirtById("67a4aca1f08ec705869b423e");
      if (response.success) {
        console.log("success");
        console.log(response.shirt);
      } else {
        console.log("error");
      }
    };
    fetchShirt();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      fetchProductDetails();
    }
  }, [selectedOrder]);

  const fetchProductDetails = async () => {
    const details: { [key: string]: any } = {};

    for (const product of selectedOrder.products) {
      try {
        const response = await getShirtById(product.productId); // Fetching directly from the function

        if (response.success) {
          console.log(response);
          console.log("Fetched product details:", response.shirt);
          details[product.productId] = response.shirt; // Store by productId
        }
      } catch (error) {
        console.error(`Error fetching product ${product.productId}:`, error);
      }
    }

    setProductDetails(details); // Update state once after loop
  };

  const loadOrders = async () => {
    // toast.info("Fetching orders..."); // Toast for fetching orders
    try {
      const ordersData = await fetchOrders();
      console.log("Fetched orders:", ordersData); // Log the fetched orders
      setOrders(ordersData);
      //   toast.success("Orders fetched successfully!"); // Success toast
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

    // Product details - Page break for each product
    order.products.forEach((product: any, index: number) => {
      // Start each product on a new page
      if (index >= 0) {
        doc.addPage();
        yPosition = 20; // Reset position for new page
      }

      // Product heading
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`Product ${index + 1}:`, 20, yPosition);
      yPosition += 10;

      // Product Details Section (clear label formatting)
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      // Ensure parameter labels are in block letters
      const labelStyle = { font: "helvetica", size: 12, fontStyle: "bold" };
      doc.setFont(labelStyle.font, labelStyle.fontStyle);

      // Product info
      doc.text("PRODUCT DETAILS:", 20, yPosition);
      yPosition += 10;
      doc.text(`Product ID:`, 20, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${product.productId}`, 60, yPosition);
      yPosition += 10;
      doc.setFont(labelStyle.font, labelStyle.fontStyle);
      doc.text(`Quantity:`, 20, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${product.qty}`, 60, yPosition);
      yPosition += 10;
      doc.setFont(labelStyle.font, labelStyle.fontStyle);
      doc.text(`Price:`, 20, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`$${product.price}`, 60, yPosition);
      yPosition += 15;

      const details = productDetails[product.productId] || {};
      // Divide details into two columns for the monogram section
      const xOffset = 110; // X-coordinate for second column

      // Monogram details (left and right columns)
      doc.setFont(labelStyle.font, labelStyle.fontStyle);
      doc.text("Shirt details:", 20, yPosition);
      yPosition += 10;

      doc.setFont("helvetica", "normal");
      doc.text(`Collar Style:`, 20, yPosition);
      doc.text(`${details?.collarStyle || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Collar Button:`, 20, yPosition);
      doc.text(`${details?.collarButton || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Collar Height:`, 20, yPosition);
      doc.text(`${details?.collarHeight || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Cuff Style:`, 20, yPosition);
      doc.text(`${details?.cuffStyle || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Cuff Links:`, 20, yPosition);
      doc.text(`${details?.cuffLinks || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Fit:`, 20, yPosition);
      doc.text(`${details?.fit || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Back:`, 20, yPosition);
      doc.text(`${details?.back || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Bottom:`, 20, yPosition);
      doc.text(`${details?.bottom || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Placket:`, 20, yPosition);
      doc.text(`${details?.placket || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Pocket:`, 20, yPosition);
      doc.text(`${details?.pocket || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Sleeves:`, 20, yPosition);
      doc.text(`${details?.sleeves || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Fabric:`, 20, yPosition);
      doc.text(`${details?.fabric?.fabricName || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Color:`, 20, yPosition);
      doc.text(`${details?.color?.name || "N/A"}`, xOffset, yPosition);
      yPosition += 10;

      // Monogram Section
      doc.setFont(labelStyle.font, labelStyle.fontStyle);
      doc.text("MONOGRAM DETAILS:", 20, yPosition);
      yPosition += 10;

      // Monogram details (split in two columns)
      doc.setFont("helvetica", "normal");
      doc.text("Monogram Text:", 20, yPosition);
      doc.text(`${details?.monogram?.text || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text("Monogram Color:", 20, yPosition);
      doc.text(`${details?.monogram?.color || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text("Monogram Style:", 20, yPosition);
      doc.text(
        `${details?.monogram?.style?.name || "N/A"}`,
        xOffset,
        yPosition
      );
      yPosition += 10;
      doc.text("Monogram Position:", 20, yPosition);
      doc.text(
        `${details?.monogram?.position?.name || "N/A"}`,
        xOffset,
        yPosition
      );
      yPosition += 15;

      doc.addPage();
      yPosition = 20;

      // Measurement Section (split in two columns)
      doc.setFont(labelStyle.font, labelStyle.fontStyle);
      doc.text("MEASUREMENT DETAILS:", 20, yPosition);
      yPosition += 10;

      // Left column: First set of measurements
      doc.setFont("helvetica", "normal");
      doc.text(`Collar:`, 20, yPosition);
      doc.text(`${details?.measurement?.collar || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Neck:`, 20, yPosition);
      doc.text(`${details?.measurement?.neck || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Chest:`, 20, yPosition);
      doc.text(`${details?.measurement?.chest || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Half Chest:`, 20, yPosition);
      doc.text(
        `${details?.measurement?.halfChest || "N/A"}`,
        xOffset,
        yPosition
      );
      yPosition += 10;
      doc.text(`Waist:`, 20, yPosition);
      doc.text(`${details?.measurement?.waist || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Half Waist:`, 20, yPosition);
      doc.text(
        `${details?.measurement?.halfWaist || "N/A"}`,
        xOffset,
        yPosition
      );
      yPosition += 10;

      // Right column: Second set of measurements
      doc.text(`Hips:`, 20, yPosition);
      doc.text(`${details?.measurement?.hips || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Half Hips:`, 20, yPosition);
      doc.text(
        `${details?.measurement?.halfHips || "N/A"}`,
        xOffset,
        yPosition
      );
      yPosition += 10;
      doc.text(`Shoulder:`, 20, yPosition);
      doc.text(
        `${details?.measurement?.shoulder || "N/A"}`,
        xOffset,
        yPosition
      );
      yPosition += 10;
      doc.text(`Sleeves Length:`, 20, yPosition);
      doc.text(
        `${details?.measurement?.sleevesLength || "N/A"}`,
        xOffset,
        yPosition
      );
      yPosition += 10;
      doc.text(`Upper Arm:`, 20, yPosition);
      doc.text(
        `${details?.measurement?.upperArm || "N/A"}`,
        xOffset,
        yPosition
      );
      yPosition += 10;
      doc.text(`Elbow:`, 20, yPosition);
      doc.text(`${details?.measurement?.elbow || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Elbow Width:`, 20, yPosition);
      doc.text(
        `${details?.measurement?.elbowWidth || "N/A"}`,
        xOffset,
        yPosition
      );
      yPosition += 10;
      doc.text(`Forearm:`, 20, yPosition);
      doc.text(`${details?.measurement?.forearm || "N/A"}`, xOffset, yPosition);
      yPosition += 10;
      doc.text(`Cuff:`, 20, yPosition);
      doc.text(`${details?.measurement?.cuff || "N/A"}`, xOffset, yPosition);
      yPosition += 15;
    });

    // Save the PDF with a well-formatted name
    doc.save(`${order.orderId}-details.pdf`);
  };

  const toggleOrderConfirmation = async (
    orderId: string,
    currentStatus: boolean
  ) => {
    const updatedStatus = !currentStatus;
    // toast.info("Updating order confirmation..."); // Toast for toggling status
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

  const updateDeliveryStatus = async (
    orderId: string,
    newStatus: "pending" | "shipped" | "delivered"
  ) => {
    // Show a toast message while updating
    toast.info("Updating delivery status...");

    try {
      const result = await updateOrderDeliveryStatus(orderId, newStatus);

      if (result.success) {
        // Update the local state with the new delivery status
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? { ...order, deliveryStatus: newStatus }
              : order
          )
        );

        // Refetch orders after update
        loadOrders();
        toast.success("Delivery status updated successfully!");
      } else {
        toast.error(result.message || "Failed to update delivery status.");
      }
    } catch (error) {
      toast.error("An error occurred while updating delivery status.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-[90%] h-fit">
      <h1>Orders</h1>
      <div className="w-full overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
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
                  <td className="border p-2">
                    <select
                      value={order.deliveryStatus}
                      onChange={(e) =>
                        updateDeliveryStatus(
                          order.orderId,
                          e.target.value as "pending" | "shipped" | "delivered"
                        )
                      }
                      className="border p-2 rounded bg-white text-black"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-[100]">
          <div className="bg-white w-3/4 max-h-[80vh] overflow-y-auto p-6 rounded-lg">
            <h2 className="text-2xl mb-4">Order Details</h2>
            <div className="mb-[.5rem] w-fit flex flex-row justify-center gap-[.5rem] items-center">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={closeModal}
              >
                Close
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => downloadPDF(selectedOrder)}
              >
                Download PDF
              </button>
            </div>
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
              {selectedOrder.products.map((product: any, index: number) => {
                const details = productDetails[product.productId] || {};
                return (
                  <div
                    key={index}
                    className="border p-4 rounded-lg mb-4 bg-gray-100"
                  >
                    <p>
                      <strong>Product {index + 1}:</strong>
                    </p>
                    <p>
                      <strong>Product ID:</strong> {product.productId}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {product.qty}
                    </p>
                    <p>
                      <strong>Price:</strong> ${product.price}
                    </p>

                    {details ? (
                      <div className="mt-[2rem] grid grid-cols-1 md:grid-cols-3 w-full flex-gap-4">
                        {/* Shirt Details Section */}
                        <div className="w-full space-y-2">
                          <h3 className="font-semibold text-lg">
                            Shirt Details
                          </h3>
                          <p>
                            <strong>Collar Style:</strong>{" "}
                            {details.collarStyle || "N/A"}
                          </p>
                          <p>
                            <strong>Collar Button:</strong>{" "}
                            {details.collarButton || "N/A"}
                          </p>
                          <p>
                            <strong>Collar Height:</strong>{" "}
                            {details.collarHeight || "N/A"}
                          </p>
                          <p>
                            <strong>Cuff Style:</strong>{" "}
                            {details.cuffStyle || "N/A"}
                          </p>
                          <p>
                            <strong>Cuff Links:</strong>{" "}
                            {details.cuffLinks || "N/A"}
                          </p>
                          <p>
                            <strong>Fabric:</strong>{" "}
                            {details.fabric?.fabricName || "N/A"}
                          </p>
                          <p>
                            <strong>Color:</strong>{" "}
                            {details.color?.name || "N/A"}
                          </p>
                          <p>
                            <strong>Fit:</strong> {details.fit || "N/A"}
                          </p>
                          <p>
                            <strong>Back:</strong> {details.back || "N/A"}
                          </p>
                          <p>
                            <strong>Bottom:</strong> {details.bottom || "N/A"}
                          </p>
                          <p>
                            <strong>Pocket:</strong> {details.pocket || "N/A"}
                          </p>
                          <p>
                            <strong>Placket:</strong> {details.placket || "N/A"}
                          </p>
                          <p>
                            <strong>Sleeves:</strong> {details.sleeves || "N/A"}
                          </p>
                          <p>
                            <strong>Watch Compatible:</strong>{" "}
                            {details.watchCompatible}
                          </p>
                        </div>

                        {/* Monogram Details Section */}
                        <div className="w-full space-y-2">
                          <h3 className="font-semibold text-lg">
                            Monogram Details
                          </h3>
                          <p>
                            <strong>Monogram Text:</strong>{" "}
                            {details.monogram?.text || "N/A"}
                          </p>
                          <p>
                            <strong>Monogram Color:</strong>{" "}
                            {details.monogram?.color || "N/A"}
                          </p>
                          <p>
                            <strong>Monogram Style:</strong>{" "}
                            {details.monogram?.style?.name || "N/A"}
                          </p>
                          <p>
                            <strong>Monogram Position:</strong>{" "}
                            {details.monogram?.position?.name || "N/A"}
                          </p>
                        </div>

                        {/* Measurement Details Section */}
                        <div className="w-full space-y-2">
                          <h3 className="font-semibold text-lg">
                            Measurement Details
                          </h3>
                          <ul>
                            <li>
                              <strong>Collar:</strong>{" "}
                              {details.measurement?.collar || "N/A"}
                            </li>
                            <li>
                              <strong>Neck:</strong>{" "}
                              {details.measurement?.neck || "N/A"}
                            </li>
                            <li>
                              <strong>Chest:</strong>{" "}
                              {details.measurement?.chest || "N/A"}
                            </li>
                            <li>
                              <strong>Half Chest:</strong>{" "}
                              {details.measurement?.halfChest || "N/A"}
                            </li>
                            <li>
                              <strong>Waist:</strong>{" "}
                              {details.measurement?.waist || "N/A"}
                            </li>
                            <li>
                              <strong>Half Waist:</strong>{" "}
                              {details.measurement?.halfWaist || "N/A"}
                            </li>
                            <li>
                              <strong>Hips:</strong>{" "}
                              {details.measurement?.hips || "N/A"}
                            </li>
                            <li>
                              <strong>Half Hips:</strong>{" "}
                              {details.measurement?.halfHips || "N/A"}
                            </li>
                            <li>
                              <strong>Shoulder:</strong>{" "}
                              {details.measurement?.shoulder || "N/A"}
                            </li>
                            <li>
                              <strong>Sleeves Length:</strong>{" "}
                              {details.measurement?.sleevesLength || "N/A"}
                            </li>
                            <li>
                              <strong>Upper Arm:</strong>{" "}
                              {details.measurement?.upperArm || "N/A"}
                            </li>
                            <li>
                              <strong>Elbow:</strong>{" "}
                              {details.measurement?.elbow || "N/A"}
                            </li>
                            <li>
                              <strong>Elbow Width:</strong>{" "}
                              {details.measurement?.elbowWidth || "N/A"}
                            </li>
                            <li>
                              <strong>Forearm:</strong>{" "}
                              {details.measurement?.forearm || "N/A"}
                            </li>
                            <li>
                              <strong>Cuff:</strong>{" "}
                              {details.measurement?.cuff || "N/A"}
                            </li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p>Loading product details...</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <ToastContainer />{" "}
      {/* Add ToastContainer to show the toast notifications */}
    </div>
  );
};

export default OrdersTable;
