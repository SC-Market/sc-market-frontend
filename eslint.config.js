import { relative, sep } from "node:path"
import js from "@eslint/js"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import jsxA11y from "eslint-plugin-jsx-a11y"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import tseslint from "typescript-eslint"
import { isIgnored, isTranslatable } from "./scripts/i18n-hardcoded.mjs"

// local/no-hardcoded-jsx-text: user-facing English written straight into JSX
// (text children and aria-label / title / placeholder / alt / label /
// helperText) instead of t(). An error, like the CI check in
// scripts/i18n-hardcoded.mjs that shares its test. Proper nouns (aUEC, RSI,
// Citizen iD, ...) and symbols pass. A string that is not user-facing (CSS
// unit, code sample, API field name, dev-only debug text) goes on
// scripts/i18n-hardcoded-ignore.json with a reason; there is no inline opt-out.
const I18N_ATTRS = new Set([
  "aria-label",
  "aria-description",
  "title",
  "placeholder",
  "alt",
  "label",
  "helperText",
  "primary",
  "secondary",
])
const localPlugin = {
  rules: {
    "no-hardcoded-jsx-text": {
      meta: {
        type: "suggestion",
        docs: { description: "User-facing JSX text must go through t()" },
        messages: {
          text: 'Hard-coded UI text "{{text}}": use t() with a key in src/locales/en/english.json.',
        },
        schema: [],
      },
      create(context) {
        const file = relative(import.meta.dirname, context.filename)
          .split(sep)
          .join("/")
        const report = (node, value) =>
          !isIgnored(file, value) &&
          context.report({
            node,
            messageId: "text",
            data: { text: value.trim().replace(/\s+/g, " ").slice(0, 40) },
          })
        return {
          JSXText(node) {
            if (isTranslatable(node.value)) report(node, node.value)
          },
          JSXAttribute(node) {
            const name =
              typeof node.name.name === "string" ? node.name.name : ""
            if (!I18N_ATTRS.has(name) || !node.value) return
            let v = node.value
            if (v.type === "JSXExpressionContainer") v = v.expression
            const text =
              v.type === "Literal" && typeof v.value === "string"
                ? v.value
                : v.type === "TemplateLiteral" && v.expressions.length === 0
                  ? v.quasis[0].value.cooked
                  : null
            if (text != null && isTranslatable(text)) report(node, text)
          },
        }
      },
    },
  },
}

// ── Guard rails (warn-only): keep pages on the component kit ──
// See drafts/component-standard-audit.md §1.5. Start at warn with a baseline;
// switch a folder to error once it is clean.
const RAW_MUI = {
  Dialog: "use BottomSheet (components/mobile) or a shared dialog component",
  Avatar:
    "use UserAvatar / ContractorAvatar (components/avatar), which set alt",
  Drawer: "use BottomSheet (components/mobile) or the shared nav drawers",
  Switch: "use a labelled FormControlLabel + Switch from a shared component",
}
const HEX = "#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})"
const WHOLE_HEX = new RegExp(`^${HEX}$`, "i")
const EMBEDDED_HEX = new RegExp(`(?:[(,]\\s*|solid\\s+)${HEX}\\b`, "i")
const scmStyle = {
  rules: {
    // Server and browser must format the same: a locale-less toLocale*() or
    // Intl formatter uses the machine's language (util/format instead).
    "no-locale-less-format": {
      meta: {
        type: "problem",
        messages: {
          toLocale:
            "{{name}}() without a locale formats in the machine's language, so the server render and the browser disagree. Use util/format (useFormatters() in components, or a format* function with an explicit locale).",
          intl: "Intl.{{name}} without a locale uses the machine's language. Pass the page's locale (useFormatters().locale, pageLocale()) or use util/format.",
        },
      },
      create(context) {
        const noLocale = (args) =>
          args.length === 0 ||
          (args[0].type === "Identifier" && args[0].name === "undefined")
        const INTL =
          /^(NumberFormat|DateTimeFormat|RelativeTimeFormat|ListFormat|PluralRules|DisplayNames|DurationFormat)$/
        const intlCtor = (node) => {
          const c = node.callee
          if (
            c.type === "MemberExpression" &&
            c.object.type === "Identifier" &&
            c.object.name === "Intl" &&
            c.property.type === "Identifier" &&
            INTL.test(c.property.name) &&
            noLocale(node.arguments)
          ) {
            context.report({
              node,
              messageId: "intl",
              data: { name: c.property.name },
            })
          }
        }
        return {
          CallExpression(node) {
            const c = node.callee
            if (
              c.type === "MemberExpression" &&
              c.property.type === "Identifier" &&
              /^toLocale(String|DateString|TimeString)$/.test(
                c.property.name,
              ) &&
              noLocale(node.arguments)
            ) {
              context.report({
                node,
                messageId: "toLocale",
                data: { name: c.property.name },
              })
            }
            intlCtor(node)
          },
          NewExpression: intlCtor,
        }
      },
    },
    "no-hex-colors": {
      meta: {
        type: "suggestion",
        messages: {
          hex: 'Hard-coded hex colour "{{value}}". Use a theme palette value (theme.palette.*) instead.',
        },
      },
      create(context) {
        const check = (node, value) => {
          if (typeof value !== "string") return
          const m = WHOLE_HEX.exec(value) ?? EMBEDDED_HEX.exec(value)
          if (m)
            context.report({
              node,
              messageId: "hex",
              data: { value: m[0].trim() },
            })
        }
        return {
          Literal: (node) => check(node, node.value),
          TemplateElement: (node) => check(node, node.value.cooked),
        }
      },
    },
  },
}

