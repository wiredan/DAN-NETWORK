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
import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
yes