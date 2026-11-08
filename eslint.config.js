import { relative, sep } from "node:path"
import js from "@eslint/js"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import jsxA11y from "eslint-plugin-jsx-a11y"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import tseslint from "typescript-eslint"
import { isIgnored, isTranslatable } from "./scripts/i18n-hardcoded.mjs"
import { buttonIconsRule } from "./scripts/button-icons.mjs"

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
  Dialog:
    "use ResponsiveDialog or ConfirmDialog (components/dialog), or BottomSheet (components/mobile)",
  Avatar:
    "use UserAvatar / ContractorAvatar (components/avatar), which set alt",
  Drawer:
    "use BottomSheet / MobileSidebarWrapper (components/mobile) or DockedSidePanel (components/sidebar)",
  Switch: "use a labelled FormControlLabel + Switch from a shared component",
}
const LEGACY_STORE_SLICES = [
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
]
const LEGACY_SLICE_PATTERN = {
  group: LEGACY_STORE_SLICES,
  message:
    "Use feature-owned API slices (features/*/api/) instead of legacy store slices (see DECOUPLING_PLAN.md)",
}
const RAW_MUI_PATHS = Object.entries(RAW_MUI).flatMap(([name, instead]) => [
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
])
// scm-style/mui-rounded-icons: the only non-Rounded @mui/icons-material
// names allowed. Brand marks have no Rounded variant; SvgIconComponent is a
// type, not an icon.
const MUI_ICON_ALLOWLIST = new Set([
  "SvgIconComponent",
  "Apple",
  "Facebook",
  "GitHub",
  "Google",
  "Instagram",
  "LinkedIn",
  "Microsoft",
  "Pinterest",
  "Reddit",
  "Telegram",
  "Twitter",
  "WhatsApp",
  "X",
  "YouTube",
])
// Icon packages other than MUI: only src/components/icons/ may import them.
const OTHER_ICON_PACKS = [
  "@fortawesome",
  "@heroicons",
  "@iconify",
  "@phosphor-icons",
  "@tabler/icons",
  "@tabler/icons-react",
  "lucide-react",
  "react-icons",
]
// Accent rails (scm-style/border-width): a coloured left edge, 3-4px, on a
// card, row or quote. Not box borders, so they may be heavier than 2px.
const BORDER_RAILS = [
  {
    file: "src/components/landing/StartSelling.tsx",
    reason: "the sample listing card's primary left rail",
  },
  {
    file: "src/components/markdown/Markdown.tsx",
    reason: "blockquote rail",
  },
  {
    file: "src/features/help/components/ContentBlocks.tsx",
    reason: "help-article blockquote rail",
  },
  {
    file: "src/pages/wiki/WikiRefineryPage.tsx",
    reason: "refining method card, left rail in the quality colour",
  },
  {
    file: "src/pages/mining/MiningOreBrowser.tsx",
    reason: "ore card, left rail in the rarity colour",
  },
  {
    file: "src/pages/widget/OrdersWidget.tsx",
    reason: "order row, primary left rail",
  },
  {
    file: "src/pages/admin/SupplierBuyOrdersPanel.tsx",
    reason: "targeted (private) buy order row rail",
  },
]
const HEX = "#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})"
const WHOLE_HEX = new RegExp(`^${HEX}$`, "i")
const EMBEDDED_HEX = new RegExp(`(?:[(,]\\s*|solid\\s+)${HEX}\\b`, "i")
const scmStyle = {
  rules: {
    // Button icons (ARCHITECTURE.md): no glyph standing in for an icon at
    // either end of a label, no fontSize on startIcon/endIcon, icon-only
    // actions are a labelled IconButton. See scripts/button-icons.mjs.
    "button-icons": buttonIconsRule,
    // Components and views render; mutations and permission checks live in
    // feature hooks and domain rules. Its own rule (not no-restricted-syntax)
    // so it doesn't replace the route-string and new Date() selectors.
    "render-layer": {
      meta: { type: "suggestion", schema: [] },
      create(context) {
        return Object.fromEntries(
          RENDER_LAYER_SELECTORS.map(({ selector, message }) => [
            selector,
            (node) => context.report({ node, message }),
          ]),
        )
      },
    },
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
    // Green is the one accent (2026-11). palette.secondary is the buy side
    // and premium (bid prices, "Top bid", the bid curve, buy orders,
    // supporter and premium badges), not a second accent. It may colour
    // text, chips, badges, chart series and plain `sx` colours, but not
    // controls, fields, navigation, buttons or focus styles: those take the
    // accent (primary, the default) or `neutral`.
    "no-secondary-accent": {
      meta: {
        type: "problem",
        messages: {
          control:
            'palette.secondary is the buy side and premium, not an accent: not on {{name}}. Use the default (primary, green) for main actions, fields, controls and links, or color="neutral" for secondary actions.',
          focus:
            "palette.secondary is the buy side and premium, not an accent: focus styles use the accent (common.focus / primary).",
        },
        schema: [],
      },
      create(context) {
        // Form controls, buttons, navigation and progress: where a colour
        // reads as "the accent". Matched on the MUI name, aliases included.
        const CONTROLS = new Set([
          "Autocomplete",
          "BottomNavigation",
          "BottomNavigationAction",
          "Breadcrumbs",
          "Button",
          "ButtonBase",
          "ButtonGroup",
          "Checkbox",
          "CircularProgress",
          "Fab",
          "FilledInput",
          "FormControl",
          "FormControlLabel",
          "FormLabel",
          "IconButton",
          "Input",
          "InputBase",
          "InputLabel",
          "LinearProgress",
          "Link",
          "LoadingButton",
          "MenuItem",
          "NativeSelect",
          "OutlinedInput",
          "Pagination",
          "PaginationItem",
          "Radio",
          "RadioGroup",
          "Select",
          "Slider",
          "SpeedDial",
          "Stepper",
          "StepIcon",
          "StepLabel",
          "Switch",
          "Tab",
          "Tabs",
          "TextField",
          "ToggleButton",
          "ToggleButtonGroup",
        ])
        const FOCUS_KEY = /focus|^outline(Color)?$|^caretColor$/i
        const aliases = new Map()
        const controlName = (name) => {
          const resolved = aliases.get(name) ?? name
          return CONTROLS.has(resolved) ? resolved : null
        }
        const jsxName = (n) =>
          n.type === "JSXIdentifier"
            ? n.name
            : n.type === "JSXMemberExpression"
              ? n.property.name
              : null
        const keyName = (k) =>
          k.type === "Identifier"
            ? k.name
            : k.type === "Literal" && typeof k.value === "string"
              ? k.value
              : null
        // `styled(Button)(...)` / `styled(Button)\`...\``
        const styledTarget = (callee) =>
          callee.type === "CallExpression" &&
          callee.callee.type === "Identifier" &&
          callee.callee.name === "styled" &&
          callee.arguments[0]?.type === "Identifier"
            ? controlName(callee.arguments[0].name)
            : null
        const check = (node) => {
          let attrChecked = false
          for (let p = node.parent; p; p = p.parent) {
            if (p.type === "Property" && !p.computed) {
              const key = keyName(p.key)
              if (key && FOCUS_KEY.test(key)) {
                context.report({ node, messageId: "focus" })
                return
              }
            }
            if (p.type === "JSXAttribute" && !attrChecked) {
              // The nearest attribute decides: a chip inside a button's
              // icon slot is still a chip.
              attrChecked = true
              const name = controlName(jsxName(p.parent.name))
              if (name) {
                context.report({ node, messageId: "control", data: { name } })
                return
              }
            }
            if (
              (p.type === "CallExpression" ||
                p.type === "TaggedTemplateExpression") &&
              styledTarget(p.type === "CallExpression" ? p.callee : p.tag)
            ) {
              const name = styledTarget(
                p.type === "CallExpression" ? p.callee : p.tag,
              )
              context.report({ node, messageId: "control", data: { name } })
              return
            }
          }
        }
        return {
          ImportDeclaration(node) {
            if (!String(node.source.value).startsWith("@mui/")) return
            for (const s of node.specifiers) {
              if (
                s.type === "ImportSpecifier" &&
                s.imported.name !== s.local.name
              )
                aliases.set(s.local.name, s.imported.name)
              if (s.type === "ImportDefaultSpecifier") {
                const last = String(node.source.value).split("/").pop()
                if (last && last !== s.local.name)
                  aliases.set(s.local.name, last)
              }
            }
          },
          Literal(node) {
            if (
              node.value === "secondary" ||
              (typeof node.value === "string" &&
                /^secondary\.(main|light|dark|contrastText)$/.test(node.value))
            )
              check(node)
          },
          MemberExpression(node) {
            const { object, property } = node
            if (
              !node.computed &&
              property.type === "Identifier" &&
              property.name === "secondary" &&
              object.type === "MemberExpression" &&
              !object.computed &&
              object.property.type === "Identifier" &&
              object.property.name === "palette"
            )
              check(node)
          },
        }
      },
    },
    // Borders are 1px (theme.borderWidth.hairline), 2px for emphasis,
    // selected states and focus rings (emphasis, focus). Accent rails, a
    // coloured left edge of up to 4px, are the one exception, and only in
    // the files on BORDER_RAILS (each with its reason). Checks border*,
    // outline* and box-shadow rings (0 0 0 Npx) in sx, styled() objects and
    // css`` / styled`` templates.
    "border-width": {
      meta: {
        type: "suggestion",
        messages: {
          width:
            "{{width}}px {{prop}} is heavier than 2px. Use theme.borderWidth.hairline (1px), or .emphasis (2px) for a selected or primary element.",
          rail: "{{width}}px {{prop}}: an accent rail is at most {{max}}px.",
        },
        schema: [
          {
            type: "object",
            properties: {
              rails: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    file: { type: "string" },
                    reason: { type: "string" },
                  },
                  required: ["file", "reason"],
                  additionalProperties: false,
                },
              },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const MAX = 2
        const RAIL_MAX = 4
        const file = relative(import.meta.dirname, context.filename)
          .split(sep)
          .join("/")
        const railFile = (context.options[0]?.rails ?? []).some(
          (r) => r.file === file,
        )
        const camel = (k) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
        const BORDER =
          /^(border|outline)(Top|Right|Bottom|Left|Inline|Block|InlineStart|InlineEnd|BlockStart|BlockEnd)?(Width)?$/
        const RAIL = /^border(Left|InlineStart)(Width)?$/
        const SHADOW = /^boxShadow$/
        const PX = /(\d+(?:\.\d+)?)px/g
        const KEYWORD = /\b(medium|thick)\b/
        const RING =
          /(?:^|,)\s*(?:inset\s+)?0(?:px)?\s+0(?:px)?\s+0(?:px)?\s+(\d+(?:\.\d+)?)px/g
        const pxIn = (text) => {
          const out = [...text.matchAll(PX)].map((m) => Number(m[1]))
          if (KEYWORD.test(text))
            out.push(text.match(KEYWORD)[1] === "thick" ? 5 : 3)
          return out
        }
        const ringsIn = (text) =>
          [...text.matchAll(RING)].map((m) => Number(m[1]))
        // The literal text of a value; `${…}` becomes a space.
        const texts = (node) => {
          if (!node) return []
          switch (node.type) {
            case "Literal":
              return [node.value]
            case "TemplateLiteral":
              return [node.quasis.map((q) => q.value.cooked).join(" ")]
            case "ConditionalExpression":
              return [...texts(node.consequent), ...texts(node.alternate)]
            case "LogicalExpression":
              return [...texts(node.left), ...texts(node.right)]
            case "ArrowFunctionExpression":
              return node.body.type === "BlockStatement" ? [] : texts(node.body)
            default:
              return []
          }
        }
        const check = (node, prop, widths) => {
          const width = Math.max(...widths)
          if (!(width > MAX)) return
          if (railFile && RAIL.test(prop)) {
            if (width > RAIL_MAX)
              context.report({
                node,
                messageId: "rail",
                data: { width, prop, max: RAIL_MAX },
              })
            return
          }
          context.report({ node, messageId: "width", data: { width, prop } })
        }
        const widthsOf = (prop, value) =>
          texts(value).flatMap((v) =>
            typeof v === "number"
              ? SHADOW.test(prop)
                ? []
                : [v]
              : typeof v === "string"
                ? SHADOW.test(prop)
                  ? ringsIn(v)
                  : pxIn(v)
                : [],
          )
        const CSS_DECL =
          /(?:^|[;{\s])((?:border|outline)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?(?:-width)?|box-shadow)\s*:\s*([^;}]*)/g
        return {
          Property(node) {
            if (node.computed) return
            const key =
              node.key.type === "Identifier"
                ? node.key.name
                : node.key.type === "Literal" &&
                    typeof node.key.value === "string"
                  ? node.key.value
                  : null
            if (!key) return
            const prop = camel(key)
            if (!BORDER.test(prop) && !SHADOW.test(prop)) return
            check(node, prop, widthsOf(prop, node.value))
          },
          TaggedTemplateExpression(node) {
            const css = node.quasi.quasis.map((q) => q.value.cooked).join(" ")
            for (const m of css.matchAll(CSS_DECL)) {
              const prop = camel(m[1])
              check(node, prop, SHADOW.test(prop) ? ringsIn(m[2]) : pxIn(m[2]))
            }
          },
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
    // MUI icons are the Rounded variant: `@mui/icons-material/DeleteRounded`,
    // `{ DeleteRounded }` from the barrel. A filled vs outline state uses the
    // Rounded pair (StarRounded / StarBorderRounded, FavoriteRounded /
    // FavoriteBorderRounded, CheckBoxRounded / CheckBoxOutlineBlankRounded),
    // so it needs no exception. An icon MUI lacks (the Discord mark) is
    // borrowed into src/components/icons/ as an SvgIcon wrapper with a
    // source/licence comment; other icon packs and raw `.svg?react` imports
    // are only allowed there.
    "mui-rounded-icons": {
      meta: {
        type: "suggestion",
        messages: {
          variant:
            'Use the Rounded MUI icon: "{{name}}" -> "{{name}}Rounded" (strip any Outlined/Sharp/TwoTone suffix first).',
          pack: 'Icon import "{{source}}" outside src/components/icons/. Use a Rounded MUI icon, or borrow the glyph into src/components/icons/ as an SvgIcon wrapper with a source/licence comment.',
        },
        schema: [],
      },
      create(context) {
        const file = relative(import.meta.dirname, context.filename)
          .split(sep)
          .join("/")
        const inIconsDir = file.startsWith("src/components/icons/")
        const checkName = (node, name) => {
          if (name.endsWith("Rounded") || MUI_ICON_ALLOWLIST.has(name)) return
          const base = name.replace(/(Outlined|Sharp|TwoTone)$/, "")
          context.report({ node, messageId: "variant", data: { name: base } })
        }
        const checkSource = (node, source, specifiers) => {
          if (typeof source !== "string") return
          if (source === "@mui/icons-material") {
            for (const s of specifiers ?? []) {
              if (s.importKind === "type" || s.exportKind === "type") continue
              const imported =
                s.type === "ImportSpecifier" ? s.imported : s.local
              if (imported && s.type !== "ImportNamespaceSpecifier")
                checkName(s, imported.name ?? imported.value)
            }
            return
          }
          if (source.startsWith("@mui/icons-material/")) {
            checkName(node, source.split("/").pop())
            return
          }
          if (
            !inIconsDir &&
            (OTHER_ICON_PACKS.some(
              (p) => source === p || source.startsWith(`${p}/`),
            ) ||
              /\.svg\?react$/.test(source))
          )
            context.report({ node, messageId: "pack", data: { source } })
        }
        return {
          ImportDeclaration: (node) => {
            if (node.importKind === "type") return
            checkSource(node, node.source.value, node.specifiers)
          },
          ExportNamedDeclaration: (node) => {
            if (node.source && node.exportKind !== "type")
              checkSource(node, node.source.value, node.specifiers)
          },
          ExportAllDeclaration: (node) =>
            checkSource(node, node.source.value, []),
          ImportExpression: (node) => {
            if (node.source.type === "Literal")
              checkSource(node, node.source.value, [])
          },
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

  // ── Architecture boundary: components/ must not access the store ──
  {
    files: ["src/components/**/*.tsx", "src/components/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
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
        "error",
        {
          patterns: [LEGACY_SLICE_PATTERN],
        },
      ],
    },
  },

  // ── Route helpers: no hardcoded internal route strings (error) ──
  // All routes live in src/routes/paths.ts — use the PATHS.* helpers instead
  // of hardcoding leading-slash paths in `to=` / `href=` props or navigate().
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: LINT_TEST_AND_ROUTE_IGNORES,
    rules: {
      "no-restricted-syntax": ["error", ...ROUTE_STRING_SELECTORS],
    },
  },

  // ── Server and browser must format the same (error) ──
  // Flat config replaces no-restricted-syntax per matching block, so this
  // block repeats the route-string selectors. It stays above the
  // route-module block, which must keep the last word on its files.
  {
    files: ["src/**/*.tsx"],
    ignores: LINT_TEST_AND_ROUTE_IGNORES,
    rules: {
      "no-restricted-syntax": [
        "error",
        ...ROUTE_STRING_SELECTORS,
        ...FORMAT_SELECTORS,
      ],
    },
  },

  // ── Components and views render; hooks call the API (error) ──
  // A mutation goes in a named hook in features/<f>/hooks; a permission
  // check in a named rule in features/<f>/domain.
  {
    files: [
      "src/features/*/components/**/*.tsx",
      "src/components/**/*.tsx",
      "src/views/**/*.tsx",
      "src/features/market/v2/**/*.tsx",
    ],
    ignores: LINT_TEST_AND_ROUTE_IGNORES,
    plugins: { "scm-style": scmStyle },
    rules: {
      "scm-style/render-layer": "error",
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

  // ── Guard rails: raw MUI Dialog only in components/dialog (error) ──
  // Everywhere else uses ResponsiveDialog / ConfirmDialog. The three detail
  // modals stay a modal over the hub on desktop and a page on mobile (owner's
  // call). No exceptions beyond these: new dialogs go on ResponsiveDialog.
  // pages/ and features/ are covered by the stricter block below, which
  // comes later and so has the last word on those files.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/pages/**",
      "src/features/**",
      "src/components/dialog/**",
      "src/components/game-data/BlueprintDetailModal.tsx",
      "src/components/game-data/MissionDetailModal.tsx",
      "src/components/game-data/ShipDetailModal.tsx",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/__tests__/**",
    ],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@mui/material",
              importNames: ["Dialog"],
              message: `Raw MUI Dialog: ${RAW_MUI.Dialog}.`,
              allowTypeImports: true,
            },
            {
              name: "@mui/material/Dialog",
              message: `Raw MUI Dialog: ${RAW_MUI.Dialog}.`,
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },

  // ── Guard rails: no raw MUI Dialog/Avatar/Drawer/Switch in page code (error) ──
  // Uses the @typescript-eslint variant so it doesn't replace the
  // no-restricted-imports boundaries configured above. Type imports
  // (DialogProps etc.) stay allowed.
  {
    files: ["src/pages/**/*.{ts,tsx}", "src/features/**/*.{ts,tsx}"],
    ignores: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: RAW_MUI_PATHS,
        },
      ],
    },
  },

  // ── Architecture boundary: features/*/domain/ must be pure (error) ──
  // No React, MUI, or store value imports. Flat config replaces a rule per
  // matching block, so this block sits after the features/ and raw-MUI blocks
  // and repeats their settings: the legacy-slice patterns and RAW_MUI_PATHS.
  // Generated API types are plain data shapes, so `import type` from the
  // store is allowed (allowTypeImports, which only the @typescript-eslint
  // variant has); React and MUI are not allowed even as types.
  {
    files: ["src/features/*/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            LEGACY_SLICE_PATTERN,
            {
              group: ["react", "react-dom", "react/*", "react-dom/*"],
              message: "domain/ must be pure — no React imports",
            },
            {
              group: ["@mui/*"],
              message: "domain/ must be pure — no MUI imports",
            },
          ],
        },
      ],
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: RAW_MUI_PATHS,
          patterns: [
            {
              group: ["**/store", "**/store/**"],
              message:
                "domain/ must be pure — no store imports (`import type` of generated API types is fine)",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },

  // ── Guard rails: no hard-coded hex colours (error) ──
  // Theme files and the game-icon colour table are where hex values belong;
  // colours that must stay exact live in src/hooks/styles/fixedColors.ts.
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
      "scm-style/no-hex-colors": "error",
    },
  },

  // ── Guard rails: borders are 1px, 2px for emphasis (error) ──
  // theme.borderWidth (hairline 1, emphasis 2, focus 2). Theme files define
  // the widths. The accent rails below are the only heavier borders: a
  // coloured left edge, not a box border.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/hooks/styles/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/__tests__/**",
    ],
    plugins: { "scm-style": scmStyle },
    rules: {
      "scm-style/border-width": ["error", { rails: BORDER_RAILS }],
    },
  },

  // ── Guard rails: palette.secondary is the buy side, not an accent (error) ──
  // The theme files define it; the theme editor edits and previews it.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/hooks/styles/**",
      "src/components/theme-editor/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/__tests__/**",
    ],
    plugins: { "scm-style": scmStyle },
    rules: {
      "scm-style/no-secondary-accent": "error",
    },
  },

  // ── Icons (error): MUI icons are the Rounded variant ──
  // Borrowed glyphs (Discord) live in src/components/icons/. Tests included.
  {
    files: ["src/**/*.{ts,tsx,js,jsx,mjs}"],
    plugins: { "scm-style": scmStyle },
    rules: {
      "scm-style/mui-rounded-icons": "error",
    },
  },

  // ── Buttons (error): icons per ARCHITECTURE.md "Button icons" ──
  // Labels carry no "+", "→", "←", "✓", "×" or "▸" at either end (the icon
  // goes in startIcon/endIcon); icon-only actions are a labelled IconButton.
  {
    files: ["src/**/*.tsx"],
    ignores: ["**/*.test.tsx", "**/__tests__/**"],
    plugins: { "scm-style": scmStyle },
    rules: {
      "scm-style/button-icons": "error",
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
      "react-hooks/exhaustive-deps": "error",
      "no-empty-pattern": "off",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/ban-ts-comment": "error",
      "no-empty": "warn",
      // Accessibility rules
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/html-has-lang": "error",
      "jsx-a11y/img-redundant-alt": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/tabindex-no-positive": "error",
    },
  },
]
