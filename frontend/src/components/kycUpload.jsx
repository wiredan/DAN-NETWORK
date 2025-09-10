import React from "react";
import { useNavigate } from "react-router-dom";

const KYCBanner = ({ user }) => {
  const navigate = useNavigate();

  if (!user || user.isKYCVerified) return null;

  return (
    <div className="bg-yellow-200 text-yellow-900 p-3 text-center">
      ⚠️ Your account is not KYC verified. 
      <button
        onClick={() => navigate("/kyc")}
        className="ml-3 px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-600"
      >
        Complete KYC Now
      </button>
    </div>
  );
};

export default KYCBanner;