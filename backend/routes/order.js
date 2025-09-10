const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const User = require("../models/User");

// ✅ Create a new transaction (buyer initiates purchase)
router.post("/create", async (req, res) => {
  try {
    const { buyerId, productId } = req.body;

    const product = await Product.findById(productId).populate("seller");
    if (!product) return res.status(404).json({ error: "Product not found" });

    const transaction = new Transaction({
      buyer: buyerId,
      seller: product.seller._id,
      product: product._id,
      amount: product.price,
      status: "pending",
    });

    await transaction.save();
    res.json({ message: "Transaction created, waiting for payment", transaction });
  } catch (err) {
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

// ✅ Buyer confirms payment → funds in escrow
router.post("/:id/pay", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    transaction.status = "escrow";
    await transaction.save();

    res.json({ message: "Payment confirmed, funds in escrow", transaction });
  } catch (err) {
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

// ✅ Seller ships product
router.post("/:id/ship", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    transaction.status = "shipped";
    await transaction.save();

    res.json({ message: "Seller confirmed shipment", transaction });
  } catch (err) {
    res.status(500).json({ error: "Failed to confirm shipment" });
  }
});

// ✅ Buyer confirms delivery
router.post("/:id/deliver", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    transaction.status = "delivered";
    await transaction.save();

    res.json({ message: "Buyer confirmed delivery", transaction });
  } catch (err) {
    res.status(500).json({ error: "Failed to confirm delivery" });
  }
});

// ✅ Buyer opens dispute
router.post("/:id/dispute", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    transaction.status = "disputed";
    await transaction.save();

    res.json({ message: "Dispute opened", transaction });
  } catch (err) {
    res.status(500).json({ error: "Failed to open dispute" });
  }
});

// ✅ Admin resolves dispute: release or refund
router.post("/:id/resolve", async (req, res) => {
  try {
    const { action, adminId } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });

    if (action === "release") {
      transaction.status = "completed";
      transaction.escrowReleaseApprovedBy = adminId;
    } else if (action === "refund") {
      transaction.status = "refunded";
      transaction.escrowReleaseApprovedBy = adminId;
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    await transaction.save();
    res.json({ message: "Admin resolved dispute", transaction });
  } catch (err) {
    res.status(500).json({ error: "Failed to resolve dispute" });
  }
});

// ✅ Fetch all transactions (for dashboard/tracking)
router.get("/all", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("buyer", "email")
      .populate("seller", "email")
      .populate("product", "name price");

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

module.exports = router;