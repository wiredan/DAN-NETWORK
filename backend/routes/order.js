const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const router = express.Router();

// Middleware to check KYC
const requireKYC = async (req, res, next) => {
  const user = await User.findById(req.body.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!user.isKYCVerified) return res.status(403).json({ error: "KYC required" });
  req.user = user;
  next();
};

// ✅ Buyer creates order
router.post("/create/:productId", requireKYC, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product || product.status !== "available") {
      return res.status(400).json({ error: "Product not available" });
    }

    const order = new Order({
      product: product._id,
      buyer: req.user._id,
      seller: product.seller,
      escrowAmount: product.price,
      status: "in_escrow",
    });

    product.status = "in_escrow";
    await product.save();
    await order.save();

    res.json({ message: "Order created, payment in escrow", order });
  } catch (err) {
    res.status(500).json({ error: "Error creating order" });
  }
});

// ✅ Seller marks order as shipped
router.post("/ship/:id", requireKYC, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only seller can mark shipped" });
    }

    order.status = "shipped";
    await order.save();

    res.json({ message: "Order shipped", order });
  } catch (err) {
    res.status(500).json({ error: "Error updating order" });
  }
});

// ✅ Buyer confirms delivery
router.post("/confirm/:id", requireKYC, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only buyer can confirm" });
    }

    order.status = "completed";
    await order.save();

    res.json({ message: "Delivery confirmed, funds released", order });
  } catch (err) {
    res.status(500).json({ error: "Error confirming delivery" });
  }
});

// ✅ Buyer opens dispute
router.post("/dispute/:id", requireKYC, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = "disputed";
    order.disputeReason = req.body.reason || "No reason provided";
    await order.save();

    res.json({ message: "Dispute opened", order });
  } catch (err) {
    res.status(500).json({ error: "Error opening dispute" });
  }
});

// ✅ Admin resolves dispute
router.post("/resolve/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Here you'd check admin authentication
    const { resolution } = req.body;
    if (resolution === "refund") {
      order.status = "refunded";
    } else {
      order.status = "completed";
    }
    order.resolution = resolution;

    await order.save();

    res.json({ message: `Dispute resolved: ${resolution}`, order });
  } catch (err) {
    res.status(500).json({ error: "Error resolving dispute" });
  }
});

module.exports = router;