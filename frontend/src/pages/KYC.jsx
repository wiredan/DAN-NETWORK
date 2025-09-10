import React, { useState } from "react";

function KYC() {
  const [idFile, setIdFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idFile || !selfieFile) {
      setStatus("⚠️ Please upload both ID and Selfie");
      return;
    }

    const formData = new FormData();
    formData.append("id", idFile);
    formData.append("selfie", selfieFile);

    try {
      const res = await fetch("/api/kyc/verify", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"), // JWT token
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("✅ KYC Verified successfully! You can now buy and sell.");
        // Optionally refresh user state in localStorage or context
        localStorage.setItem("isKYCVerified", "true");
      } else {
        setStatus("❌ Verification failed: " + data.message);
      }
    } catch (err) {
      console.error("KYC error:", err);
      setStatus("⚠️ Server error. Try again later.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">KYC Verification</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Upload ID Document</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setIdFile(e.target.files[0])}
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1">Upload Selfie</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelfieFile(e.target.files[0])}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          Submit for Verification
        </button>
      </form>

      {status && (
        <p className="mt-4 text-center font-medium">
          {status}
        </p>
      )}
    </div>
  );
}

export default KYC;