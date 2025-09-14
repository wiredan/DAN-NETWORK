#!/bin/bash

echo "🚀 Setting up Husky, Prettier, ESLint, and lint-staged..."

# 1. Install dependencies
npm install --save-dev husky lint-staged prettier eslint eslint-plugin-react eslint-config-prettier eslint-plugin-prettier

# 2. Enable Husky
npx husky install

# 3. Add pre-commit hook (runs prettier + eslint before every commit)
npx husky add .husky/pre-commit "npx lint-staged"

# 4. Add lint-staged config to package.json
npx json -I -f package.json -e '
  this["lint-staged"] = {
    "*.{js,jsx,json,css,md}": [
      "prettier --write",
      "eslint --fix"
    ]
  }'

# 5. Create ESLint config
cat > .eslintrc.json <<EOL
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "prettier"
  ],
  "parserOptions": {
    "ecmaFeatures": { "jsx": true },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["react", "prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
EOL

# 6. Create Prettier config
cat > .prettierrc.json <<EOL
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
EOL

echo "✅ Setup complete! Prettier + ESLint configs are ready, Husky hooks installed."