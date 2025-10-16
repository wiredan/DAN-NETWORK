import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./index.css";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  return (
    <Router>
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen bg-white dark:bg-[#0b0e11] text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <nav className="navbar">
            <Link to="/" className="font-bold text-lg">
              🌾 DAN Network
            </Link>
            <div className="flex gap-4 items-center">
              <Link to="/signup" className="btn btn-primary">Signup</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <button onClick={toggleTheme} className="theme-toggle">
                {darkMode ? "🌙" : "☀️"}
              </button>
            </div>
          </nav>

          <main className="container py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}