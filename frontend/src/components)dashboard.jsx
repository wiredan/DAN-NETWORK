import React from "react";
import { Link } from "react-router-dom";

const Dashboard = ({ user }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.email || "User"} 👋</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buyer quick links */}
        {user?.role === "buyer" && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Buyer Actions</h2>
            <Link
              to="/orders"
              className="bg-blue-500 text-white px-3 py-2 rounded block text-center"
            >
              Track My Orders
            </Link>
          </div>
        )}

        {/* Seller quick links */}
        {user?.role === "seller" && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Seller Actions</h2>
            <Link
              to="/orders"
              className="bg-green-500 text-white px-3 py-2 rounded block text-center"
            >
              Manage My Sales
            </Link>
          </div>
        )}

        {/* Admin quick links */}
        {user?.role === "admin" && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Admin Panel</h2>
            <Link
              to="/orders"
              className="bg-red-600 text-white px-3 py-2 rounded block text-center"
            >
              Review All Transactions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;