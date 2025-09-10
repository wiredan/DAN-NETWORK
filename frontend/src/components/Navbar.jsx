import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ theme, setTheme }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // admin or user

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="bg-green-700 text-white px-6 py-3 flex justify-between items-center">
      <div className="flex gap-4">
        <Link to="/" className="font-bold">AgriNet</Link>
        {token && (
          <>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/orders">Orders</Link>
            <Link to="/kyc">KYC</Link>
            <Link to="/ai">AI Bot</Link>
            {role === "admin" && <Link to="/admin">Admin</Link>}
          </>
        )}
      </div>
      <div className="flex gap-3 items-center">
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="bg-gray-800 px-3 py-1 rounded"
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        {token ? (
          <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">
            Logout
          </button>
        ) : (
          <Link to="/login" className="bg-blue-600 px-3 py-1 rounded">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex space-x-4 bg-gray-800 text-white p-4">
      <Link to="/">Home</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/orders">Orders</Link> {/* ✅ new link */}
    </nav>
  );
};

export default Navbar;