const express = require("express");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const User = require("../models/User");

const router = express.Router();

// ✅ Middleware to check login + KYC
function authAndKYC(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }

  next();
}

// ✅ Public route → anyone can view products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Sell product → only KYC verified
router.post("/sell", authAndKYC, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isKYCVerified) {
      return res.status(403).json({ message: "KYC verification required to sell" });
    }

    const { name, description, price } = req.body;
    const product = new Product({
      name,
      description,
      price,
      seller: user._id,
    });

    await product.save();
    res.json({ message: "Product listed successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Buy product → only KYC verified
router.post("/buy/:id", authAndKYC, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isKYCVerified) {
      return res.status(403).json({ message: "KYC verification required to buy" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // TODO: Add escrow + payment logic
    res.json({ message: "Purchase initiated successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;