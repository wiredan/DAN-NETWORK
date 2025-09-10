import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Marketplace from "./pages/Marketplace";
import OrderTracking from "./pages/OrderTracking";
import KYC from "./pages/KYC";
import Admin from "./pages/Admin";
import AIBot from "./pages/AIBot";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Router>
      <div className={`${theme} min-h-screen bg-gray-100 dark:bg-gray-900`}>
        <Navbar theme={theme} setTheme={setTheme} />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<Marketplace />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/orders" element={<OrderTracking />} />
            <Route path="/kyc" element={<KYC />} />
            <Route path="/ai" element={<AIBot />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}