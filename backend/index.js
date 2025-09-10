const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// mock DB in memory (replace with D1 or Mongo in prod)
let users = [];
let products = [];
let orders = [];

// 🔐 Middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET || "secret");
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

// -------------------- AUTH --------------------
app.post("/signup", (req, res) => {
  const { email, phone, password } = req.body;
  if (!email && !phone) return res.status(400).json({ error: "Email or phone required" });
  const id = users.length + 1;
  const user = { id, email, phone, password, role: "user", kyc_verified: false };
  users.push(user);
  res.json({ message: "Signup success", user });
});

app.post("/login", (req, res) => {
  const { email, phone, password } = req.body;
  const user = users.find(
    (u) =>
      ((email && u.email === email) || (phone && u.phone === phone)) &&
      u.password === password
  );
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1d" }
  );
  res.json({ token, role: user.role });
});

// -------------------- KYC --------------------
app.post("/kyc", auth, (req, res) => {
  const { document, country } = req.body;
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.kyc_document = document;
  user.kyc_country = country;
  user.kyc_status = "pending";

  res.json({ message: "KYC submitted", status: "pending" });
});

// -------------------- ADMIN --------------------
app.get("/admin/users", auth, adminOnly, (req, res) => {
  res.json({ users });
});

app.post("/admin/verifyKYC", auth, adminOnly, (req, res) => {
  const { userId } = req.body;
  const user = users.find((u) => u.id == userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.kyc_verified = true;
  user.kyc_status = "approved";
  res.json({ message: "KYC verified", user });
});

app.post("/admin/makeAdmin", auth, adminOnly, (req, res) => {
  const { userId } = req.body;
  const user = users.find((u) => u.id == userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.role = "admin";
  res.json({ message: "User promoted to admin", user });
});

app.post("/admin/removeUser", auth, adminOnly, (req, res) => {
  const { userId } = req.body;
  users = users.filter((u) => u.id != userId);
  res.json({ message: "User removed" });
});

// -------------------- AI BOT --------------------
app.post("/ai/analyze", auth, (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) return res.status(400).json({ error: "Coordinates required" });

  // Simulate satellite analysis
  const randomHealth = ["healthy", "stressed", "diseased"];
  const health_status = randomHealth[Math.floor(Math.random() * randomHealth.length)];

  res.json({
    health_status,
    confidence: Math.random(),
    satellite_url: `https://dummyimage.com/600x400/00aa00/ffffff&text=Crop+at+${lat},${lon}`
  });
});

// -------------------- START --------------------
app.get("/", (req, res) => {
  res.json({ message: "AgriNet backend running" });
});

app.listen(3000, () => console.log("Backend running on port 3000"));
app.post("/admin/makeLogistics", auth, adminOnly, (req, res) => {
  const { userId } = req.body;
  const user = users.find((u) => u.id == userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.role = "logistics";
  res.json({ message: "User assigned as logistics", user });
});