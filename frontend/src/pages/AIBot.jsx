import React, { useState } from "react";
import { api } from "../lib/api";

export default function AIBot() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!lat || !lon) {
      setError("Please enter latitude and longitude.");
      return;
    }

    try {
      const res = await api(
        "/ai/analyze",
        "POST",
        { lat: parseFloat(lat), lon: parseFloat(lon) },
        token
      );
      setResult(res);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLon(pos.coords.longitude.toFixed(6));
      },
      (err) => setError("GPS error: " + err.message)
    );
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">AI Crop Health Bot</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleAnalyze} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="border p-2 rounded w-1/2"
          />
          <input
            type="text"
            placeholder="Longitude"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="border p-2 rounded w-1/2"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUseGPS}
            className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700"
          >
            Use GPS
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          >
            Analyze Crop
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-700">
          <h2 className="font-bold mb-2">Analysis Result</h2>
          <p>
            <span className="font-semibold">Status:</span> {result.health_status}
          </p>
          <p>
            <span className="font-semibold">Confidence:</span>{" "}
            {Math.round(result.confidence * 100)}%
          </p>
          {result.satellite_url && (
            <img
              src={result.satellite_url}
              alt="Satellite crop"
              className="mt-3 rounded border"
            />
          )}
        </div>
      )}
    </div>
  );
}