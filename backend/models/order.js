const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    logistics: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional assigned courier
    status: {
      type: String,
      enum: [
        "pending_payment",
        "in_escrow",
        "shipped",
        "delivered",
        "completed",
        "disputed",
        "refunded"
      ],
      default: "pending_payment",
    },
    escrowAmount: { type: Number, required: true },
    disputeReason: { type: String },
    resolution: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);