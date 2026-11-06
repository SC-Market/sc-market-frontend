// Button icons: the rule in ARCHITECTURE.md ("Button icons"), enforced by
// scm-style/button-icons (eslint.config.js) and, for the catalogs, by
// src/__tests__/i18nButtonGlyphs.test.ts.
//
// - A button label never starts or ends with a glyph standing in for an icon
//   ("+ Create", "Next →", "← Back", "Owned ✓", "✕"). The icon goes in
//   startIcon / endIcon. Labels are checked where they are written: JSX text,
//   string literals, and t() calls (the en catalog value, or the default).
// - Icons in startIcon / endIcon take no fontSize: MUI sizes them from the
//   button's size (small 18px, medium 20px, large 22px).
// - An icon-only action is an IconButton (or a Fab), never a Button with
//   only an icon in it, and it has an aria-label (a Tooltip parent counts:
//   MUI names the button with the tooltip's title).
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/** Glyphs that stand in for an icon at the start or end of a label. */
export const LABEL_GLYPHS = [
  "+",
  "＋",
  "→",
  "←",
  "➜",
  "⟶",
  "⟵",
  "✓",
  "✔",
  "×",
  "✕",
  "✗",
  "✖",
  "▸",
  "▶",
  "◂",
  "◀",
  "›",
  "‹",
]

const CLASS = LABEL_GLYPHS.map((g) => g.replace(/[-\\\]^]/g, "\\$&")).join("")
const EDGE_GLYPH_RE = new RegExp(`^\\s*[${CLASS}]|[${CLASS}]\\s*$`, "u")

/** True when `text` starts or ends with one of LABEL_GLYPHS. */
export function hasEdgeGlyph(text) {
  return typeof text === "string" && EDGE_GLYPH_RE.test(text)
}

const EN_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "locales",
  "en",
  "english.json",
)
let enCache = null
function enValue(key) {
  if (!enCache) enCache = JSON.parse(readFileSync(EN_PATH, "utf8"))
  let node = enCache
  for (const part of key.split(".")) {
    if (node == null || typeof node !== "object") return undefined
    node = node[part]
  }
  return typeof node === "string" ? node : undefined
}

const elementName = (opening) => {
  let n = opening.name
  while (n.type === "JSXMemberExpression") n = n.property
  return n.type === "JSXIdentifier" ? n.name : ""
}
const isIconButton = (name) => /IconButton$/.test(name)
const isTextButton = (name) =>
  !isIconButton(name) && (/Button$/.test(name) || name === "Fab")
const isIconName = (name) => /^[A-Z]\w*(Icon|Rounded)$/.test(name)
const attr = (opening, name) =>
  opening.attributes.find(
    (a) => a.type === "JSXAttribute" && a.name.name === name,
  )

/** The label strings an expression can render (best effort, never throws). */
function labelStrings(expr, out = []) {
  if (!expr) return out
  switch (expr.type) {
    case "Literal":
      if (typeof expr.value === "string") out.push(expr.value)
      break
    case "TemplateLiteral":
      if (expr.quasis.length) {
        out.push(expr.quasis[0].value.cooked ?? "")
        out.push(expr.quasis.at(-1).value.cooked ?? "")
      }
      break
    case "ConditionalExpression":
      labelStrings(expr.consequent, out)
      labelStrings(expr.alternate, out)
      break
    case "LogicalExpression":
      labelStrings(expr.right, out)
      break
    case "CallExpression": {
      const callee = expr.callee
      const isT =
        (callee.type === "Identifier" && callee.name === "t") ||
        (callee.type === "MemberExpression" &&
          !callee.computed &&
          callee.property.name === "t")
      if (!isT) break
      const [key, second] = expr.arguments
      if (key?.type === "Literal" && typeof key.value === "string") {
        const en = enValue(key.value)
        if (en != null) out.push(en)
      }
      if (second?.type === "Literal") labelStrings(second, out)
      if (second?.type === "ObjectExpression") {
        const dv = second.properties.find(
          (p) => p.type === "Property" && p.key.name === "defaultValue",
        )
        if (dv) labelStrings(dv.value, out)
      }
      break
    }
    default:
      break
  }
  return out
}

function iconElements(expr, out = []) {
  if (!expr) return out
  if (expr.type === "JSXElement") out.push(expr.openingElement)
  else if (expr.type === "ConditionalExpression") {
    iconElements(expr.consequent, out)
    iconElements(expr.alternate, out)
  } else if (expr.type === "LogicalExpression") iconElements(expr.right, out)
  return out
}

export const buttonIconsRule = {
  meta: {
    type: "suggestion",
    messages: {
      glyph:
        'Button label "{{text}}" starts or ends with a glyph. Put the icon in startIcon/endIcon (ARCHITECTURE.md, Button icons) and drop the glyph from the label.',
      iconSize:
        "No fontSize on a startIcon/endIcon icon: MUI sizes it from the button's size (small 18px, medium 20px, large 22px).",
      iconOnly:
        "Icon-only action: use IconButton with an aria-label, not a Button with only an icon in it.",
      iconButtonLabel:
        "IconButton needs an aria-label (or a Tooltip parent, whose title names it).",
    },
    schema: [],
  },
  create(context) {
    return {
      JSXElement(node) {
        const opening = node.openingElement
        const name = elementName(opening)
        if (isTextButton(name)) {
          for (const child of node.children) {
            const texts =
              child.type === "JSXText"
                ? [child.value]
                : child.type === "JSXExpressionContainer"
                  ? labelStrings(child.expression)
                  : []
            for (const text of texts) {
              if (hasEdgeGlyph(text)) {
                context.report({
                  node: child,
                  messageId: "glyph",
                  data: { text: text.trim().slice(0, 40) },
                })
                break
              }
            }
          }
          for (const which of ["startIcon", "endIcon"]) {
            const a = attr(opening, which)
            const expr =
              a?.value?.type === "JSXExpressionContainer"
                ? a.value.expression
                : null
            for (const icon of iconElements(expr)) {
              if (attr(icon, "fontSize"))
                context.report({ node: icon, messageId: "iconSize" })
            }
          }
          // Button / LoadingButton only: a ToggleButton, a Fab or a styled
          // wrapper may hold just an icon (with an aria-label).
          if (name === "Button" || name === "LoadingButton") {
            const meaningful = node.children.filter(
              (c) => !(c.type === "JSXText" && !c.value.trim()),
            )
            if (
              meaningful.length === 1 &&
              meaningful[0].type === "JSXElement" &&
              isIconName(elementName(meaningful[0].openingElement))
            )
              context.report({ node: opening, messageId: "iconOnly" })
          }
        }
        // MUI's IconButton; wrappers (HapticIconButton, PreferencesIconButton)
        // name themselves.
        if (name === "IconButton") {
          const named =
            attr(opening, "aria-label") ||
            attr(opening, "aria-labelledby") ||
            opening.attributes.some((a) => a.type === "JSXSpreadAttribute")
          // The Tooltip may wrap a <span> (a disabled button needs one).
          let inTooltip = false
          let up = node.parent
          for (let depth = 0; up && depth < 2; up = up.parent) {
            if (up.type !== "JSXElement") continue
            if (elementName(up.openingElement) === "Tooltip") inTooltip = true
            depth++
          }
          if (!named && !inTooltip)
            context.report({ node: opening, messageId: "iconButtonLabel" })
        }
      },
    }
  },
}
