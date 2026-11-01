/**
 * Help & Guides, About and changelog paths, read from /content at build time
 * (Node only: react-router.config.ts). Same paths as the content build's
 * dist/content/manifest.json, plus /changelog, which is prerendered (with
 * its empty state) even before an entry is published.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { changelogStatus } from "../features/help/build/compile"
import { CHANGELOG_PATHS } from "../routes/paths"

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
  paths.push(...changelogPathsFromDisk(contentDir))
  return paths
}

/** /changelog and each published entry (drafts are never prerendered). */
export function changelogPathsFromDisk(contentDir: string): string[] {
  const dir = path.join(contentDir, "changelog")
  const paths: string[] = [CHANGELOG_PATHS.index]
  if (!existsSync(dir)) return paths
  for (const file of readdirSync(dir).sort().reverse()) {
    if (!file.endsWith(".md")) continue
    const rel = `changelog/${file}`
    if (changelogStatus(readFileSync(path.join(dir, file), "utf8"), rel) === "published") {
      paths.push(CHANGELOG_PATHS.entry(file.slice(0, -3)))
    }
  }
  return paths
}
