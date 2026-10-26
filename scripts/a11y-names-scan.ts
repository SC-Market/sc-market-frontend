/**
 * Static accessible-name scan: finds interactive controls in src/**\/*.tsx that
 * have no accessible name in their JSX. Complements the runtime audit
 * (e2e/a11y/names.spec.ts), which only sees what the fake API renders; this
 * one sees every control in the source, rendered or not.
 *
 *   npx tsx scripts/a11y-names-scan.ts            # summary by area
 *   npx tsx scripts/a11y-names-scan.ts --list     # every finding
 *   npx tsx scripts/a11y-names-scan.ts --check    # exit 1 if any file has
 *                                                 # more than its baseline
 *   npx tsx scripts/a11y-names-scan.ts --update   # rewrite the baseline
 *
 * Baseline: scripts/a11y-names-baseline.json (findings per file). A finding is
 * a heuristic, not proof; when the name really comes from somewhere the scan
 * can't see, give the control an explicit aria-label (that is the convention
 * anyway, see docs/testing-with-mcp.md).
 *
 * Rules (a control is named if any listed attribute is present, or it has a
 * `{...spread}` the scan can't see into):
 * - IconButton, Fab, ToggleButton, <button>: aria-label, aria-labelledby,
 *   title, visible text children, or a parent <Tooltip title>.
 * - TextField: label, aria-label(ledby), placeholder, inputProps, slotProps.
 * - Select: labelId, aria-label(ledby), inputProps, SelectDisplayProps,
 *   slotProps, or a parent <TextField select>.
 * - Checkbox, Switch, Radio, Slider: aria-label(ledby), inputProps,
 *   slotProps, getAriaLabel, or used as a FormControlLabel `control`.
 * - <input> (not hidden), <select>, <textarea>: aria-label(ledby), id (a
 *   <label htmlFor>), title, placeholder (inputs/textarea only).
 */
import {
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  appendFileSync,
} from "node:fs"
import { dirname, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const SRC = resolve(ROOT, "src")
const BASELINE_FILE = resolve(ROOT, "scripts/a11y-names-baseline.json")

export interface Finding {
  file: string
  line: number
  tag: string
}

const ICON_LIKE = new Set([
  "IconButton",
  "HapticIconButton",
  "Fab",
  "ToggleButton",
  "button",
])
const TOGGLES = new Set(["Checkbox", "Switch", "Radio", "Slider"])
const NAME_ATTRS = ["aria-label", "aria-labelledby"]

function files(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name)
    if (statSync(p).isDirectory()) {
      if (name === "__tests__" || name === "node_modules") continue
      out.push(...files(p))
    } else if (
      /\.tsx$/.test(name) &&
      !/\.(test|spec|stories)\.tsx$/.test(name)
    ) {
      out.push(p)
    }
  }
  return out
}

function tagName(node: ts.JsxOpeningLikeElement, sf: ts.SourceFile): string {
  return node.tagName.getText(sf)
}

function attrs(node: ts.JsxOpeningLikeElement, sf: ts.SourceFile) {
  const names = new Set<string>()
  let spread = false
  for (const p of node.attributes.properties) {
    if (ts.isJsxSpreadAttribute(p)) spread = true
    else names.add(p.name.getText(sf))
  }
  return { names, spread }
}

/** The JSX element directly enclosing this one (skipping {expr} wrappers). */
function parentElement(node: ts.Node): ts.JsxElement | null {
  let p: ts.Node | undefined = node.parent
  // opening -> element
  if (p && ts.isJsxElement(p) && p.openingElement === node) p = p.parent
  while (
    p &&
    (ts.isJsxExpression(p) ||
      ts.isParenthesizedExpression(p) ||
      ts.isConditionalExpression(p) ||
      ts.isBinaryExpression(p))
  )
    p = p.parent
  return p && ts.isJsxElement(p) ? p : null
}

/** Used as the value of an attribute, e.g. FormControlLabel control={<Switch />}. */
function attributeOwner(
  node: ts.Node,
  sf: ts.SourceFile,
): { tag: string; attr: string } | null {
  let p: ts.Node | undefined = node.parent
  if (p && ts.isJsxElement(p)) p = p.parent
  while (
    p &&
    (ts.isParenthesizedExpression(p) || ts.isConditionalExpression(p))
  )
    p = p.parent
  if (p && ts.isJsxExpression(p) && p.parent && ts.isJsxAttribute(p.parent)) {
    const attr = p.parent
    const opening = attr.parent.parent as ts.JsxOpeningLikeElement
    return { tag: tagName(opening, sf), attr: attr.name.getText(sf) }
  }
  return null
}

function hasTextChildren(el: ts.JsxElement | null, sf: ts.SourceFile): boolean {
  if (!el) return false
  for (const child of el.children) {
    if (ts.isJsxText(child) && child.getText(sf).trim()) return true
    if (ts.isJsxExpression(child) && child.expression) {
      const text = child.expression.getText(sf)
      // {t("...")}, {"text"}, {label}, {`...`}: assume text.
      if (!/^</.test(text.trim())) return true
    }
    if (ts.isJsxElement(child) && hasTextChildren(child, sf)) return true
  }
  return false
}

function hasAny(names: Set<string>, list: string[]) {
  return list.some((n) => names.has(n))
}

