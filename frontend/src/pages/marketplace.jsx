import React, { useEffect, useState } from "react";
import axios from "axios";

const Marketplace = ({ token, user }) => {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/marketplace/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("Error loading products", err);
      }
    };
    fetchProducts();
  }, []);

  const handleBuy = async (productId) => {
    if (!user?.isKYCVerified) {
      setMessage("⚠️ You must complete KYC before buying.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/marketplace/buy`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Purchase successful! Escrow created.");
    } catch (err) {
      setMessage("❌ Error buying product: " + err.response?.data?.error || err.message);
    }
  };

  const handleSell = async () => {
    if (!user?.isKYCVerified) {
      setMessage("⚠️ You must complete KYC before selling.");
      return;
    }

    // Example navigation to product creation
    setMessage("Redirecting to product creation form...");
    // navigate("/sell");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Marketplace</h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border rounded-lg shadow p-4 bg-white dark:bg-gray-800"
          >
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-600">${product.price}</p>
            <button
              onClick={() => handleBuy(product._id)}
              disabled={!user?.isKYCVerified}
              className={`mt-3 w-full py-2 px-4 rounded ${
                user?.isKYCVerified
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
            >
              {user?.isKYCVerified ? "Buy" : "KYC Required"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={handleSell}
          disabled={!user?.isKYCVerified}
          className={`w-full md:w-1/3 py-2 px-4 rounded ${
            user?.isKYCVerified
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          {user?.isKYCVerified ? "Sell Product" : "KYC Required to Sell"}
        </button>
      </div>
    </div>
  );
};

export default Marketplace;