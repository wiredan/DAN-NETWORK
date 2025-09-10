const express = require("express");
const Product = require("../models/Product");
const User = require("../models/User");
const router = express.Router();

// Middleware to check KYC verification
const requireKYC = async (req, res, next) => {
  try {
    const user = await User.findById(req.body.userId); // assumes userId is sent in request
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.isKYCVerified) {
      return res.status(403).json({ error: "KYC verification required" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ List a new product (only KYC users)
router.post("/list", requireKYC, async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const product = new Product({
      name,
      description,
      price,
      seller: req.user._id,
    });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Error listing product" });
  }
});

// ✅ Get all available products
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find({ status: "available" }).populate("seller", "name email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Error fetching products" });
  }
});

// ✅ Buy a product (moves to escrow)
router.post("/buy/:id", requireKYC, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.status !== "available") return res.status(400).json({ error: "Not available" });

    product.status = "in_escrow";
    await product.save();

    res.json({ message: "Payment pending, escrow started", product });
  } catch (err) {
    res.status(500).json({ error: "Error buying product" });
  }
});

// ✅ Confirm delivery and release funds
router.post("/confirm/:id", requireKYC, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.status = "sold";
    await product.save();

    res.json({ message: "Order confirmed, funds released", product });
  } catch (err) {
    res.status(500).json({ error: "Error confirming order" });
  }
});

module.exports = router;