export function scan(): Finding[] {
  const findings: Finding[] = []
  for (const file of files(SRC)) {
    const sf = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    const visit = (node: ts.Node) => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = tagName(node, sf)
        const { names, spread } = attrs(node, sf)
        const element = ts.isJsxOpeningElement(node)
          ? (node.parent as ts.JsxElement)
          : null
        const parent = parentElement(node)
        const parentTag = parent ? tagName(parent.openingElement, sf) : null
        const parentAttrs = parent
          ? attrs(parent.openingElement, sf).names
          : new Set<string>()
        let named = true
        if (spread) named = true
        else if (ICON_LIKE.has(tag)) {
          named =
            hasAny(names, [...NAME_ATTRS, "title"]) ||
            hasTextChildren(element, sf) ||
            (parentTag === "Tooltip" && parentAttrs.has("title"))
        } else if (tag === "TextField") {
          named = hasAny(names, [
            "label",
            ...NAME_ATTRS,
            "placeholder",
            "inputProps",
            "slotProps",
            "InputProps",
          ])
        } else if (tag === "Select") {
          named = hasAny(names, [
            "labelId",
            ...NAME_ATTRS,
            "inputProps",
            "SelectDisplayProps",
            "slotProps",
            "native",
          ])
        } else if (TOGGLES.has(tag)) {
          const owner = attributeOwner(node, sf)
          named =
            hasAny(names, [
              ...NAME_ATTRS,
              "inputProps",
              "slotProps",
              "getAriaLabel",
            ]) ||
            (owner?.tag === "FormControlLabel" && owner.attr === "control")
        } else if (tag === "input") {
          const typeAttr = node.attributes.properties.find(
            (p): p is ts.JsxAttribute =>
              ts.isJsxAttribute(p) && p.name.getText(sf) === "type",
          )
          const type =
            typeAttr?.initializer && ts.isStringLiteral(typeAttr.initializer)
              ? typeAttr.initializer.text
              : ""
          named =
            type === "hidden" ||
            type === "file" ||
            hasAny(names, [
              ...NAME_ATTRS,
              "id",
              "title",
              "placeholder",
              "hidden",
            ]) ||
            parentTag === "label"
        } else if (tag === "select" || tag === "textarea") {
          named =
            hasAny(names, [
              ...NAME_ATTRS,
              "id",
              "title",
              ...(tag === "textarea" ? ["placeholder"] : []),
            ]) || parentTag === "label"
        }
        if (!named) {
          findings.push({
            file: relative(ROOT, file),
            line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
            tag,
          })
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(sf)
  }
  return findings
}

export const AREAS: [string, RegExp][] = [
  ["market", /\/(market|cart|listings?|buyorders?|bulk|sell)[/A-Z]/i],
  [
    "orders",
    /\/(orders?|offers?|contracting|contracts?|deliver(y|ies)|chats|messag\w*|dashboard|notifications?|customers|send|widget|transactions)[/A-Z]/i,
  ],
  [
    "settings",
    /\/(settings|people|profile|mfa|email|push|onboarding|availability|authentication|api-tokens|integrations)[/A-Z]/i,
  ],
  ["orgs", /\/(contractors?|orgs?|recruiting|members)[/A-Z]/i],
  ["shops", /\/shops?[/A-Z]/i],
  [
    "game data",
    /\/(wiki|missions?|blueprints?|mining|crafting|game-data|inventory|fleet|ships|resources|starmap|shopping-lists?|commodities)[/A-Z]/i,
  ],
  ["guides", /\/(help|guides|about|content)[/A-Z]/i],
  ["admin", /\/admin[/A-Z]/i],
]

export function areaOf(file: string): string {
  return AREAS.find(([, re]) => re.test(`/${file}`))?.[0] ?? "shared"
}

function main() {
  const args = process.argv.slice(2)
  const findings = scan()
  const byFile = new Map<string, number>()
  for (const f of findings) byFile.set(f.file, (byFile.get(f.file) ?? 0) + 1)
  const byArea = new Map<string, number>()
  for (const f of findings)
    byArea.set(areaOf(f.file), (byArea.get(areaOf(f.file)) ?? 0) + 1)

  const lines = [
    `## Static accessible-name scan`,
    "",
    `**${findings.length} unlabeled controls** in ${byFile.size} files`,
    "",
    "| Area | Unlabeled controls |",
    "| --- | ---: |",
    ...[...AREAS.map(([a]) => a), "shared"].map(
      (a) => `| ${a} | ${byArea.get(a) ?? 0} |`,
    ),
    "",
  ]
  if (args.includes("--list"))
    for (const f of findings) lines.push(`- ${f.file}:${f.line} <${f.tag}>`)
  const summary = lines.join("\n")
  console.log(summary)
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + "\n")

  if (args.includes("--update")) {
    const baseline = Object.fromEntries([...byFile.entries()].sort())
    writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2) + "\n")
    console.log(`Wrote ${relative(ROOT, BASELINE_FILE)}`)
  }
  if (args.includes("--check")) {
    const baseline: Record<string, number> = JSON.parse(
      readFileSync(BASELINE_FILE, "utf8"),
    )
    const over = [...byFile.entries()].filter(
      ([file, n]) => n > (baseline[file] ?? 0),
    )
    if (over.length) {
      console.error("\nMore unlabeled controls than the baseline allows:")
      for (const [file, n] of over) {
        console.error(`  ${file}: ${n} (baseline ${baseline[file] ?? 0})`)
        for (const f of findings.filter((x) => x.file === file))
          console.error(`    ${f.file}:${f.line} <${f.tag}>`)
      }
      process.exit(1)
    }
    console.log("No file has more unlabeled controls than its baseline.")
  }
}

main()
