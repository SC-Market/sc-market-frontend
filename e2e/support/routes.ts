/**
 * Every leaf route of the app (from the `routes` array in src/App.tsx, read
 * with the TypeScript compiler like scripts/route-crawl.mjs does), turned
 * into a concrete URL with the route regression harness's fixture params and
 * the session the harness uses for it (logged in behind LoggedInRoute).
 */
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"
import {
  PARAM_VALUES,
  PATTERN_PARAM_OVERRIDES,
  type SessionKind,
} from "../../src/router/__tests__/regression/fixtures"

const HERE = dirname(fileURLToPath(import.meta.url))

export interface AppRoute {
  pattern: string
  url: string
  session: SessionKind
}

const APP_TSX = resolve(HERE, "../../src/App.tsx")

function readLeaves(): { pattern: string; loggedIn: boolean }[] {
  const sf = ts.createSourceFile(
    APP_TSX,
    readFileSync(APP_TSX, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  let routesArray: ts.ArrayLiteralExpression | null = null
  const find = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText(sf) === "routes" &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      routesArray = node.initializer
    }
    if (!routesArray) ts.forEachChild(node, find)
  }
  find(sf)
  if (!routesArray) throw new Error("no `routes` array in src/App.tsx")

  const prop = (obj: ts.ObjectLiteralExpression, name: string) =>
    obj.properties.find(
      (p): p is ts.PropertyAssignment =>
        ts.isPropertyAssignment(p) && p.name.getText(sf) === name,
    )
  const join = (parent: string, child: string | undefined) => {
    if (child === undefined) return parent
    if (child.startsWith("/")) return child
    return `${parent.replace(/\/$/, "")}/${child}`
  }
  // `children: withPageHydrateFallback([...])` wraps the page list.
  const childArray = (
    init: ts.Expression,
  ): ts.ArrayLiteralExpression | null => {
    if (ts.isArrayLiteralExpression(init)) return init
    if (ts.isCallExpression(init) && init.arguments[0])
      return childArray(init.arguments[0])
    return null
  }

  const leaves: { pattern: string; loggedIn: boolean }[] = []
  const walk = (
    array: ts.ArrayLiteralExpression,
    parentPath: string,
    loggedIn: boolean,
  ) => {
    for (const el of array.elements) {
      if (!ts.isObjectLiteralExpression(el)) continue
      const pathProp = prop(el, "path")
      const indexProp = prop(el, "index")
      const childrenProp = prop(el, "children")
      const elementProp = prop(el, "element")
      const isIndex = indexProp?.initializer.kind === ts.SyntaxKind.TrueKeyword
      const path = isIndex
        ? parentPath
        : join(
            parentPath,
            pathProp && ts.isStringLiteralLike(pathProp.initializer)
              ? pathProp.initializer.text
              : undefined,
          )
      const guarded =
        loggedIn ||
        (!!elementProp &&
          /^<LoggedInRoute\b/.test(elementProp.initializer.getText(sf)))
      const children = childrenProp && childArray(childrenProp.initializer)
      if (children) walk(children, path, guarded)
      else leaves.push({ pattern: path || "/", loggedIn: guarded })
    }
  }
  walk(routesArray, "", false)
  const seen = new Set<string>()
  return leaves.filter((l) => !seen.has(l.pattern) && seen.add(l.pattern))
}

export function fillPattern(pattern: string): string {
  const overrides = PATTERN_PARAM_OVERRIDES[pattern] ?? {}
  return pattern
    .split("/")
    .map((segment) => {
      if (segment === "*") return "__unmatched/deep/path"
      if (!segment.startsWith(":")) return segment
      const name = segment.slice(1).replace(/\?$/, "")
      const value = overrides[name] ?? PARAM_VALUES[name]
      if (value === undefined)
        throw new Error(`No fixture value for :${name} (${pattern})`)
      return encodeURIComponent(value)
    })
    .join("/")
}

export function appRoutes(): AppRoute[] {
  return readLeaves().map(({ pattern, loggedIn }) => ({
    pattern,
    url: fillPattern(pattern),
    session: loggedIn ? "admin" : "anonymous",
  }))
}
