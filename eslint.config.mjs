// eslint.config.mjs
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";
import NoraJsxStandard from "./rules/jsxCheck/index.js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginImport from "eslint-plugin-import";

export default [
  // ----------------------------------------------------- MAIN LINTERS
  js.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  // ----------------------------------------------------- DEPENDENCIES AND IMPORT LINTER
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      "import/no-duplicates": "warn",
      "import/no-unresolved": "warn",
      "import/named": "warn",
      "import/default": "warn",
      "import/namespace": "warn",
      "import/no-absolute-path": "warn",
      "import/no-dynamic-require": "warn",
      "import/no-webpack-loader-syntax": "warn",
      "import/no-self-import": "warn",
      "import/no-cycle": "warn",
      "import/no-useless-path-segments": "warn",
      "import/no-deprecated": "warn",
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "tsconfig.json", // مسیر tsconfig.json شما
        },
      },
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
  // ----------------------------------------------------- NORA LINTER
  {
    plugins: {
      "@next/next": nextPlugin,
      NoraJsxStandard,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json",
      },
    },
    files: ["app/**/*.ts", "app/**/*.tsx"],
    rules: {
      ...nextPlugin.configs.recommended.rules,
      "NoraJsxStandard/button-rules": "warn",
      "NoraJsxStandard/link-rules": "warn",
      "NoraJsxStandard/component-rules": "warn",
    },
  },
];
