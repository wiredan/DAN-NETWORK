import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import KYCBanner from "./components/KYCBanner";
import Marketplace from "./pages/Marketplace";
import KYCUpload from "./components/KYCUpload";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar user={user} setUser={setUser} />
        <KYCBanner />
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/login" element={<Login setUser={setUser} setToken={setToken} />} />
          <Route path="/signup" element={<Signup setUser={setUser} setToken={setToken} />} />
          <Route path="/kyc" element={<KYCUpload />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;