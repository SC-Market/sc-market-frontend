/**
 * Guard: every lazily loaded component goes through stale-chunk recovery.
 *
 * A bare `lazy(() => import(...))` / `React.lazy(...)` caches the first failed
 * chunk fetch and throws it to the nearest error boundary: after a deploy that
 * crashed whole pages (and, for an always-mounted host, the whole app). Use
 * `lazyWithRetry` from src/util/lazyWithRetry.tsx instead. Route `lazy:`
 * loaders must likewise wrap their import in retryDynamicImport.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { describe, it, expect } from "vitest"

const SRC = path.resolve(__dirname, "../..")
const ALLOWED = new Set([path.join("util", "lazyWithRetry.tsx")])

function sourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) {
      if (name === "__tests__" || name === "node_modules") continue
      out.push(...sourceFiles(full))
    } else if (/\.(ts|tsx)$/.test(name) && !/\.(test|spec)\.tsx?$/.test(name)) {
      out.push(full)
    }
  }
  return out
}

/** Drop comments so documentation examples don't count. */
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1")
}

const BARE_LAZY = /(?<![\w$.])(?:React\.)?lazy\s*(?:<[^()]*>)?\s*\(/g
const UNWRAPPED_ROUTE_IMPORT = /await\s+import\s*\(/g

function offenders(pattern: RegExp, files: string[]): string[] {
  const found: string[] = []
  for (const file of files) {
    const rel = path.relative(SRC, file)
    if (ALLOWED.has(rel)) continue
    const code = stripComments(readFileSync(file, "utf8"))
    for (const match of code.matchAll(pattern)) {
      const line = code.slice(0, match.index).split("\n").length
      found.push(`${rel}:${line}`)
    }
  }
  return found
}

describe("lazy loading goes through stale-chunk recovery", () => {
  const files = sourceFiles(SRC)

  it("has no bare lazy() / React.lazy() calls (use lazyWithRetry)", () => {
    expect(offenders(BARE_LAZY, files)).toEqual([])
  })

  it("has no route loader awaiting a bare import() (wrap it in retryDynamicImport)", () => {
    const app = files.filter((f) => path.relative(SRC, f) === "App.tsx")
    expect(app).toHaveLength(1)
    expect(offenders(UNWRAPPED_ROUTE_IMPORT, app)).toEqual([])
  })

  it("detects the patterns it guards against", () => {
    const sample =
      'const A = lazy(() => import("./A"))\nconst B = React.lazy(() => import("./B"))\nconst C = lazy<X>(f)'
    expect(sample.match(BARE_LAZY)).toHaveLength(3)
    expect(
      "Component: (await import('./x')).X".match(UNWRAPPED_ROUTE_IMPORT),
    ).toHaveLength(1)
    expect("lazyWithRetry(() => import('./A'))".match(BARE_LAZY)).toBeNull()
    expect("{ lazy: async () => ({}) }".match(BARE_LAZY)).toBeNull()
  })
})
