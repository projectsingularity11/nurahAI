const { defineConfig } = require("eslint/config");
const expo = require("eslint-config-expo/flat");
module.exports = defineConfig([
  expo,
  {
    ignores: [
      "dist/**",
      ".expo/**",
      "coverage/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  {
    files: ["scripts/*.cjs"],
    languageOptions: { globals: { __dirname: "readonly" } },
  },
]);
