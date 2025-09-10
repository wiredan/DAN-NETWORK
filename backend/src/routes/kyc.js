// backend/routes/kyc.js
const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Gemini AI API call helper
async function verifyWithGemini(idBuffer, selfieBuffer) {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Verify if this government-issued ID belongs to the same person as the selfie. Answer only with 'APPROVED' or 'REJECTED'."
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: idBuffer.toString("base64"),
                  },
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: selfieBuffer.toString("base64"),
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const aiDecision = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return aiDecision === "APPROVED";
  } catch (err) {
    console.error("Gemini API error:", err);
    return false;
  }
}

// ✅ POST /api/kyc/verify
router.post(
  "/verify",
  upload.fields([{ name: "id" }, { name: "selfie" }]),
  async (req, res) => {
    try {
      // 🔑 Get user from JWT
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token provided" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // 🔑 Get uploaded images
      const idBuffer = req.files["id"]?.[0]?.buffer;
      const selfieBuffer = req.files["selfie"]?.[0]?.buffer;

      if (!idBuffer || !selfieBuffer) {
        return res.status(400).json({ message: "ID and Selfie are required" });
      }

      // 🔑 Verify with Gemini AI
      const approved = await verifyWithGemini(idBuffer, selfieBuffer);

      if (!approved) {
        return res.status(403).json({ message: "KYC verification failed" });
      }

      // ✅ Update user
      user.isKYCVerified = true;
      user.kycData = { approvedAt: new Date(), provider: "Gemini AI" };
      await user.save();

      res.json({ message: "KYC verified successfully", user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;