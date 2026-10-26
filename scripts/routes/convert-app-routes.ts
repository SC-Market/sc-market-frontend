/**
 * Migration converter (Phase 2, see scripts/routes/README.md): the old
 * src/App.tsx `routes` (RouteObject[]) → React Router framework-mode route
 * config (src/routes.ts), the route modules (src/routes/pages, elements,
 * layouts), src/app/pages.ts and src/app/shell.ts.
 *
 * Only for porting a branch that still edits the old App.tsx: put that
 * App.tsx back at src/App.tsx, then from the frontend root
 *   npx tsx scripts/routes/convert-app-routes.ts && rm src/App.tsx
 * It overwrites the generated files; hand edits made since (prerender
 * loaders, new routes) must be re-applied. New routes are added by hand.
 */
import ts from "typescript"
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const APP = path.join(ROOT, "src/App.tsx")
const SRC = path.join(ROOT, "src")
const OUT = path.join(SRC, "routes")

const text = fs.readFileSync(APP, "utf8")
const sf = ts.createSourceFile(
  APP,
  text,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
)

// ── imports of App.tsx: local name → { specifier, imported } ─────────────────
const imports = new Map<string, { spec: string; imported: string }>()
for (const st of sf.statements) {
  if (!ts.isImportDeclaration(st) || !st.importClause) continue
  const spec = (st.moduleSpecifier as ts.StringLiteral).text
  const nb = st.importClause.namedBindings
  if (st.importClause.name)
    imports.set(st.importClause.name.text, { spec, imported: "default" })
  if (nb && ts.isNamedImports(nb)) {
    for (const el of nb.elements) {
      imports.set(el.name.text, {
        spec,
        imported: (el.propertyName ?? el.name).text,
      })
    }
  }
}

function relSpec(fromFile: string, spec: string): string {
  if (!spec.startsWith("."))
    return spec === "react-router-dom" ? "react-router" : spec
  const abs = path.resolve(path.dirname(APP), spec)
  let rel = path.relative(path.dirname(fromFile), abs).split(path.sep).join("/")
  if (!rel.startsWith(".")) rel = "./" + rel
  return rel
}

// ── find `export const routes = [...]` ──────────────────────────────────────
let routesArray: ts.ArrayLiteralExpression | undefined
for (const st of sf.statements) {
  if (!ts.isVariableStatement(st)) continue
  for (const d of st.declarationList.declarations) {
    if (
      ts.isIdentifier(d.name) &&
      d.name.text === "routes" &&
      d.initializer &&
      ts.isArrayLiteralExpression(d.initializer)
    ) {
      routesArray = d.initializer
    }
  }
}
if (!routesArray) throw new Error("routes array not found")

type Prop = { name: string; node: ts.Expression }
function props(obj: ts.ObjectLiteralExpression): Map<string, ts.Expression> {
  const m = new Map<string, ts.Expression>()
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p))
      m.set((p.name as ts.Identifier).text, p.initializer)
    else if (ts.isMethodDeclaration(p) || ts.isShorthandPropertyAssignment(p))
      throw new Error("unsupported prop " + p.getText())
  }
  return m
}
const src = (n: ts.Node) => n.getText(sf)

function unwrapChildren(e: ts.Expression): ts.ArrayLiteralExpression {
  if (ts.isArrayLiteralExpression(e)) return e
  if (
    ts.isCallExpression(e) &&
    ts.isIdentifier(e.expression) &&
    e.expression.text === "withPageHydrateFallback"
  ) {
    return unwrapChildren(e.arguments[0])
  }
  throw new Error("unsupported children: " + src(e).slice(0, 80))
}

