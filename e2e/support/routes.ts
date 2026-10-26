/**
 * Every leaf route of the app (src/routes.ts), turned into a concrete URL
 * with the route regression harness's fixture params and the session the
 * harness uses for it (logged in behind LoggedInRoute).
 */
import type { RouteConfigEntry } from "@react-router/dev/routes"
import routeConfig from "../../src/routes"
import {
  PARAM_VALUES,
  PATTERN_PARAM_OVERRIDES,
  type SessionKind,
} from "../../src/router/__tests__/regression/fixtures"

export interface AppRoute {
  pattern: string
  url: string
  session: SessionKind
}

/** The LoggedInRoute guard layouts (src/routes/layouts/LoggedInRoute*.tsx). */
const LOGGED_IN_LAYOUT = /^routes\/layouts\/LoggedInRoute\b/

function readLeaves(): { pattern: string; loggedIn: boolean }[] {
  const join = (parent: string, child: string | undefined) => {
    if (child === undefined) return parent
    if (child.startsWith("/")) return child
    return `${parent.replace(/\/$/, "")}/${child}`
  }
  const leaves: { pattern: string; loggedIn: boolean }[] = []
  const walk = (
    entries: RouteConfigEntry[],
    parentPath: string,
    loggedIn: boolean,
  ) => {
    for (const entry of entries) {
      const path = entry.index ? parentPath : join(parentPath, entry.path)
      const guarded = loggedIn || LOGGED_IN_LAYOUT.test(entry.file)
      if (entry.children?.length) walk(entry.children, path, guarded)
      else leaves.push({ pattern: path || "/", loggedIn: guarded })
    }
  }
  walk(routeConfig, "", false)
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
