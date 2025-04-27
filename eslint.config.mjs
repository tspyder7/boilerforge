import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.node } },
  { rules: { "@typescript-eslint/no-empty-object-type": "off", "@typescript-eslint/no-unused-expressions": "off" } },
  { ignores: [".node_modules/*", 'dist/*'] },
  tseslint.configs.recommended,
]);
