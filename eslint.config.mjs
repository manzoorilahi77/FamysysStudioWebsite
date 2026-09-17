import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default tseslint.config(
  {
    ignores: [".next/**", "out/**", "node_modules/**", "coverage/**", "public/**", "next-env.d.ts"],
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
    files: ["src/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-dom", "next", "next/*"],
              message: "application/ must depend on domain/ only — no React or Next imports.",
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
  {
    // src/presentation/lib/viewModels.ts must stay a pure mapping layer (field
    // renames and .value extraction only) — no branching, which is where real
    // display logic would otherwise creep in. See the file's own header comment.
    files: ["src/presentation/lib/viewModels.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "IfStatement",
          message:
            "No branching in viewModels.ts — this file is a pure mapping layer. Put decisions in a use case.",
        },
        {
          selector: "ConditionalExpression",
          message:
            "No ternaries in viewModels.ts — this file is a pure mapping layer. Put decisions in a use case.",
        },
        {
          selector: "SwitchStatement",
          message:
            "No switch in viewModels.ts — this file is a pure mapping layer. Put decisions in a use case.",
        },
      ],
    },
  },
  {
    // The Capability Deck's static/seed content module (src/presentation/capability-deck/data/content.ts)
    // is data, not UI — an artifact of the deck having been ported as a pure frontend feature before
    // the CMS work began. Unlike the seven existing pages (whose static content correctly lives under
    // src/infrastructure/content/static/), this file has not been relocated out of presentation/, because
    // doing so would require updating every live slide component that still imports it directly. These
    // two infrastructure files are the deck's static/database repository and its public-route content
    // reader — both need to read that data module directly as the deck's structural template and
    // fallback source. See docs/superpowers/plans/2026-09-17-capability-deck-cms.md for the full reasoning.
    files: [
      "src/infrastructure/capability-deck/StaticCapabilityDeckRepository.ts",
      "src/infrastructure/capability-deck/getCapabilityDeckContent.ts",
    ],
    rules: {
      "boundaries/element-types": "off",
    },
  },
  {
    // THE ONE-PALETTE RULE.
    // ---------------------------------------------------------------------------
    // src/shared/design/colors.ts is the only file in the repository allowed to name a
    // colour. Everything else asks for one by role — a Tailwind class backed by a
    // generated CSS variable, or a value off `color`/`colorDerived` in tokens.ts — so
    // that changing a base there reaches the whole site. A hex written anywhere else is
    // a value that will not follow, and those are exactly the ones that survive a
    // rebrand and quietly go wrong.
    //
    // Matches string literals and the literal chunks of template strings. Regex literals
    // that merely describe hex (HexColor's pattern) do not match, because a `#` in them
    // is followed by a group rather than by hex digits.
    //
    // CSS is covered separately: src/app/colors.generated.css is written from colors.ts
    // and `npm run lint` fails when it drifts — see scripts/generate-color-css.mjs.
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    ignores: ["src/shared/design/colors.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}/]",
          message:
            "No hex colours outside src/shared/design/colors.ts. Use a token from shared/design/tokens.ts, or a Tailwind colour class, so the value follows a palette change.",
        },
        {
          selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}/]",
          message:
            "No hex colours outside src/shared/design/colors.ts. Use a token from shared/design/tokens.ts, or a Tailwind colour class, so the value follows a palette change.",
        },
      ],
    },
  },
  {
    // The two exceptions, both tests of code that OPERATES on hex rather than code that
    // chooses a colour: HexColor is the value object that parses it, and colorMath is the
    // arithmetic every derived token goes through. Their literals are fixtures — black,
    // white and mid-grey, whose luminance is fixed by the spec and cannot come from the
    // palette — not colours the site renders.
    files: [
      "src/domain/shared/value-objects/HexColor.test.ts",
      "src/shared/design/colorMath.test.ts",
    ],
    rules: { "no-restricted-syntax": "off" },
  },
);
