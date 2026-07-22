import js from "@eslint/js"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import jsxA11y from "eslint-plugin-jsx-a11y"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import tseslint from "typescript-eslint"

export default [
  js.configs.recommended,
  react.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  eslintPluginPrettierRecommended,
  ...tseslint.configs.recommended,

  // ── Architecture boundary: features/*/domain/ must be pure ──
  // No React, MUI, or store imports in domain files
  {
    files: ["src/features/*/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["react", "react-dom"], message: "domain/ must be pure — no React imports" },
            { group: ["@mui/*"], message: "domain/ must be pure — no MUI imports" },
            { group: ["**/store", "**/store/**"], message: "domain/ must be pure — no store imports" },
          ],
        },
      ],
    },
  },

  // ── Architecture boundary: components/ must not access the store ──
  {
    files: ["src/components/**/*.tsx", "src/components/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            { group: ["**/store", "**/store/**"], message: "Shared components should not import from store/ — receive data via props instead (see ARCHITECTURE.md)" },
          ],
        },
      ],
    },
  },

  // ── Architecture boundary: features/ should not import old store slices ──
  {
    files: ["src/features/**/*.ts", "src/features/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            { group: ["**/store/profile", "**/store/contractor", "**/store/offer", "**/store/orders", "**/store/services", "**/store/recruiting", "**/store/notification", "**/store/moderation", "**/store/public_contracts", "**/store/admin", "**/store/ships", "**/store/orderSettings", "**/store/comments", "**/store/transactions", "**/store/commodities", "**/store/organizations"], message: "Use feature-owned API slices (features/*/api/) instead of legacy store slices (see DECOUPLING_PLAN.md)" },
          ],
        },
      ],
    },
  },

  // ── Route helpers: discourage hardcoded internal route strings ──
  // All routes live in src/routes/paths.ts — use the PATHS.* helpers instead
  // of hardcoding leading-slash paths in `to=` / `href=` props or navigate().
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: [
      "src/App.tsx",
      "src/routes/paths.ts",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/__tests__/**",
    ],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "JSXAttribute[name.name=/^(to|href)$/] > Literal[value=/^\\/[A-Za-z]/]",
          message:
            "Use a helper from src/routes/paths.ts instead of a hardcoded route string.",
        },
        {
          selector:
            "CallExpression[callee.name='navigate'] > Literal[value=/^\\/[A-Za-z]/]",
          message:
            "Use a helper from src/routes/paths.ts instead of a hardcoded route string.",
        },
      ],
    },
  },

  {
    plugins: {
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "prettier/prettier": "error",
      "react/jsx-no-target-blank": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/exhaustive-deps": "warn",
      "no-empty-pattern": "off",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "no-empty": "warn",
      // Accessibility rules
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/html-has-lang": "error",
      "jsx-a11y/img-redundant-alt": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/tabindex-no-positive": "error",
    },
  },
]
