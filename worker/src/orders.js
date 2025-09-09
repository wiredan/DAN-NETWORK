import { Router } from "itty-router";
import { jsonResponse, requireAuth } from "./utils.js";

const r = Router();

/*
 Order flow:
 1. Buyer places order → status = "payment_pending"
 2. Buyer pays (escrow holds) → status = "paid"
 3. Seller ships → status = "shipped"
 4. Buyer confirms received → status = "completed" (funds released)
 5. Buyer disputes → status = "disputed"
 6. Admin override → status = "refunded" or "completed"
*/

// 📌 Place order
r.post("/api/orders", async (req, env) => {
  const user = await requireAuth(req, env);
  if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

  const { productId } = await req.json();
  if (!productId) return jsonResponse({ error: "Product ID required" }, 400);

  const product = await env.DB.prepare("SELECT * FROM products WHERE id = ?")
    .bind(productId)
    .first();
  if (!product) return jsonResponse({ error: "Product not found" }, 404);

  await env.DB.prepare(
    "INSERT INTO orders (buyer_id, seller_id, product_id, status) VALUES (?, ?, ?, ?)"
  )
    .bind(user.id, product.user_id, product.id, "payment_pending")
    .run();

  return jsonResponse({ success: true, status: "payment_pending" });
});

// 📌 Simulate payment (escrow hold)
r.post("/api/orders/:id/pay", async (req, env) => {
  const user = await requireAuth(req, env);
  if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

  const { id } = req.params;
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first();
  if (!order || order.buyer_id !== user.id) return jsonResponse({ error: "Not allowed" }, 403);

  if (order.status !== "payment_pending")
    return jsonResponse({ error