import { Router } from "itty-router";
import { jsonResponse, requireAuth } from "./utils.js";

const r = Router();

/*
 Admin abilities:
 - Add/remove team members (role = "admin" or "support")
 - View all users/products/orders
 - Override disputes/refunds (already in orders.js but included here too)
 - Remove abusive users/products
*/

// 📌 Add team member
r.post("/api/admin/team", async (req, env) => {
  const admin = await requireAuth(req, env);
  if (!admin || admin.role !== "admin") return jsonResponse({ error: "Admin only" }, 403);

  const { userId, role } = await req.json();
  if (!userId || !["admin", "support"].includes(role)) {
    return jsonResponse({ error: "Valid userId and role required" }, 400);
  }

  await env.DB.prepare("UPDATE users SET role = ? WHERE id = ?").bind(role, userId).run();
  return jsonResponse({ success: true });
});

// 📌 Remove team member (revert to normal user)
r.post("/api/admin/team/remove", async (req, env) => {
  const admin = await requireAuth(req, env);
  if (!admin || admin.role !== "admin") return jsonResponse({ error: "Admin only" }, 403);

  const { userId } = await req.json();
  await env.DB.prepare("UPDATE users SET role = ? WHERE id = ?").bind("user", userId).run();
  return jsonResponse({ success: true });
});

// 📌 View all users
r.get("/api/admin/users", async (req, env) => {
  const admin = await requireAuth(req, env);
  if (!admin || admin.role !== "admin") return jsonResponse({ error: "Admin only" }, 403);

  const users = await env.DB.prepare("SELECT id, email, phone, role, kyc_verified, created_at FROM users").all();
  return jsonResponse(users.results || []);
});

// 📌 View all products
r.get("/api/admin/products", async (req, env) => {
  const admin = await requireAuth(req, env);
  if (!admin || admin.role !== "admin") return jsonResponse({ error: "Admin only" }, 403);

  const products = await env.DB.prepare("SELECT * FROM products").all();
  return jsonResponse(products.results || []);
});

// 📌 Remove product
r.delete("/api/admin/products/:id", async (req, env) => {
  const admin = await requireAuth(req, env);
  if (!admin || admin.role !== "admin") return jsonResponse({ error: "Admin only" }, 403);

  const { id } = req.params;
  await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
  return jsonResponse({ success: true });
});

// 📌 View all orders
r.get("/api/admin/orders", async (req, env) => {
  const admin = await requireAuth(req, env);
  if (!admin || admin.role !== "admin") return jsonResponse({ error: "Admin only" }, 403);

  const orders = await env.DB.prepare("SELECT * FROM orders").all();
  return jsonResponse(orders.results || []);
});

// 📌 Remove user
r.delete("/api/admin/users/:id", async (req, env) => {
  const admin = await requireAuth(req, env);
  if (!admin || admin.role !== "admin") return jsonResponse({ error: "Admin only" }, 403);

  const { id } = req.params;
  await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM products WHERE user_id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM orders WHERE buyer_id = ? OR seller_id = ?").bind(id, id).run();

  return jsonResponse({ success: true });
});

export const handleAdmin = r.handle;