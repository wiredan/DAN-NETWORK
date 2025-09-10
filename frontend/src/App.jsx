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
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import KYCBanner from "./components/KYCBanner";

import Marketplace from "./pages/Marketplace";
import KYCUpload from "./components/KYCUpload";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// ... other imports

function App() {
  const [user, setUser] = useState(null); // load from context or auth state
  const [token, setToken] = useState(null);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} onLogout={() => setUser(null)} />
        <KYCBanner user={user} />

        <main className="flex-grow">
          <Routes>
            <Route path="/marketplace" element={<Marketplace token={token} user={user} />} />
            <Route path="/kyc" element={<KYCUpload token={token} onVerified={() => setUser({ ...user, isKYCVerified: true })} />} />
            <Route path="/login" element={<Login setUser={setUser} setToken={setToken} />} />
            <Route path="/signup" element={<Signup setUser={setUser} setToken={setToken} />} />
            {/* add other routes */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;