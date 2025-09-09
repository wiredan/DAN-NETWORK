// 📌 JSON response helper
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// 📌 Password hashing (SHA-256 with salt)
export async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password + "my_salt"); // 🔐 replace with better salt strategy
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

// 📌 Verify password
export async function verifyPassword(password, hash) {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

// 📌 Generate session token
export async function generateToken(userId, env) {
  const token = crypto.randomUUID();
  const user = await env.DB.prepare("SELECT id, email, phone, role, kyc_verified FROM users WHERE id = ?")
    .bind(userId)
    .first();

  if (user) {
    await env.SESSIONS.put(token, JSON.stringify(user), { expirationTtl: 60 * 60 * 24 * 7 }); // 7 days
  }
  return token;
}

// 📌 Require authentication
export async function requireAuth(req, env) {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token) return null;

  const session = await env.SESSIONS.get(token);
  if (!session) return null;

  return JSON.parse