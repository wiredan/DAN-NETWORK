const { execSync } = require("child_process");
const fetch = require("node-fetch");
const { Octokit } = require("@octokit/rest");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Run tests & lint, capture errors
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

  // Call Gemini API
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
                text: `Here are the errors:\n${errors}\n\nPlease suggest code fixes in plain text.`,
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

  console.log("✅ AI Suggestion:\n", suggestion);

  // Create Pull Request with fix
  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

  const branchName = `ai-fix-${Date.now()}`;

  // Create new branch
  execSync(`git checkout -b ${branchName}`);
  execSync(`echo "${suggestion}" > AI_FIX.md`);
  execSync(`git add AI_FIX.md`);
  execSync(`git commit -m "AI suggested fix"`);
  execSync(`git push origin ${branchName}`);

  // Create PR
  await octokit.pulls.create({
    owner,
    repo,
    title: "AI Suggested Fix",
    head: branchName,
    base: "main",
    body: suggestion,
  });

  console.log("🚀 PR created with AI fix!");
})();