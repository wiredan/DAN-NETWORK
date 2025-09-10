const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["available", "sold", "in_escrow"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);