// identifiers used in a JSX/expression snippet that come from App.tsx imports
function usedImports(n: ts.Node): string[] {
  const names = new Set<string>()
  const visit = (x: ts.Node) => {
    if (ts.isIdentifier(x) && imports.has(x.text)) {
      // skip property names in JSX attributes / object keys
      const p = x.parent
      if (p && ts.isJsxAttribute(p) && p.name === x) return
      if (p && ts.isPropertyAssignment(p) && p.name === x) return
      names.add(x.text)
    }
    ts.forEachChild(x, visit)
  }
  visit(n)
  return [...names]
}

function importLines(file: string, names: string[]): string[] {
  const bySpec = new Map<string, string[]>()
  for (const name of names) {
    const imp = imports.get(name)!
    const spec = relSpec(file, imp.spec)
    const entry =
      imp.imported === "default"
        ? `default as ${name}`
        : imp.imported === name
          ? name
          : `${imp.imported} as ${name}`
    bySpec.set(spec, [...(bySpec.get(spec) ?? []), entry])
  }
  return [...bySpec].map(
    ([spec, list]) => `import { ${list.sort().join(", ")} } from "${spec}"`,
  )
}

// ── module registry (dedupe identical generated modules) ─────────────────────
interface Mod {
  file: string
  code: string
  uses: number
}
const modules = new Map<string, Mod>() // key → module
const usedFiles = new Set<string>()
function uniqueFile(dir: string, base: string): string {
  let name = base
  let i = 2
  while (usedFiles.has(`${dir}/${name}`)) name = `${base}${i++}`
  usedFiles.add(`${dir}/${name}`)
  return `${dir}/${name}`
}

// Pages the route modules load (src/app/pages.ts), by name.
const pageEntries = new Map<string, { spec: string; exportName: string }>()

// Components the route modules get from the app shell (src/app/shell.ts), by name.
const shellNames = new Set<string>()
function shellName(tag: string): string {
  if (!imports.has(tag)) throw new Error("unknown component " + tag)
  shellNames.add(tag)
  return tag
}

function errorBoundaryExport(
  errorElement: ts.Expression | undefined,
): string[] {
  if (!errorElement) return []
  if (
    !ts.isJsxSelfClosingElement(errorElement) ||
    errorElement.attributes.properties.length
  ) {
    throw new Error("unsupported errorElement " + src(errorElement))
  }
  return [
    `export const ErrorBoundary = shellComponent("${shellName(src(errorElement.tagName))}")`,
  ]
}

const HEADER = (what: string) =>
  `// Route module: ${what}. Wired up in src/routes.ts.\n`

