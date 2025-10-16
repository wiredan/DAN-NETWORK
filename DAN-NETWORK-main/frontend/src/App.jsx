import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/signup.jsx";

function App() {
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-dark text-light" : "bg-light text-dark"
      } transition-colors duration-300`}
    >
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-primary">DAN-NETWORK</h1>
        <button
          onClick={toggleTheme}
          className="px-3 py-1 bg-primary text-dark rounded-lg font-semibold hover:opacity-90"
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </header>

      <main className="p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/signup" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<div>404 - Page not found</div>} />
        </Routes>
      </main>

      <footer className="text-center py-4 border-t border-gray-700 mt-10">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} DAN-NETWORK. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;