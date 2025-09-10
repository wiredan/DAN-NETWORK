const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true }, // optional phone login
    password: { type: String, required: true },

    // ✅ KYC verification
    isKYCVerified: { type: Boolean, default: false },
    kycData: {
      documentType: { type: String },
      documentNumber: { type: String },
      country: { type: String },
      verifiedAt: { type: Date },
      aiConfidence: { type: Number }, // AI confidence score for face match
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);