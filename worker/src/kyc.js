import { Router } from "itty-router";
import { jsonResponse, requireAuth } from "./utils.js";

const r = Router();

/*
 KYC Flow:
 1. User submits ID document (URL or upload reference).
 2. Status starts as "pending".
 3. Admin approves → status = "verified", subscription auto-activated.
 4. If rejected → status = "rejected".
*/

// 📌 Submit KYC
r.post("/api/kyc", async (req, env) => {
  const user = await requireAuth(req, env);
  if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

  const { documentUrl } = await req.json();
  if (!documentUrl) return jsonResponse({ error: "Document URL required" }, 400);

  // Insert or update KYC request
  const existing = await env.DB.prepare("SELECT * FROM kyc WHERE user_id = ?")
    .bind(user.id)
    .first();

  if (existing) {
    await env.DB.prepare("UPDATE kyc SET status = ?, document_url = ? WHERE user_id = ?")
      .bind("pending", documentUrl, user.id)
      .run();
  } else {
    await env.DB.prepare("INSERT INTO kyc (user_id, status, document_url) VALUES (?, ?, ?)")
      .bind(user.id, "pending", documentUrl)
      .run();
  }

  return jsonResponse({ success: true, status: "pending" });
});

// 📌 Check KYC status
r.get("/api/kyc/status", async (req, env) => {
  const user = await requireAuth(req, env);
  if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

  const record = await env.DB.prepare("SELECT status FROM kyc WHERE user_id = ?")
    .bind(user.id)
    .first();

  return jsonResponse({ status: record ? record.status : "not_submitted" });
});

// 📌 Admin verifies/rejects KYC
r.post("/api/kyc/:id/review", async (req, env) => {
  const admin = await requireAuth(req, env);
  if (!admin || admin.role !== "admin") return jsonResponse({ error: "Admin only" }, 403);

  const { id } = req.params;
  const { action } = await req.json(); // "verify" or "reject"

  const kyc = await env.DB.prepare("SELECT * FROM kyc WHERE id = ?").bind(id).first();
  if (!kyc) return jsonResponse({ error: "KYC record not found" }, 404);

  if (action === "verify") {
    await env.DB.prepare("UPDATE kyc SET status = ? WHERE id = ?").bind("verified", id).run();
    await env.DB.prepare("UPDATE users SET kyc_verified = 1 WHERE id = ?").bind(kyc.user_id).run();
    await env.DB.prepare("UPDATE subscriptions SET active = 1 WHERE user_id = ?").bind(kyc.user_id).run();
  } else if (action === "reject") {
    await env.DB.prepare("UPDATE kyc SET status = ? WHERE id = ?").bind("rejected", id).run();
  } else {
    return jsonResponse({ error: "Invalid action" }, 400);
  }

  return jsonResponse({ success: true, status: action });
});

export const handleKYC = r.handle;