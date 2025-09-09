import { Router } from "itty-router";
import { jsonResponse, hashPassword, verifyPassword, generateToken } from "./utils.js";

const r = Router();

// 📌 Signup (email or phone)
r.post("/api/auth/signup", async (req, env) => {
  const { email, phone, password } = await req.json();

  if (!password || (!email && !phone)) {
    return jsonResponse({ error: "Email or phone and password required" }, 400);
  }

  const hashed = await hashPassword(password);

  try {
    const result = await env.DB.prepare(
      "INSERT INTO users (email, phone, password_hash) VALUES (?, ?, ?)"
    ).bind(email || null, phone || null, hashed).run();

    const userId = result.lastInsertRowid;

    // Auto create subscription
    await env.DB.prepare(
      "INSERT INTO subscriptions (user_id, active) VALUES (?, ?)"
    ).bind(userId, 0).run();

    return jsonResponse({ success: true, userId });
  } catch (err) {
    return jsonResponse({ error: "User already exists or DB error", details: err.message }, 400);
  }
});

// 📌 Login
r.post("/api/auth/login", async (req, env) => {
  const { email, phone, password } = await req.json();

  if ((!email && !phone) || !password) {
    return jsonResponse({ error: "Email/phone and password required" }, 400);
  }

  let query = "SELECT * FROM users WHERE ";
  query += email ? "email = ?" : "phone = ?";
  const value = email || phone;

  const user = await env.DB.prepare(query).bind(value).first();
  if (!user) return jsonResponse({ error: "User not found" }, 404);

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return jsonResponse({ error: "Invalid password" }, 403);

  const token = await generateToken(user.id, env);

  return jsonResponse({ success: true, token, userId: user.id, role: user.role });
});

// 📌 Verify token (session check)
r.get("/api/auth/verify", async (req, env) => {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token) return jsonResponse({ valid: false }, 401);

  const session = await env.SESSIONS.get(token);
  if (!session) return jsonResponse({ valid: false }, 401);

  return jsonResponse({ valid: true, user: JSON.parse(session) });
});

export const handleAuth = r.handle;