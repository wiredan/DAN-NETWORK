import express from "express";
import multer from "multer";
import fs from "fs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ Auto KYC verification
router.post("/verify", upload.fields([{ name: "idDoc" }, { name: "selfie" }]), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const idDocPath = req.files["idDoc"]?.[0]?.path;
    const selfiePath = req.files["selfie"]?.[0]?.path;
    if (!idDocPath || !selfiePath) {
      return res.status(400).json({ error: "Missing ID or selfie" });
    }

    // Convert files to Base64
    const idDocBase64 = fs.readFileSync(idDocPath, { encoding: "base64" });
    const selfieBase64 = fs.readFileSync(selfiePath, { encoding: "base64" });

    // 🔗 Send to Gemini API (fake example, adjust endpoint)
    const aiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=" + process.env.GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Verify if ID document is valid and matches the selfie. Respond ONLY with 'APPROVED' or 'REJECTED'." },
              { inline_data: { mime_type: "image/jpeg", data: idDocBase64 } },
              { inline_data: { mime_type: "image/jpeg", data: selfieBase64 } }
            ]
          }
        ]
      })
    });

    const result = await aiResponse.json();
    const decision = result?.candidates?.[0]?.content?.parts?.[0]?.text || "REJECTED";

    if (decision.includes("APPROVED")) {
      user.isKYCVerified = true;
      user.kycData = { provider: "Gemini", verifiedAt: new Date() };
      await user.save();
      res.json({ success: true, message: "KYC verified successfully" });
    } else {
      res.status(400).json({ success: false, error: "KYC verification failed" });
    }

    // Cleanup
    fs.unlinkSync(idDocPath);
    fs.unlinkSync(selfiePath);
  } catch (err) {
    console.error("KYC Error:", err);
    res.status(500).json({ error: "KYC verification failed", details: err.message });
  }
});

export default router;