import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/marketplace"; // update when deployed

const Marketplace = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
  });

  // ✅ Fetch products on load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/all`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // ✅ List new product (KYC verified users only)
  const handleListProduct = async () => {
    if (!user?.isKYCVerified) {
      alert("You must complete KYC verification to list products.");
      return;
    }

    try {
      await axios.post(`${API_URL}/list`, {
        ...newProduct,
        userId: user._id,
      });
      alert("✅ Product listed successfully!");
      setNewProduct({ name: "", description: "", price: "" });
      fetchProducts();
    } catch (err) {
      alert("Error: " + err.response?.data?.error || "Failed to list product.");
    }
  };

  // ✅ Buy product (KYC verified users only)
  const handleBuyProduct = async (productId) => {
    if (!user?.isKYCVerified) {
      alert("You must complete KYC verification to buy products.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/buy/${productId}`, {
        userId: user._id,
      });
      alert(res.data.message);
      fetchProducts();
    } catch (err) {
      alert("Error: " + err.response?.data?.error || "Failed to buy product.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🌾 Marketplace</h2>

      {/* ✅ Product Listing Form (only for verified users) */}
      {user?.isKYCVerified ? (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-3">📦 List a New Product</h3>
          <input
            type="text"
            placeholder="Product Name"
            className="border p-2 mr-2 mb-2"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-2 mr-2 mb-2"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Price"
            className="border p-2 mr-2 mb-2"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
          />
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleListProduct}
          >
            + List Product
          </button>
        </div>
      ) : (
        <p className="text-red-500 mb-6">
          ⚠️ Only KYC-verified users can list products.
        </p>
      )}

      {/* ✅ Display Available Products */}
      <h3 className="font-semibold mb-3">🛒 Available Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.length > 0 ? (
          products.map((p) => (
            <div key={p._id} className="border p-4 rounded shadow bg-white">
              <h4 className="font-bold">{p.name}</h4>
              <p>{p.description}</p>
              <p className="text-green-700 font-semibold">${p.price}</p>
              <button
                className={`px-3 py-1 rounded mt-2 ${
                  user?.isKYCVerified
                    ? "bg-blue-600 text-white"
                    : "bg-gray-400 text-gray-800 cursor-not-allowed"
                }`}
                onClick={() => handleBuyProduct(p._id)}
                disabled={!user?.isKYCVerified}
              >
                {user?.isKYCVerified ? "Buy" : "KYC Required"}
              </button>
            </div>
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div>
    </div>
  );
};

export default Marketplace;