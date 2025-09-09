import { Router } from "itty-router";
import { jsonResponse, requireAuth } from "./utils.js";

const r = Router();

// 📌 List all products
r.get("/api/products", async (req, env) => {
  const products = await env.DB.prepare(
    `SELECT p.*, u.email, u.phone 
     FROM products p 
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC`
  ).all();

  return jsonResponse(products.results || []);
});

// 📌 Add new product (only for KYC verified + subscribed users)
r.post("/api/products", async (req, env) => {
  const user = await requireAuth(req, env);
  if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

  const { title, description, price, currency } = await req.json();
  if (!title || !price || !currency) {
    return jsonResponse({ error: "Title, price, and currency required" }, 400);
  }

  // Check KYC
  const kyc = await env.DB.prepare("SELECT status FROM kyc WHERE user_id = ?")
    .bind(user.id)
    .first();
  if (!kyc || kyc.status !== "verified") {
    return jsonResponse({ error: "KYC verification required" }, 403);
  }

  // Check subscription
  const sub = await env.DB.prepare("SELECT active FROM subscriptions WHERE user_id = ?")
    .bind(user.id)
    .first();
  if (!sub || sub.active !== 1) {
    return jsonResponse({ error: "Active subscription required" }, 403);
  }

  // Insert product
  await env.DB.prepare(
    "INSERT INTO products (user_id, title, description, price, currency) VALUES (?, ?, ?, ?, ?)"
  ).bind(user.id, title, description || "", price, currency).run();

  return jsonResponse({ success: true });
});

// 📌 Get a single product
r.get("/api/products/:id", async (req, env) => {
  const { id } = req.params;
  const product = await env.DB.prepare(
    `SELECT p.*, u.email, u.phone 
     FROM products p 
     JOIN users u ON p.user_id = u.id
     WHERE p.id = ?`
  ).bind(id).first();

  if (!product) return jsonResponse({ error: "Product not found" }, 404);

  return jsonResponse(product);
});

// 📌 Delete a product (only owner or admin)
r.delete("/api/products/:id", async (req, env) => {
  const user = await requireAuth(req, env);
  if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

  const { id } = req.params;
  const product = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  if (!product) return jsonResponse({ error: "Not found" }, 404);

  if (product.user_id !== user.id && user.role !== "admin") {
    return jsonResponse({ error: "Not allowed" }, 403);
  }

  await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();

  return jsonResponse({ success: true });
});

export const handleProducts = r.handle;