/**
 * Second half of `npm run build` (after `react-router build`):
 *
 * 1. Lays React Router's client output (build/client) out as the deploy
 *    directory, dist/ by default: the directory Cloudflare Pages deploys
 *    (functions/ next to it are the edge bridge).
 * 2. Builds the push-only service worker (src/sw.ts) to <out>/sw.js and
 *    checks it never precaches or handles fetches (checkServiceWorker.ts).
 * 3. Inlines the entry stylesheet into the HTML shell and checks it
 *    (checkShell.ts).
 *
 *   tsx scripts/build/finalize.ts [--out dist]
 */
import {
  cpSync,
  existsSync,
  rmSync,
  renameSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"
import { build } from "vite"
import { checkServiceWorker } from "./checkServiceWorker"
import { checkShell } from "./checkShell"
import { inlineStylesheets } from "../vite/inlineEntryCssPlugin"
import { finalizePrerenderedPages } from "./prerendered"

const ROOT = path.resolve(import.meta.dirname, "../..")
const CLIENT_DIR = path.join(ROOT, "build/client")

function argValue(name: string, fallback: string): string {
  const i = process.argv.indexOf(name)
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}

const outDir = path.resolve(ROOT, argValue("--out", "dist"))

/** React Router's SPA shell (written as index.html when / isn't prerendered). */
const SHELL_FILE = existsSync(path.join(CLIENT_DIR, "__spa-fallback.html"))
  ? "__spa-fallback.html"
  : "index.html"
if (!existsSync(path.join(CLIENT_DIR, SHELL_FILE))) {
  throw new Error(
    `${CLIENT_DIR}/${SHELL_FILE} is missing: run react-router build first`,
  )
}

// 1. build/client → <out>, without React Router's prerendered `.data`
// files: route modules load data through their clientLoader, never .data.
rmSync(outDir, { recursive: true, force: true })
cpSync(CLIENT_DIR, outDir, {
  recursive: true,
  filter: (source) => !source.endsWith(".data"),
})
finalizePrerenderedPages(outDir)
const stats = path.join(ROOT, "build/stats.html")
if (existsSync(stats)) cpSync(stats, path.join(outDir, "stats.html"))

// 2. Service worker: one self-contained classic-script-compatible file.
await build({
  configFile: false,
  logLevel: "warn",
  publicDir: false,
  build: {
    outDir,
    emptyOutDir: false,
    sourcemap: true,
    minify: true,
    target: "es2020",
    lib: {
      entry: path.join(ROOT, "src/sw.ts"),
      formats: ["iife"],
      name: "scMarketServiceWorker",
      fileName: () => "sw.js",
    },
  },
})
// lib mode names the map after the bundle; keep the old sw.js.map name.
const swMap = path.join(outDir, "sw.js.map")
if (!existsSync(swMap)) {
  const alt = path.join(outDir, "sw.iife.js.map")
  if (existsSync(alt)) renameSync(alt, swMap)
}
checkServiceWorker(readFileSync(path.join(outDir, "sw.js"), "utf8"))

// 3. The shell every path is served: inline the small entry stylesheet (no
// render-blocking request; see inlineEntryCssPlugin.ts), then check it.
const shellFile = path.join(outDir, SHELL_FILE)
const shell = inlineStylesheets(readFileSync(shellFile, "utf8"), (fileName) => {
  const file = path.join(outDir, fileName)
  return existsSync(file) ? readFileSync(file, "utf8") : undefined
})
writeFileSync(shellFile, shell)
checkShell(shell)

console.log(
  `finalize: ${path.relative(ROOT, CLIENT_DIR)} → ${path.relative(ROOT, outDir)}, sw.js built`,
)
