import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import ThemeSelector from "./components/ThemeSelector";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Marketplace from "./pages/Marketplace";
import ProductForm from "./pages/ProductForm";
import OrderTracking from "./pages/OrderTracking";
import KYC from "./pages/KYC";
import Admin from "./pages/Admin";
import AIBot from "./pages/AIBot";
import Profile from "./pages/Profile";

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-lg">🌱 AgriNetwork</Link>
        <nav className="flex gap-4 items-center">
          {token ? (
            <>
              <Link to="/marketplace">Marketplace</Link>
              <Link to="/orders">Orders</Link>
              <Link to="/kyc">KYC</Link>
              <Link to="/ai">AI Bot</Link>
              <Link to="/profile">Profile</Link>
              <button onClick={logout} className="text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
          <ThemeSelector theme={theme} setTheme={setTheme} />
        </nav>
      </header>

      <main className="p-4 container-p">
        <Routes>
          <Route path="/" element={<Navigate to={token ? "/marketplace" : "/login"} />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/marketplace" element={token ? <Marketplace /> : <Navigate to="/login" />} />
          <Route path="/products/new" element={token ? <ProductForm /> : <Navigate to="/login" />} />
          <Route path="/orders" element={token ? <OrderTracking /> : <Navigate to="/login" />} />
          <Route path="/kyc" element={token ? <KYC /> : <Navigate to="/login" />} />
          <Route path="/admin" element={token ? <Admin /> : <Navigate to="/login" />} />
          <Route path="/ai" element={token ? <AIBot /> : <Navigate to="/login" />} />
          <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}