function pageModule(
  lazy: ts.Expression,
  errorElement: ts.Expression | undefined,
  opts: { standalone: boolean; routePath: string },
): string {
  const t = src(lazy)
  const m = /import\("([^"]+)"\)\)\s*\)\s*\.\s*(\w+)/.exec(t)
  if (!m) throw new Error("unsupported lazy: " + t.slice(0, 200))
  const [, spec, exportName] = m
  const propsMatch = /createElement\(\s*component\s*,\s*(\{[^}]*\})\s*\)/.exec(
    t,
  )
  const simple =
    /^async \(\) => \(\{\s*Component:\s*\(\s*await retryDynamicImport\(\(\) => import\("[^"]+"\)\)\s*\)\s*\.\s*\w+,?\s*\}\)$/s.test(
      t,
    )
  if (!simple && !propsMatch) throw new Error("unrecognised lazy shape: " + t)
  const propsText = propsMatch ? propsMatch[1].replace(/\s+/g, " ") : ""
  const key = `page|${spec}|${exportName}|${propsText}|${errorElement ? src(errorElement) : ""}|${opts.standalone}`
  const existing = modules.get(key)
  if (existing) {
    existing.uses++
    return existing.file
  }
  const name = exportName === "default" ? path.basename(spec) : exportName
  const base =
    name +
    (propsText
      ? "." +
        propsText
          .replace(/[{}\s:]/g, "")
          .replace(/,/g, ".")
          .replace(/true/g, "")
      : "") +
    (errorElement ? ".ErrorBoundary" : "")
  const file = uniqueFile("routes/pages", base)
  const existingPage = pageEntries.get(name)
  if (existingPage && existingPage.spec !== spec)
    throw new Error(`page name clash: ${name}`)
  pageEntries.set(name, { spec, exportName })
  const options = [
    propsText ? `props: ${propsText}` : "",
    opts.standalone ? `fallback: null` : "",
  ].filter(Boolean)
  const lines = [
    HEADER(`the ${name} page`),
    `import { definePage } from "../definePage"`,
    ...(errorElement ? [`import { shellComponent } from "../shell"`] : []),
    ``,
    ...errorBoundaryExport(errorElement),
    `const page = definePage("${name}"${options.length ? `, { ${options.join(", ")} }` : ""})`,
    ``,
    `export const clientLoader = page.clientLoader`,
    `export const shouldRevalidate = page.shouldRevalidate`,
    `export default page.Component`,
    ``,
  ]
  modules.set(key, { file, code: lines.join("\n"), uses: 1 })
  return file
}

function elementModule(
  element: ts.Expression,
  errorElement: ts.Expression | undefined,
  hasChildren: boolean,
): string {
  let el = element
  if (ts.isParenthesizedExpression(el)) el = el.expression
  const key = `el|${src(el).replace(/\s+/g, " ")}|${errorElement ? src(errorElement) : ""}|${hasChildren}`
  const existing = modules.get(key)
  if (existing) {
    existing.uses++
    return existing.file
  }
  if (ts.isJsxElement(el)) {
    // The app layout (HookProvider > … > Outlet): hand-written module.
    if (src(el.openingElement.tagName) !== "HookProvider")
      throw new Error("unsupported JSX element: " + src(el).slice(0, 80))
    if (!errorElement || src(errorElement) !== "<FrontendErrorElement />")
      throw new Error("app layout errorElement changed")
    shellNames.add("FrontendErrorElement")
    modules.set(key, {
      file: "routes/layouts/AppLayout",
      code: [
        HEADER("the app layout (src/app/AppLayout.tsx)"),
        `import { shellComponent } from "../shell"`,
        ``,
        `export default shellComponent("AppLayout")`,
        `export const ErrorBoundary = shellComponent("FrontendErrorElement")`,
        ``,
      ].join("\n"),
      uses: 1,
    })
    return "routes/layouts/AppLayout"
  }
  if (!ts.isJsxSelfClosingElement(el))
    throw new Error("unsupported element " + src(el))
  const tag = src(el.tagName)
  const attrs = el.attributes.properties
  const dir = hasChildren ? "routes/layouts" : "routes/elements"
  const suffix = attrs
    .map((a) => {
      if (!ts.isJsxAttribute(a)) throw new Error("spread attr")
      const v = a.initializer
      let value = ""
      if (!v) value = ""
      else if (ts.isStringLiteral(v)) value = v.text
      else if (ts.isJsxExpression(v) && v.expression)
        value = ts.isStringLiteral(v.expression)
          ? v.expression.text
          : src(v.expression)
      const n = (a.name as ts.Identifier).text
      if (n === "replace") return ""
      return value
        .replace(/^\//, "")
        .replace(/[^A-Za-z0-9]+/g, "-")
        .replace(/-$/, "")
    })
    .filter(Boolean)
    .join(".")
  const file = uniqueFile(
    dir,
    tag + (suffix ? "." + suffix : "") + (errorElement ? ".ErrorBoundary" : ""),
  )
  const abs = path.join(SRC, file + ".tsx")
  const names = usedImports(el).filter((n) => n !== tag)
  let lines: string[]
  if (tag === "Navigate") {
    lines = [
      HEADER(`renders ${src(el)}`),
      `import { Navigate } from "react-router-dom"`,
      ...(errorElement ? [`import { shellComponent } from "../shell"`] : []),
      ``,
      ...errorBoundaryExport(errorElement),
      `export default function Redirect() {`,
      `  return ${src(el)}`,
      `}`,
      ``,
    ]
  } else if (attrs.length === 0) {
    lines = [
      HEADER(hasChildren ? `<${tag}> layout` : `renders <${tag} />`),
      `import { shellComponent } from "../shell"`,
      ``,
      `export default shellComponent("${shellName(tag)}")`,
      ...errorBoundaryExport(errorElement),
      ``,
    ]
  } else {
    // Keep the component's name (route tests and devtools label layouts by it).
    lines = [
      HEADER(hasChildren ? `<${tag}> layout` : `renders ${src(el)}`),
      `import { shellComponent } from "../shell"`,
      ...importLines(abs, names),
      ``,
      `const ${tag}Component = shellComponent("${shellName(tag)}")`,
      ...errorBoundaryExport(errorElement),
      ``,
      `export default function ${tag}() {`,
      `  return ${src(el).replace(new RegExp(`^<${tag}\\b`), `<${tag}Component`)}`,
      `}`,
      ``,
    ]
  }
  modules.set(key, { file, code: lines.join("\n"), uses: 1 })
  return file
}

// ── walk ─────────────────────────────────────────────────────────────────────
interface Entry {
  id: string
  file: string
  path?: string
  index?: true
  children?: Entry[]
}
const idCounts = new Map<string, number>()
function makeId(file: string): string {
  const n = (idCounts.get(file) ?? 0) + 1
  idCounts.set(file, n)
  return n === 1 ? file : `${file}~${n}`
}

let leafCount = 0
function walk(arr: ts.ArrayLiteralExpression, standalone: boolean): Entry[] {
  return arr.elements.map((node) => {
    if (!ts.isObjectLiteralExpression(node)) throw new Error("non-object route")
    const p = props(node)
    for (const k of p.keys()) {
      if (
        ![
          "path",
          "index",
          "element",
          "errorElement",
          "HydrateFallback",
          "lazy",
          "children",
        ].includes(k)
      )
        throw new Error("unsupported key " + k)
    }
    const pathExpr = p.get("path")
    const routePath =
      pathExpr && ts.isStringLiteral(pathExpr) ? pathExpr.text : undefined
    if (pathExpr && routePath === undefined) throw new Error("non-literal path")
    const index = p.get("index")?.kind === ts.SyntaxKind.TrueKeyword
    const childrenExpr = p.get("children")
    const element = p.get("element")
    const lazy = p.get("lazy")
    const errorElement = p.get("errorElement")
    const hydrate = p.get("HydrateFallback")
    if (hydrate && src(hydrate) !== "InitialLoadFallback")
      throw new Error("unexpected HydrateFallback " + src(hydrate))
    let file: string
    if (lazy && element) throw new Error("lazy+element")
    // A standalone route (outside the app layout) has no RouteSuspense above it.
    const isTopLevel = arr === routesArray
    if (lazy)
      file = pageModule(lazy, errorElement, {
        standalone: isTopLevel,
        routePath: routePath ?? "",
      })
    else if (element)
      file = elementModule(element, errorElement, !!childrenExpr)
    else
      throw new Error("route without element/lazy: " + src(node).slice(0, 80))
    const entry: Entry = { id: makeId(file), file: file + ".tsx" }
    if (routePath !== undefined) entry.path = routePath
    if (index) entry.index = true
    if (childrenExpr) entry.children = walk(unwrapChildren(childrenExpr), false)
    else leafCount++
    return entry
  })
}

const tree = walk(routesArray, true)

// ── write ────────────────────────────────────────────────────────────────────
for (const dir of ["pages", "elements"])
  fs.rmSync(path.join(OUT, dir), { recursive: true, force: true })
for (const f of fs.existsSync(path.join(OUT, "layouts"))
  ? fs.readdirSync(path.join(OUT, "layouts"))
  : []) {
  fs.rmSync(path.join(OUT, "layouts", f))
}
for (const mod of modules.values()) {
  if (!mod.code) continue
  const abs = path.join(SRC, mod.file + ".tsx")
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, mod.code)
}

{
  const shellFile = path.join(SRC, "app/shell.ts")
  const names = [...shellNames].sort()
  const lines = [
    `/**`,
    ` * The app shell: the components the root and the route modules render`,
    ` * (src/root.tsx, src/routes/{layouts,elements}), provided to them by name`,
    ` * (src/routes/shell.ts). Only entry.client.tsx imports this (and the tests`,
    ` * that mount the route table), so the shell is bundled with the client`,
    ` * entry and the route modules stay tiny. Add a component here when a route`,
    ` * module needs one.`,
    ` */`,
    `// i18next is set up before anything renders.`,
    `import "../util/i18n"`,
    `import { App } from "./App"`,
    `import { AppLayout } from "./AppLayout"`,
    ...importLines(shellFile, names),
    ``,
    `export const shell = {`,
    `  App,`,
    `  AppLayout,`,
    ...names.map((n) => `  ${n},`),
    `}`,
    ``,
  ]
  fs.writeFileSync(shellFile, lines.join("\n"))
}

{
  const pagesFile = path.join(SRC, "app/pages.ts")
  const lines = [
    `/**`,
    ` * Every page a route renders (src/routes/pages/*: definePage("Name")): the`,
    ` * chunk to load and the export to render. Only the client entry imports`,
    ` * this (see src/routes/definePage.tsx for why the import()s live here).`,
    ` */`,
    `import { pageEntry } from "../routes/definePage"`,
    ``,
    `export const pages = {`,
    ...[...pageEntries]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([name, { spec, exportName }]) =>
          `  ${name}: pageEntry(() => import("${relSpec(pagesFile, spec)}"), (m) => m.${exportName}),`,
      ),
    `}`,
    ``,
  ]
  fs.writeFileSync(pagesFile, lines.join("\n"))
}

function emit(entries: Entry[], indent: string): string {
  return entries
    .map((e) => {
      const parts = [`id: ${JSON.stringify(e.id)}`]
      if (e.path !== undefined) parts.push(`path: ${JSON.stringify(e.path)}`)
      if (e.index) parts.push(`index: true`)
      parts.push(`file: ${JSON.stringify(e.file)}`)
      if (!e.children) return `${indent}{ ${parts.join(", ")} },`
      return `${indent}{\n${indent}  ${parts.join(",\n" + indent + "  ")},\n${indent}  children: [\n${emit(e.children, indent + "    ")}\n${indent}  ],\n${indent}},`
    })
    .join("\n")
}

const routesTs = `/**
 * The app's route table (React Router framework mode, SPA: see
 * react-router.config.ts and docs/ssr-migration-design.md, Phase 2).
 *
 * Every route is a module under src/routes/: pages/ (a lazily loaded page,
 * see definePage.tsx), elements/ (a redirect or an eagerly loaded element),
 * layouts/ (guards and the app layout). The id of a route is its file
 * without the extension; a module used by several routes gets "~2", "~3"…
 * on the later ones (entry.client.tsx maps ids back to modules that way).
 *
 * Order matters only where React Router's ranking ties (see
 * src/router/__tests__/routes.table.test.ts).
 */
import type { RouteConfig } from "@react-router/dev/routes"

export default [
${emit(tree, "  ")}
] satisfies RouteConfig
`
fs.writeFileSync(path.join(SRC, "routes.ts"), routesTs)
console.log(
  `routes: ${leafCount} leaves, ${[...modules.values()].filter((m) => m.code).length} generated modules`,
)
import { execSync } from "node:child_process"
execSync(
  "npx prettier --write src/routes.ts src/app/shell.ts src/app/pages.ts src/routes/pages src/routes/elements src/routes/layouts",
  { stdio: "inherit" },
)
