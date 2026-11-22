/// <reference types="node" />
/**
 * Guard: the error page is bundled with the client entry, never loaded lazily.
 *
 * It is what a tab shows when a chunk failed to load (a deploy replaced the
 * build it runs, and the automatic reload budget is spent). If the error page
 * were its own chunk, that chunk can be gone too ("Failed to fetch
 * dynamically imported module: .../assets/FrontendError-….js") and the tab is
 * left with nothing. The app shell (src/app/shell.ts, bundled with
 * entry.client.tsx) imports it statically; nothing may import() it for the
 * root error element.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const SRC = path.resolve(__dirname, "../../..")

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

describe("FrontendError (the error page)", () => {
  it("is imported statically by the app shell", () => {
    const shell = readFileSync(path.join(SRC, "app", "shell.ts"), "utf8")
    expect(shell).toMatch(
      /^import \{ FrontendErrorElement \} from "\.\.\/pages\/errors\/FrontendError"$/m,
    )
  })

  it("is never wrapped in a lazy component", () => {
    const lazyErrorPage =
      /lazy(?:WithRetry)?\(\s*\(\)\s*=>\s*import\(\s*["'][^"']*\/FrontendError["']/
    const offenders = sourceFiles(SRC)
      .filter((file) => lazyErrorPage.test(readFileSync(file, "utf8")))
      .map((file) => path.relative(SRC, file))
    expect(offenders).toEqual([])
  })
})
