module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  plugins: ["react", "react-hooks"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    // 🧹 General best practices
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "off",

    // 💡 React-specific rules
    "react/react-in-jsx-scope": "off", // not needed for React 17+
    "react/prop-types": "off", // optional, disable if using TypeScript or prop validation elsewhere

    // ⚙️ Hooks rules
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
};