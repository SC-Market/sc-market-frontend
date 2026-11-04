#!/usr/bin/env node
// Hard-coded user-facing English finder.
//
// Walks src/**/*.tsx (and .ts for alerts) with the TypeScript parser and
// reports strings a user would read that do not go through t():
//   - JSX text                         <Button>Save</Button>
//   - text-bearing JSX attributes      aria-label / title / placeholder / alt /
//                                      label / helperText / primary / secondary
//   - alert / toast messages           issueAlert({ message: "Saved" })
//   - document.title assignments
//
// Findings are grouped by product area and ranked by traffic (home, market,
// listing, shop, orgs, ... first; admin last), so batches can start where
// most users are.
//
// Usage: node scripts/i18n-hardcoded.mjs [--list] [--area <name>] [--json]
//                                        [--files] [--max <n>]
//        node scripts/i18n-hardcoded.mjs --check            (CI, strict)
//   --check fails (exit 1, a GitHub ::error per string) on ANY hard-coded
//   user-facing string, and on entries in scripts/i18n-hardcoded-ignore.json
//   that no longer match anything (so the list cannot rot). The ESLint rule
//   local/no-hardcoded-jsx-text (error) flags the same JSX text in the editor.
//
// Exceptions: scripts/i18n-hardcoded-ignore.json is the only ignore list
// (inline comments are not honoured). Each entry is { file, text, reason }
// for a string that is not user-facing prose: CSS units, code samples, API
// field names, dev-only debug output. Keep it small; translate everything a
// user can read.
import { readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join, relative, sep } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SRC = join(ROOT, "src")

const TEXT_ATTRS = new Set([
  "aria-label",
  "aria-description",
  "aria-roledescription",
  "title",
  "placeholder",
  "alt",
  "label",
  "helperText",
  "primary",
  "secondary",
  "tooltip",
  "subtitle",
  "description",
  "emptyText",
  "emptyMessage",
])
const ALERT_CALLS = new Set([
  "issueAlert",
  "enqueueSnackbar",
  "toast",
  "notify",
])

// Strings that are the same in every language: product and game proper nouns,
// units and symbols. Compared against the whole trimmed string.
const ALLOW = new Set(
  [
    "SC Market",
    "Star Citizen",
    "RSI",
    "aUEC",
    "UEC",
    "SCU",
    "Discord",
    "Citizen iD",
    "CitizenID",
    "Spectrum",
    "Twitch",
    "YouTube",
    "GitHub",
    "Patreon",
    "Ko-fi",
    "OK",
    "ID",
    "URL",
    "API",
    "TOTP",
    "2FA",
    "UTC",
    "SC Orgs",
    "Google",
    "Twitter",
    "X",
    "Reddit",
    "PayPal",
    "Star Citizen Wiki",
    "StarCitizen-API",
    "LadyFleur",
    "SCMDB",
    "UEX",
    "UEXcorp",
    "Erkul",
    "SPViewer",
  ].map((s) => s.toLowerCase()),
)
// Proper nouns stripped from a string before deciding it needs translating,
// so "aUEC (" or "{price} aUEC" do not count but "aUEC available" does.
const NOUN_RE =
  /\b(aUEC|UEC|SCU|RSI|SC Market|SC Orgs|Star Citizen|Citizen iD|Discord)\b/g
