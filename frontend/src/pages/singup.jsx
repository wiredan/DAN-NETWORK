import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function Signup() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const body = {};
      if (emailOrPhone.includes("@")) body.email = emailOrPhone;
      else body.phone = emailOrPhone;
      body.password = password;

      const res = await api("/auth/signup", "POST", body);
      setSuccess("Signup successful! Please log in.");
      setError("");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
      setSuccess("");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Signup</h1>
      {success && <p className="text-green-600 mb-2">{success}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSignup} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Email or Phone"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Signup
        </button>
      </form>
    </div>
  );
}