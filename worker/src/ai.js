import { Router } from "itty-router";
import { jsonResponse } from "./utils.js";

const r = Router();

// 📌 Fetch satellite image (Sentinel Hub or fallback)
r.get("/api/ai/fetchSatellite", async (req, env) => {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat");
  const lng = url.searchParams.get("lng");

  if (!lat || !lng) {
    return jsonResponse({ error: "lat and lng required" }, 400);
  }

  // If Sentinel credentials are missing, return fallback
  if (!env.SENTINEL_CLIENT_ID || !env.SENTINEL_CLIENT_SECRET) {
    return jsonResponse({
      image: "data:image/svg+xml;base64," + btoa(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
        <rect width='100%' height='100%' fill='lightgreen'/>
        <text x='50%' y='50%' font-size='20' text-anchor='middle' fill='black'>
          Satellite preview unavailable
        </text>
      </svg>`)
    });
  }

  try {
    // Get access token from Sentinel Hub
    const tokenResp = await fetch("https://services.sentinel-hub.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${env.SENTINEL_CLIENT_ID}&client_secret=${env.SENTINEL_CLIENT_SECRET}`
    });

    const tokenData = await tokenResp.json();
    const accessToken = tokenData.access_token;

    // Example Sentinel Hub Process API request
    const requestBody = {
      input: {
        bounds: { bbox: [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01] },
        data: [{ type: "sentinel-2-l2a", dataFilter: { mosaickingOrder: "mostRecent" } }]
      },
      output: { width: 400, height: 300, responses: [{ identifier: "default", format: { type: "image/png" } }] },
      evalscript: `//VERSION=3
        function setup() { return { input: ["B04", "B03", "B02"], output: { bands: 3 } }; }
        function evaluatePixel(sample) { return [sample.B04, sample.B03, sample.B02]; }`
    };

    const imgResp = await fetch("https://services.sentinel-hub.com/api/v1/process", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const imgArrayBuffer = await imgResp.arrayBuffer();
    const imgBase64 = btoa(String.fromCharCode(...new Uint8Array(imgArrayBuffer)));

    return jsonResponse({ image: `data:image/png;base64,${imgBase64}` });
  } catch (err) {
    return jsonResponse({ error: "Satellite fetch failed", details: err.message }, 500);
  }
});

// 📌 Diagnose crop health (stubbed for now)
r.get("/api/ai/diagnose", async (req) => {
  return jsonResponse({
    health: "good",
    diseaseRisk: "low",
    recommendation: "No action needed"
  });
});

export const handleAI = r.handle;