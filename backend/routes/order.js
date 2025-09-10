const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const User = require("../models/User");

// ✅ Buyer initiates purchase → create transaction (escrow)
router.post("/create", async (req, res) => {
  try {
    const { buyerId, productId } = req.body;

    const buyer = await User.findById(buyerId);
    if (!buyer) return res.status(404).json({ error: "Buyer not found" });
    if (!buyer.isKYCVerified) {
      return res.status(403).json({ error: "KYC verification required" });
    }

    const product = await Product.findById(productId).populate("seller");
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.status !== "available") {
      return res.status(400).json({ error: "Product is not available" });
    }

    // Create transaction
    const transaction = new Transaction({
      buyer: buyer._id,
      seller: product.seller._id,
      product: product._id,
      amount: product.price,
      status: "escrow", // assume buyer paid → held in escrow
    });

    await transaction.save();

    // Mark product as reserved
    product.status = "sold";
    await product.save();

    res.json({ message: "Transaction created in escrow", transaction });
  } catch (err) {
    console.error("Error creating transaction:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Seller confirms shipment
router.post("/:id/ship", async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id).populate("seller");

    if (!transaction) return res.status(404).json({ error: "Transaction not found" });
    if (transaction.status !== "escrow") {
      return res.status(400).json({ error: "Transaction not in escrow" });
    }

    transaction.status = "shipped";
    await transaction.save();

    res.json({ message: "Seller confirmed shipment", transaction });
  } catch (err) {
    console.error("Error updating shipment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Buyer confirms delivery → release funds
router.post("/:id/confirm", async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id).populate("buyer");

    if (!transaction) return res.status(404).json({ error: "Transaction not found" });
    if (transaction.status !== "shipped") {
      return res.status(400).json({ error: "Transaction not shipped yet" });
    }

    transaction.status = "completed";
    await transaction.save();

    res.json({ message: "Buyer confirmed delivery, funds released", transaction });
  } catch (err) {
    console.error("Error confirming delivery:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Buyer opens dispute
router.post("/:id/dispute", async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    transaction.status = "disputed";
    await transaction.save();

    res.json({ message: "Dispute opened", transaction });
  } catch (err) {
    console.error("Error opening dispute:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Admin override → release or refund
router.post("/:id/admin-action", async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminId } = req.body; // action = "release" | "refund"

    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    if (action === "release") {
      transaction.status = "completed";
    } else if (action === "refund") {
      transaction.status = "refunded";
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    transaction.escrowReleaseApprovedBy = adminId;
    await transaction.save();

    res.json({ message: `Admin action executed: ${action}`, transaction });
  } catch (err) {
    console.error("Error in admin action:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;