// ── no-restricted-syntax selector sets (combined per block below) ──
const LINT_TEST_AND_ROUTE_IGNORES = [
  "src/routes/elements/**",
  "src/routes/paths.ts",
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/*.spec.ts",
  "**/*.spec.tsx",
  "**/__tests__/**",
]
const ROUTE_STRING_SELECTORS = [
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
]
// See drafts/view-logic-refactor-audit-2026-11.md §9.
// toLocale*() without a locale is an error: scm-style/no-locale-less-format.
const FORMAT_SELECTORS = [
  {
    selector: "NewExpression[callee.name='Date'][arguments.length=0]",
    message:
      "new Date() during render differs between server and browser. Use useNow() (util/format) in components; take `now` as a parameter in domain functions.",
  },
]
const RENDER_LAYER_SELECTORS = [
  {
    selector: "CallExpression[callee.name=/^use\\w+Mutation$/]",
    message:
      "Mutations belong in a feature hook (features/<f>/hooks). Components render and call hooks.",
  },
  {
    selector: "CallExpression[callee.name='has_permission']",
    message:
      "Use a named rule from features/<f>/domain (e.g. canOpenShopSettings) instead of has_permission in a component.",
  },
]

export default [
  // macOS AppleDouble files (._*) on exFAT drives are not source.
  { ignores: ["**/._*"] },
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
            {
              group: ["react", "react-dom"],
              message: "domain/ must be pure — no React imports",
            },
            {
              group: ["@mui/*"],
              message: "domain/ must be pure — no MUI imports",
            },
            {
              group: ["**/store", "**/store/**"],
              message: "domain/ must be pure — no store imports",
            },
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
            {
              group: ["**/store", "**/store/**"],
              message:
                "Shared components should not import from store/ — receive data via props instead (see ARCHITECTURE.md)",
            },
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
            {
              group: [
                "**/store/profile",
                "**/store/contractor",
                "**/store/offer",
                "**/store/orders",
                "**/store/services",
                "**/store/recruiting",
                "**/store/notification",
                "**/store/moderation",
                "**/store/public_contracts",
                "**/store/admin",
                "**/store/ships",
                "**/store/orderSettings",
                "**/store/comments",
                "**/store/transactions",
                "**/store/commodities",
                "**/store/organizations",
              ],
              message:
                "Use feature-owned API slices (features/*/api/) instead of legacy store slices (see DECOUPLING_PLAN.md)",
            },
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
    ignores: LINT_TEST_AND_ROUTE_IGNORES,
    rules: {
      "no-restricted-syntax": ["warn", ...ROUTE_STRING_SELECTORS],
    },
  },

  // ── Ratchet (warn): server and browser must format the same ──
  // Flat config replaces no-restricted-syntax per matching block, so each
  // block below repeats the route-string selectors. These blocks stay above
  // the route-module block, which must keep the last word on its files.
  // The warning count may only go down: scripts/lint-ratchet.mjs (CI).
  {
    files: ["src/**/*.tsx"],
    ignores: LINT_TEST_AND_ROUTE_IGNORES,
    rules: {
      "no-restricted-syntax": [
        "warn",
        ...ROUTE_STRING_SELECTORS,
        ...FORMAT_SELECTORS,
      ],
    },
  },

  // ── Ratchet (warn): components and views render; hooks call the API ──
  {
    files: [
      "src/features/*/components/**/*.tsx",
      "src/components/**/*.tsx",
      "src/views/**/*.tsx",
      "src/features/market/v2/**/*.tsx",
    ],
    ignores: LINT_TEST_AND_ROUTE_IGNORES,
    rules: {
      "no-restricted-syntax": [
        "warn",
        ...ROUTE_STRING_SELECTORS,
        ...FORMAT_SELECTORS,
        ...RENDER_LAYER_SELECTORS,
      ],
    },
  },

  // ── Ratchet (warn): big files are a smell, not an error ──
  {
    files: ["src/**/*.tsx"],
    ignores: LINT_TEST_AND_ROUTE_IGNORES,
    rules: {
      "max-lines": [
        "warn",
        { max: 400, skipBlankLines: true, skipComments: true },
      ],
    },
  },

  // ── Route modules (src/routes.ts): pages load only through definePage ──
  // definePage retries a failed chunk, spends the reload budget and then
  // shows the error in place; a bare import()/lazy() here skips all of that.
  // The import()s themselves live in src/app/pages.ts (see definePage.tsx).
  {
    files: [
      "src/routes/pages/**/*.tsx",
      "src/routes/elements/**/*.tsx",
      "src/routes/layouts/**/*.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportExpression",
          message:
            'Route modules load pages with definePage("Name") (src/app/pages.ts), never import().',
        },
        {
          selector:
            "CallExpression[callee.name='lazy'], CallExpression[callee.property.name='lazy']",
          message:
            "Route modules load pages through definePage, not React.lazy.",
        },
      ],
    },
  },

  // ── Guard rails: no raw MUI Dialog/Avatar/Drawer/Switch in page code (warn) ──
  // Uses the @typescript-eslint variant so it doesn't replace the
  // no-restricted-imports boundaries configured above.
  {
    files: ["src/pages/**/*.{ts,tsx}", "src/features/**/*.{ts,tsx}"],
    ignores: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "warn",
        {
          paths: Object.entries(RAW_MUI).flatMap(([name, instead]) => [
            {
              name: "@mui/material",
              importNames: [name],
              message: `Raw MUI ${name} in page code: ${instead}.`,
              allowTypeImports: true,
            },
            {
              name: `@mui/material/${name}`,
              message: `Raw MUI ${name} in page code: ${instead}.`,
              allowTypeImports: true,
            },
          ]),
        },
      ],
    },
  },

  // ── Guard rails: no hard-coded hex colours (warn) ──
  // Theme files and the game-icon colour table are where hex values belong.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/hooks/styles/**",
      "src/util/gameIcons.ts",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/__tests__/**",
    ],
    plugins: { "scm-style": scmStyle },
    rules: {
      "scm-style/no-hex-colors": "warn",
    },
  },

  // ── Formatting (error): numbers, prices and dates go through util/format ──
  // The sweep brought locale-less toLocale*() and Intl formatters to zero
  // (they made SSR pages mismatch at hydration); keep it there.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**"],
    plugins: { "scm-style": scmStyle },
    rules: {
      "scm-style/no-locale-less-format": "error",
    },
  },

  // ── i18n: no hard-coded UI text, admin pages included (see scripts/i18n-hardcoded.mjs) ──
  {
    files: ["src/**/*.tsx"],
    ignores: [
      "**/*.test.tsx",
      "**/*.spec.tsx",
      "**/*.stories.tsx",
      "**/__tests__/**",
    ],
    plugins: { local: localPlugin },
    rules: { "local/no-hardcoded-jsx-text": "error" },
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
      "react-hooks/rules-of-hooks": "error",
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
