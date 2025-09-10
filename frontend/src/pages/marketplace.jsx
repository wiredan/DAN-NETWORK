import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api("/products");
        setProducts(res.products);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Marketplace</h1>
        <Link
          to="/products/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + List Product
        </Link>
      </div>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {products.length === 0 ? (
        <p>No products listed yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="border rounded p-4 bg-white dark:bg-gray-800 shadow">
              <h2 className="font-bold text-lg">{p.name}</h2>
              <p>{p.description}</p>
              <p className="text-green-600 font-semibold">
                {p.price} {p.currency}
              </p>
              <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                Buy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}