const ENTITY_RE =
  /&(nbsp|amp|lt|gt|quot|apos|middot|mdash|ndash|hellip|times|#\d+|#x[0-9a-f]+);/gi

// [area, path regex]; first match wins. The order of AREAS is the traffic
// ranking used for the report.
const AREAS = [
  [
    "home",
    /(^|\/)(landing|home|LandingPage|HomePage|Footer|footer|navbar|sidebar|layout|app\/AppLayout)/i,
  ],
  [
    "auth",
    /(login|signup|sign-up|onboard|authenticate|AuthenticateRSI|Register|auth\/)/i,
  ],
  [
    "market",
    /(market|listing|aggregate|cart|buy-?order|item|blueprint|crafting)/i,
  ],
  ["shop", /(shop|storefront|seller)/i],
  ["orgs", /(contractor|org|recruit|member)/i],
  ["contracts", /(contract|offer|mission|service)/i],
  ["orders", /(order|availability|delivery|fleet)/i],
  ["messages", /(message|chat|notification|inbox)/i],
  ["settings", /(setting|profile|account|preference)/i],
  ["admin", /(admin|moderation)/i],
  ["other", /./],
  ["unused", /$^/], // not imported from any route (dead code)
]
// Admin paths are matched before the others ("pages/admin/AllMarketListings"
// is admin, not market); the display order stays the traffic ranking.
const areaOf = (file) =>
  /(^|\/)admin|moderation/i.test(file)
    ? "admin"
    : AREAS.find(([, re]) => re.test(file))[0]

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith("._") || name === "node_modules") continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (name === "__tests__" || name === "__mocks__" || name === "stories")
        continue
      walk(p, out)
    } else if (
      /\.(tsx|ts)$/.test(name) &&
      !/\.(test|spec|stories|d)\.tsx?$/.test(name)
    ) {
      out.push(p)
    }
  }
  return out
}

