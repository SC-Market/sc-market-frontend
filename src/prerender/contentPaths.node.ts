/**
 * Help & Guides and About paths, read from /content at build time (Node only:
 * react-router.config.ts). Same paths as the content build's
 * dist/content/manifest.json, which scripts/build/finalize.ts checks.
 */
import { readdirSync, statSync } from "node:fs"
import path from "node:path"

export function contentPathsFromDisk(contentDir: string): string[] {
  const guidesDir = path.join(contentDir, "guides")
  const paths = ["/guides"]
  for (const category of readdirSync(guidesDir).sort()) {
    const dir = path.join(guidesDir, category)
    if (!statSync(dir).isDirectory()) continue
    paths.push(`/guides/${category}`)
    for (const file of readdirSync(dir).sort()) {
      if (file.endsWith(".md"))
        paths.push(`/guides/${category}/${file.slice(0, -3)}`)
    }
  }
  paths.push("/about")
  return paths
}
