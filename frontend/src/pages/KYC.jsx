import React, { useState } from "react";
import axios from "axios";

const KYCUpload = ({ token, onVerified }) => {
  const [idDoc, setIdDoc] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idDoc || !selfie) {
      setMessage("Please upload both ID document and selfie.");
      return;
    }

    const formData = new FormData();
    formData.append("idDoc", idDoc);
    formData.append("selfie", selfie);

    try {
      setLoading(true);
      setMessage("Verifying your identity...");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/kyc/verify`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setMessage("✅ KYC verified successfully!");
        onVerified && onVerified(true);
      } else {
        setMessage("❌ Verification failed. Try again.");
      }
    } catch (err) {
      setMessage("⚠️ Error verifying KYC: " + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">KYC Verification</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Upload ID Document</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setIdDoc(e.target.files[0])}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Upload Selfie</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelfie(e.target.files[0])}
            className="w-full border rounded p-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Submit for Verification"}
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
};

export default KYCUpload;