/** Is this trimmed string something a translator would translate? */
export function isTranslatable(raw) {
  const s = raw.replace(ENTITY_RE, " ").replace(/\s+/g, " ").trim()
  if (!s) return false
  if (!/[A-Za-z]{2,}/.test(s)) return false // symbols, numbers, single letters
  if (ALLOW.has(s.toLowerCase())) return false
  if (!/[A-Za-z]{2,}/.test(s.replace(NOUN_RE, ""))) return false
  if (/^(https?:|mailto:|\/|#|\.|data:)/.test(s)) return false
  if (/^[\w.-]+@[\w.-]+$/.test(s)) return false // emails
  if (/^[a-z][a-zA-Z0-9]*$/.test(s) && /[A-Z]/.test(s)) return false // camelCase ids
  if (/^[a-z0-9_.-]+$/.test(s) && /[_.]/.test(s)) return false // keys / ids
  if (/^[A-Z0-9_]+$/.test(s) && s.length <= 4) return false // short acronyms
  if (/^[A-Z0-9_-]+$/.test(s) && /[-_]|^[A-Z]{8,}$/.test(s)) return false // CODE-PLACEHOLDERS
  if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(s)) return false // kebab-case ids / slugs
  if (/^@keyframes|^[.#]?[\w-]+\s*\{[^}]*:/.test(s)) return false // CSS
  return true
}

// scripts/i18n-hardcoded-ignore.json: [{ file, text, reason }]. A string is
// ignored only in that file and only with a reason. Shared with eslint.config.js.
const IGNORE_FILE = join(ROOT, "scripts", "i18n-hardcoded-ignore.json")
export const IGNORES = JSON.parse(readFileSync(IGNORE_FILE, "utf8"))
for (const e of IGNORES) {
  if (!e.file || !e.text || !(e.reason ?? "").trim())
    throw new Error(
      `${IGNORE_FILE}: every entry needs file, text and reason: ${JSON.stringify(e)}`,
    )
}
const usedIgnores = new Set()
/** Is `text` (whitespace-collapsed) in `file` (repo-relative) on the ignore list? */
export function isIgnored(file, text) {
  const norm = text.replace(/\s+/g, " ").trim()
  const i = IGNORES.findIndex((e) => e.file === file && e.text === norm)
  if (i >= 0) usedIgnores.add(i)
  return i >= 0
}

function scanFile(file) {
  const text = readFileSync(file, "utf8")
  const sf = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const hits = []
  const rel = relative(ROOT, file).split(sep).join("/")
  const add = (node, kind, value) => {
    if (!isTranslatable(value)) return
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf))
    const text = value.replace(/\s+/g, " ").trim()
    if (isIgnored(rel, text)) return
    hits.push({ line: line + 1, kind, text })
  }
  // The string(s) an expression can evaluate to: literals, both branches of
  // `a ? "x" : "y"`, the right side of `a && "x"` / `a || "x"`, and the
  // static text of a template literal (`Since ${date}` -> "Since").
  const literals = (n) => {
    if (!n) return []
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n))
      return [n.text]
    if (ts.isTemplateExpression(n))
      return [
        [n.head.text, ...n.templateSpans.map((s) => s.literal.text)].join(" "),
      ]
    if (ts.isJsxExpression(n) || ts.isParenthesizedExpression(n))
      return literals(n.expression)
    if (ts.isConditionalExpression(n))
      return [...literals(n.whenTrue), ...literals(n.whenFalse)]
    if (
      ts.isBinaryExpression(n) &&
      (n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        n.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
        n.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
    ) {
      // t("key") || "Fallback": the fallback only shows for a missing key
      const left = n.left
      if (
        ts.isCallExpression(left) &&
        /^(t|i18n\.t)$/.test(left.expression.getText(sf))
      )
        return []
      return literals(n.right)
    }
    return []
  }
  const literal = (n) => {
    const all = literals(n)
    return all.length ? all.join(" / ") : null
  }
  const inAlert = (call) => {
    for (const arg of call.arguments) {
      const v = literal(arg)
      if (v != null) add(arg, "alert", v)
      if (ts.isObjectLiteralExpression(arg)) {
        for (const p of arg.properties) {
          if (
            ts.isPropertyAssignment(p) &&
            /^(message|title|description)$/.test(p.name?.getText(sf) ?? "")
          ) {
            const pv = literal(p.initializer)
            if (pv != null) add(p.initializer, "alert", pv)
          }
        }
      }
    }
  }
  // <style>, <code>, <pre>, <kbd>: not prose
  const inRawTextElement = (node) => {
    // children of <Trans components={{ x: <b>placeholder</b> }} /> are
    // replaced by the translation
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isJsxAttribute(p) && p.name.getText(sf) === "components")
        return true
    }
    const el = node.parent
    if (!el || !ts.isJsxElement(el)) return false
    const tag = el.openingElement.tagName.getText(sf)
    return /^(style|code|pre|kbd|script)$/.test(tag)
  }
  const visit = (node) => {
    if (ts.isJsxText(node)) {
      if (!inRawTextElement(node)) add(node, "jsx-text", node.text)
    } else if (
      ts.isJsxExpression(node) &&
      node.expression &&
      (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
    ) {
      // {cond ? "Yes" : "No"} as a child
      for (const v of literals(node.expression)) add(node, "jsx-text", v)
    } else if (
      ts.isPropertyAssignment(node) &&
      /^["']?aria-label["']?$/.test(node.name.getText(sf))
    ) {
      // inputProps={{ "aria-label": "Sort" }}
      const v = literal(node.initializer)
      if (v != null) add(node, "attr:aria-label", v)
    } else if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(sf)
      if (TEXT_ATTRS.has(name)) {
        for (const v of literals(node.initializer)) add(node, `attr:${name}`, v)
      }
    } else if (ts.isCallExpression(node)) {
      const callee = node.expression
      const name = ts.isIdentifier(callee)
        ? callee.text
        : ts.isPropertyAccessExpression(callee)
          ? callee.name.text
          : ""
      if (ALERT_CALLS.has(name)) inAlert(node)
    } else if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      node.left.getText(sf) === "document.title"
    ) {
      const v = literal(node.right)
      if (v != null) add(node, "document.title", v)
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return hits
}

// Files reachable from the route table and app shell through relative
// imports. Unreachable files are dead code and are reported separately.
const ENTRIES = [
  "src/root.tsx",
  "src/entry.client.tsx",
  "src/routes.ts",
  "src/app/pages.ts",
]
const IMPORT_RE = /(?:from\s+|import\s*\(\s*|import\s+)["'](\.[^"']+)["']/g
function resolveImport(fromFile, spec) {
  const base = join(dirname(fromFile), spec)
  for (const c of [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    join(base, "index.tsx"),
    join(base, "index.ts"),
  ]) {
    try {
      if (statSync(c).isFile()) return c
    } catch {
      /* next candidate */
    }
  }
  return null
}
export function reachable() {
  const seen = new Set()
  const queue = ENTRIES.map((e) => join(ROOT, e))
  for (const d of ["src/routes"]) queue.push(...walk(join(ROOT, d)))
  while (queue.length) {
    const f = queue.pop()
    if (!f || seen.has(f) || !/\.(tsx?|mts)$/.test(f)) continue
    seen.add(f)
    let text
    try {
      text = readFileSync(f, "utf8")
    } catch {
      continue
    }
    for (const m of text.matchAll(IMPORT_RE)) {
      const r = resolveImport(f, m[1])
      if (r && !seen.has(r)) queue.push(r)
    }
  }
  return seen
}

export function scan() {
  const live = reachable()
  const results = []
  for (const file of walk(SRC)) {
    const rel = relative(ROOT, file).split(sep).join("/")
    const hits = scanFile(file)
    if (hits.length)
      results.push({
        file: rel,
        area: live.has(file) ? areaOf(rel.replace(/^src\//, "")) : "unused",
        hits,
      })
  }
  return results
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  const args = process.argv.slice(2)
  const opt = (name) => {
    const i = args.indexOf(name)
    return i >= 0 ? args[i + 1] : undefined
  }
  const onlyArea = opt("--area")
  const max = Number(opt("--max") ?? 25)
  let results = scan()
  if (args.includes("--check")) {
    let total = 0
    for (const r of results)
      for (const h of r.hits) {
        total++
        console.log(
          `::error file=${r.file},line=${h.line}::Hard-coded UI text (${h.kind}) ${JSON.stringify(h.text)}: ` +
            "use t() with a key in src/locales/en/english.json (or, if it is not user-facing, add it to scripts/i18n-hardcoded-ignore.json with a reason)",
        )
      }
    const stale = IGNORES.filter((_, i) => !usedIgnores.has(i))
    for (const e of stale)
      console.log(
        `::error file=scripts/i18n-hardcoded-ignore.json::Stale ignore entry (no longer matches ${e.file}): ${JSON.stringify(e.text)}`,
      )
    console.log(
      `Hard-coded UI strings: ${total}; ignore list: ${IGNORES.length} entries, ${stale.length} stale.`,
    )
    process.exit(total || stale.length ? 1 : 0)
  }
  if (onlyArea) results = results.filter((r) => r.area === onlyArea)
  if (args.includes("--json")) {
    console.log(JSON.stringify(results, null, 2))
  } else {
    const byArea = new Map(
      AREAS.map(([a]) => [a, { files: 0, hits: 0, kinds: {} }]),
    )
    for (const r of results) {
      const a = byArea.get(r.area)
      a.files++
      a.hits += r.hits.length
      for (const h of r.hits) {
        const k = h.kind.startsWith("attr:") ? "attr" : h.kind
        a.kinds[k] = (a.kinds[k] ?? 0) + 1
      }
    }
    const total = results.reduce((n, r) => n + r.hits.length, 0)
    console.log(
      `Hard-coded user-facing strings: ${total} in ${results.length} files`,
    )
    console.log(
      "area        files  strings  (jsx-text / attr / alert / document.title)",
    )
    for (const [area, a] of byArea) {
      if (!a.hits) continue
      const k = a.kinds
      console.log(
        `${area.padEnd(10)} ${String(a.files).padStart(6)} ${String(a.hits).padStart(8)}  ` +
          `(${k["jsx-text"] ?? 0} / ${k.attr ?? 0} / ${k.alert ?? 0} / ${k["document.title"] ?? 0})`,
      )
    }
    if (args.includes("--files") || args.includes("--list")) {
      const order = (a) => AREAS.findIndex(([n]) => n === a)
      const sorted = [...results].sort(
        (x, y) =>
          order(x.area) - order(y.area) || y.hits.length - x.hits.length,
      )
      console.log("")
      for (const r of sorted.slice(
        0,
        args.includes("--list") ? Infinity : max,
      )) {
        console.log(
          `${String(r.hits.length).padStart(4)}  [${r.area}] ${r.file}`,
        )
        if (args.includes("--list")) {
          for (const h of r.hits)
            console.log(
              `        ${r.file}:${h.line}  ${h.kind}  ${JSON.stringify(h.text)}`,
            )
        }
      }
    }
  }
}
