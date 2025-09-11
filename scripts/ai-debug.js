const { execSync } = require("child_process");
const fetch = require("node-fetch");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function runCommand(cmd) {
  try {
    execSync(cmd, { stdio: "pipe" });
    return null;
  } catch (err) {
    return err.stdout?.toString() || err.message;
  }
}

(async () => {
  const lintErrors = runCommand("npm run lint");
  const testErrors = runCommand("npm test");

  const errors = [lintErrors, testErrors].filter(Boolean).join("\n");

  if (!errors) {
    console.log("✅ No errors found, skipping AI debug.");
    return;
  }

  console.log("⚠️ Errors found, sending to Gemini AI...");

  // Call Gemini AI for a direct fix
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
      GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Here are my code errors:\n${errors}\n\nPlease provide corrected code files with fixes applied. Reply in plain code only, do not explain.`,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  const suggestion = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!suggestion) {
    console.log("❌ No suggestion from AI.");
    return;
  }

  console.log("✅ AI Fix Applied:\n", suggestion);

  // Write fix into a file for record
  require("fs").writeFileSync("AI_FIX.patch", suggestion);

  // Apply patch if valid
  try {
    execSync("git apply AI_FIX.patch");
    execSync("git add .");
    execSync('git commit -m "🤖 AI auto-debug applied fix"');
    execSync("git push origin main");
    console.log("🚀 AI fix committed directly to main branch!");
  } catch (err) {
    console.error("❌ Failed to apply AI fix automatically:", err.message);
  }
})();