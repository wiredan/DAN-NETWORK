import { Router } from "itty-router";
import { handleAuth } from "./auth.js";
import { handleProducts } from "./products.js";
import { handleOrders } from "./orders.js";
import { handleKYC } from "./kyc.js";
import { handleAdmin } from "./admin.js";
import { handleAI } from "./ai.js";

const router = Router();

// Routes
router.all("/api/auth/*", handleAuth);
router.all("/api/products/*", handleProducts);
router.all("/api/orders/*", handleOrders);
router.all("/api/kyc/*", handleKYC);
router.all("/api/admin/*", handleAdmin);
router.all("/api/ai/*", handleAI);

// Health check
router.get("/", () => new Response("🌱 AgriNetwork Worker running!"));

// Default 404
router.all("*", () => new Response("Not found", { status: 404 }));

export default {
  fetch: (req, env, ctx) => router.handle(req, env, ctx),
};