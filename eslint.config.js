const eslintPluginPlaywright = require("eslint-plugin-playwright");
const eslintPluginTypescript = require("@typescript-eslint/eslint-plugin");
const parserTypescript = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: parserTypescript,
      ecmaVersion: 2020,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": eslintPluginTypescript,
      playwright: eslintPluginPlaywright,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "no-console": "warn",
      "playwright/no-page-pause": "off",
    },
    ignores: ["node_modules/**/*", "README.md"],
  },
];
