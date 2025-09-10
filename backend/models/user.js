const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  isKYCVerified: { type: Boolean, default: false },
  kycData: {
    name: String,
    dob: String,
    nationality: String,
    verifiedAt: Date,
  },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  subAccount: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);