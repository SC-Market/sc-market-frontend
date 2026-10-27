/**
 * Prerendered pages (src/prerender/paths.ts) in the deploy directory:
 * - inline the entry stylesheet into each, like the SPA shell;
 * - `Cache-Control: no-cache` for each path in _headers, so a browser always
 *   revalidates and never keeps HTML that references chunks a later deploy
 *   dropped (the asset carry-over keeps recent ones, not all);
 * - check the edge bridge leaves each path alone: excluded in
 *   public/_routes.json (no Function invocation at all), or a page kind the
 *   bridge passes through (src/bridge/routes.ts PRERENDERED_KINDS).
 */
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"
import { inlineStylesheets } from "../vite/inlineEntryCssPlugin"
import { matchBridgeRoute, PRERENDERED_KINDS } from "../../src/bridge/routes"

/** Every `<dir>/index.html` below `outDir` except the root shell, as URL paths. */
export function prerenderedPaths(outDir: string): string[] {
  const found: string[] = []
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name)
      if (!statSync(full).isDirectory()) continue
      if (name === "assets" || name === "content") continue
      if (existsSync(path.join(full, "index.html"))) {
        found.push("/" + path.relative(outDir, full).split(path.sep).join("/"))
      }
      walk(full)
    }
  }
  walk(outDir)
  // The homepage, when it's prerendered (the SPA shell is then
  // __spa-fallback.html).
  const home = path.join(outDir, "index.html")
  if (
    existsSync(home) &&
    readFileSync(home, "utf8").includes('<div id="root" data-prerendered')
  ) {
    found.push("/")
  }
  return found.sort()
}

export function finalizePrerenderedPages(outDir: string): string[] {
  const paths = prerenderedPaths(outDir)
  for (const urlPath of paths) {
    const file = path.join(outDir, urlPath === "/" ? "" : urlPath, "index.html")
    const html = inlineStylesheets(readFileSync(file, "utf8"), (fileName) => {
      const css = path.join(outDir, fileName)
      return existsSync(css) ? readFileSync(css, "utf8") : undefined
    })
    writeFileSync(file, html)
  }

  const headersFile = path.join(outDir, "_headers")
  const rules = paths.map((p) => `${p}\n  Cache-Control: no-cache\n`).join("\n")
  writeFileSync(
    headersFile,
    `${readFileSync(headersFile, "utf8").trimEnd()}\n\n# Prerendered pages (scripts/build/prerendered.ts).\n${rules}`,
  )

  const routes = JSON.parse(
    readFileSync(path.join(outDir, "_routes.json"), "utf8"),
  ) as {
    include: string[]
    exclude: string[]
  }
  const bridged = paths.filter((p) => {
    if (routes.exclude.includes(p)) return false
    const match = matchBridgeRoute(p)
    return match !== null && !PRERENDERED_KINDS.has(match.route.kind)
  })
  if (bridged.length > 0) {
    throw new Error(
      `the edge bridge would rewrite prerendered page(s) ${bridged.join(", ")}: exclude them in public/_routes.json or add their kind to PRERENDERED_KINDS`,
    )
  }
  const total = routes.include.length + routes.exclude.length
  if (total > 100)
    throw new Error(
      `public/_routes.json has ${total} rules (Cloudflare's limit is 100)`,
    )
  return paths
}
