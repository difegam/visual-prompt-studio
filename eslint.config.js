import js from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".astro/**",
      ".json/**",
      ".agents/**",
      ".superpowers/**",
    ],
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["scripts/**/*.{js,mjs,cjs}", "astro.config.mjs"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ["**/*.{ts,tsx,astro}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["src/lib/**/*.astro"],
    rules: {
      "astro/no-exports-from-components": "off",
    },
  },
];
