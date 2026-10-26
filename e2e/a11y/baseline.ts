import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))

export interface RouteFindings {
  pattern: string
  url: string
  session: string
  finalUrl: string
  ready: boolean
  violations: { rule: string; target: string; html: string }[]
}

export const BASELINE_FILE = resolve(HERE, "../a11y-baseline.json")

/** Allowed unlabeled-control count per route pattern (missing = 0). */
export const BASELINE: Record<string, number> = JSON.parse(
  readFileSync(BASELINE_FILE, "utf8"),
)

export function reportFile(dir: string, pattern: string): string {
  const slug =
    pattern === "/"
      ? "root"
      : pattern.replace(/^\//, "").replace(/[^\w-]+/g, "_") || "root"
  return resolve(dir, `${slug}.json`)
}
