import React, { useState } from "react";
import { api } from "../lib/api";

export default function KYC() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      // Cloudflare Workers currently best handle JSON, so for real deployment
      // you’d route this through an Upload service (R2, KV, or external S3).
      // For now we simulate with base64.
      const base64 = await fileToBase64(file);

      await api("/kyc", "POST", { document: base64, country: "GLOBAL" }, token);
      setStatus("KYC submitted! Awaiting review.");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">KYC Verification</h1>
      {status && <p className="text-green-600 mb-2">{status}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 rounded bg-gray-50 dark:bg-gray-700"
        />
        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Submit KYC
        </button>
      </form>
    </div>
  );
}