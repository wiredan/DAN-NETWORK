import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function OrderTracking() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api("/orders", "GET", null, token);
        setOrders(res.orders);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [token]);

  const handleAction = async (id, action) => {
    try {
      await api(`/orders/${id}/${action}`, "POST", {}, token);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: action } : o))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">My Orders</h1>
      {error && <p className="text-red-500">{error}</p>}
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border rounded p-4 bg-white dark:bg-gray-800 shadow">
              <p>
                <span className="font-semibold">Product:</span> {o.product_name}
              </p>
              <p>
                <span className="font-semibold">Seller:</span> {o.seller_id}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span className="text-blue-600">{o.status}</span>
              </p>

              <div className="mt-3 flex gap-2">
                {o.status === "paid" && (
                  <button
                    onClick={() => handleAction(o.id, "ship")}
                    className="bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Confirm Shipment
                  </button>
                )}
                {o.status === "shipped" && (
                  <button
                    onClick={() => handleAction(o.id, "confirm")}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Confirm Received
                  </button>
                )}
                {o.status === "shipped" && (
                  <button
                    onClick={() => handleAction(o.id, "dispute")}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Open Dispute
                  </button>
                )}
                {o.status === "disputed" && (
                  <p className="text-red-500">Waiting for admin resolution...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}