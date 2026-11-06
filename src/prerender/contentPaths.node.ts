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

/** An English guide's file name (kebab-case slug, no locale suffix). */
const GUIDE_FILE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/

export function contentPathsFromDisk(contentDir: string): string[] {
  const guidesDir = path.join(contentDir, "guides")
  const paths = ["/guides"]
  for (const category of readdirSync(guidesDir).sort()) {
    const dir = path.join(guidesDir, category)
    if (!statSync(dir).isDirectory()) continue
    paths.push(`/guides/${category}`)
    for (const file of readdirSync(dir).sort()) {
      // English guides only: a translation (<slug>.<locale>.md) is served
      // on its guide's URL with ?lng=, by the edge bridge (not a file).
      if (GUIDE_FILE_NAME.test(file))
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
    if (
      changelogStatus(readFileSync(path.join(dir, file), "utf8"), rel) ===
      "published"
    ) {
      paths.push(CHANGELOG_PATHS.entry(file.slice(0, -3)))
    }
  }
  return paths
}
