
import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "legacy/**", "coverage/**", ".tools/**"]
  },
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { "varsIgnorePattern": "^[A-Z]" }],
      "no-undef": "warn"
    }
  },
  { files: ["src/tests/**/*.{js,jsx}"], languageOptions: { globals: { ...globals.jasmine, require: "readonly", expectAsync: "readonly" } } }
];
