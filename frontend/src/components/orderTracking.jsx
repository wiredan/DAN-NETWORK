import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/orders"; // update when deployed

const OrderTracking = ({ user }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/all`, {
        params: { userId: user._id },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  const takeAction = async (endpoint, orderId, data = {}) => {
    try {
      const res = await axios.post(
        `${API_URL}/${endpoint}/${orderId}`,
        { ...data, userId: user._id }
      );
      alert(res.data.message);
      fetchOrders();
    } catch (err) {
      alert("Error: " + err.response?.data?.error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📦 Order Tracking</h2>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="p-2 border">{order.product?.name || "N/A"}</td>
                <td className="p-2 border">{order.status}</td>
                <td className="p-2 border">
                  {/* Buyer actions */}
                  {user._id === order.buyer && order.status === "shipped" && (
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded"
                      onClick={() => takeAction("confirm", order._id)}
                    >
                      Confirm Delivery
                    </button>
                  )}
                  {user._id === order.buyer && order.status === "delivered" && (
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() => takeAction("confirm", order._id)}
                    >
                      Release Funds
                    </button>
                  )}
                  {user._id === order.buyer && order.status !== "completed" && (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded ml-2"
                      onClick={() =>
                        takeAction("dispute", order._id, {
                          reason: "Issue with product",
                        })
                      }
                    >
                      Open Dispute
                    </button>
                  )}

                  {/* Seller actions */}
                  {user._id === order.seller && order.status === "in_escrow" && (
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={() => takeAction("ship", order._id)}
                    >
                      Mark Shipped
                    </button>
                  )}

                  {/* Logistics actions */}
                  {user._id === order.logistics && order.status === "shipped" && (
                    <button
                      className="bg-purple-500 text-white px-3 py-1 rounded"
                      onClick={() => takeAction("logistics/confirm", order._id)}
                    >
                      Confirm Delivery
                    </button>
                  )}

                  {/* Admin actions */}
                  {user.role === "admin" && order.status === "disputed" && (
                    <>
                      <button
                        className="bg-green-700 text-white px-3 py-1 rounded mr-2"
                        onClick={() =>
                          takeAction("resolve", order._id, {
                            resolution: "release",
                          })
                        }
                      >
                        Release Funds
                      </button>
                      <button
                        className="bg-red-700 text-white px-3 py-1 rounded"
                        onClick={() =>
                          takeAction("resolve", order._id, {
                            resolution: "refund",
                          })
                        }
                      >
                        Refund Buyer
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderTracking;