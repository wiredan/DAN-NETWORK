const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");

// ✅ List a new product (KYC verified users only)
router.post("/list", async (req, res) => {
  try {
    const { userId, name, description, price } = req.body;

    if (!userId || !name || !price) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.isKYCVerified) {
      return res.status(403).json({ error: "KYC verification required." });
    }

    const product = new Product({
      name,
      description,
      price,
      seller: user._id,
    });

    await product.save();
    res.json({ message: "Product listed successfully!", product });
  } catch (err) {
    console.error("Error listing product:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// ✅ Get all products
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find().populate("seller", "email phone");
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// ✅ Buy a product (KYC verified users only)
router.post("/buy/:productId", async (req, res) => {
  try {
    const { userId } = req.body;
    const { productId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.isKYCVerified) {
      return res.status(403).json({ error: "KYC verification required." });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found." });

    // ⚡ Simulate escrow system here
    res.json({
      message: `✅ Purchase initiated for product: ${product.name}`,
      product,
    });
  } catch (err) {
    console.error("Error buying product:", err);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;