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
app.post("/orders/:id/deliver", auth, (req, res) => {
  const order = orders.find((o) => o.id == req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const user = users.find((u) => u.id === req.user.id);
  if (!user || user.role !== "logistics") {
    return res.status(403).json({ error: "Only logistics can confirm delivery" });
  }

  if (order.status !== "shipped") {
    return res.status(400).json({ error: "Order must be shipped before delivery" });
  }

  order.status = "delivered";
  res.json({ message: "Delivery confirmed by logistics", order });
});
app.post("/admin/makeLogistics", auth, adminOnly, (req, res) => {
  const { userId } = req.body;
  const user = users.find((u) => u.id == userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.role = "logistics";
  res.json({ message: "User assigned as logistics", user });
});
// -------------------- MARKETPLACE --------------------
app.post("/products", auth, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user.kyc_verified) {
    return res.status(403).json({ error: "KYC required to list products" });
  }

  const { name, price, description } = req.body;
  if (!name || !price) return res.status(400).json({ error: "Name and price required" });

  const product = {
    id: products.length + 1,
    name,
    price,
    description,
    seller_id: user.id,
    status: "active"
  };
  products.push(product);
  res.json({ message: "Product listed", product });
});

app.get("/products", (req, res) => {
  res.json({ products: products.filter((p) => p.status === "active") });
});

// -------------------- ORDERS + ESCROW --------------------
app.post("/orders", auth, (req, res) => {
  const { productId } = req.body;
  const product = products.find((p) => p.id == productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const order = {
    id: orders.length + 1,
    product_id: productId,
    product_name: product.name,
    buyer_id: req.user.id,
    seller_id: product.seller_id,
    status: "paid", // simulate escrow funded
  };
  orders.push(order);
  res.json({ message: "Order created & escrow funded", order });
});

app.get("/orders", auth, (req, res) => {
  const myOrders = orders.filter(
    (o) => o.buyer_id === req.user.id || o.seller_id === req.user.id
  );
  res.json({ orders: myOrders });
});

app.post("/orders/:id/ship", auth, (req, res) => {
  const order = orders.find((o) => o.id == req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.seller_id !== req.user.id) return res.status(403).json({ error: "Only seller can ship" });

  order.status = "shipped";
  res.json({ message: "Shipment confirmed", order });
});

app.post("/orders/:id/confirm", auth, (req, res) => {
  const order = orders.find((o) => o.id == req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.buyer_id !== req.user.id) return res.status(403).json({ error: "Only buyer can confirm" });

  order.status = "completed"; // release escrow
  res.json({ message: "Order completed, funds released", order });
});

app.post("/orders/:id/dispute", auth, (req, res) => {
  const order = orders.find((o) => o.id == req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.buyer_id !== req.user.id) return res.status(403).json({ error: "Only buyer can dispute" });

  order.status = "disputed";
  res.json({ message: "Dispute opened", order });
});

// -------------------- ADMIN RESOLUTION --------------------
app.post("/admin/orders/:id/release", auth, adminOnly, (req, res) => {
  const order = orders.find((o) => o.id == req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.status = "completed";
  res.json({ message: "Escrow released by admin", order });
});

app.post("/admin/orders/:id/refund", auth, adminOnly, (req, res) => {
  const order = orders.find((o) => o.id == req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.status = "refunded";
  res.json({ message: "Refund issued by admin", order });
});
const orderRoutes = require("./routes/orders");
app.use("/api/orders", orderRoutes);
const notificationRoutes = require("./routes/notification");
app.use("/api/notifications", notificationRoutes);