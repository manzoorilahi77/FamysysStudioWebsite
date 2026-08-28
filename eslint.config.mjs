import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default tseslint.config(
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "public/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
      },
      "boundaries/include": ["src/**/*.{ts,tsx}"],
      "boundaries/elements": [
        { type: "domain", pattern: "src/domain/*", mode: "folder" },
        { type: "application", pattern: "src/application/*", mode: "folder" },
        { type: "infrastructure", pattern: "src/infrastructure/*", mode: "folder" },
        { type: "presentation", pattern: "src/presentation/*", mode: "folder" },
        { type: "shared", pattern: "src/shared/*", mode: "folder" },
        { type: "app", pattern: "src/app/*", mode: "folder" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "domain", allow: ["domain"] },
            { from: "shared", allow: ["shared"] },
            { from: "application", allow: ["domain", "application", "shared"] },
            { from: "infrastructure", allow: ["domain", "infrastructure", "shared"] },
            {
              from: "presentation",
              allow: ["presentation", "application", "domain", "shared"],
            },
            {
              from: "app",
              allow: ["app", "presentation", "application", "infrastructure", "shared"],
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-dom", "next", "next/*"],
              message: "domain/ must be pure TypeScript — no React or Next imports.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "vitest.setup.ts", "vitest.config.ts"],
    rules: {
      "boundaries/element-types": "off",
    },
  },
);
