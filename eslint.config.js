import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist", "release", "node_modules"] },
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      "no-unused-vars": "off",
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["electron/**/*.cjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: js.configs.recommended.rules,
  },
];
