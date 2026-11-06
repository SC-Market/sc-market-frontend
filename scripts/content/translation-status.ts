/**
 * Which guide translations are missing or stale, per guide and locale
 * (content/STYLE.md, "Translations").
 *
 *   npm run content:translations                  every guide and locale
 *   npm run content:translations -- --locale de   one locale
 *   npm run content:translations -- --json        machine-readable
 *   npm run content:translations -- --check       exit 1 if any is stale
 *
 * A translation is stale when its `source_hash` isn't the current English
 * body's: the English guide changed after it was translated. Stale and
 * missing translations aren't published (visitors get the English guide).
 * The `source_hash` printed for each guide is the value an up-to-date
 * translation carries.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  compileSite,
  type SourceFile,
} from "../../src/features/help/build/compile"
import { GUIDE_LOCALES } from "../../src/features/help/domain/locales"

type Status = "published" | "stale" | "missing"

interface Row {
  guide: string
  file: string
  sourceHash: string
  locales: Record<
    string,
    { status: Status; file?: string; sourceHash?: string }
  >
}

const CONTENT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../content",
)

function listFiles(dir: string, base = dir): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    // Dotfiles (macOS "._x.md" AppleDouble files on exFAT) aren't content.
    if (name.startsWith(".")) continue
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) out.push(...listFiles(full, base))
    else if (name.endsWith(".md") || name.endsWith(".json"))
      out.push(path.relative(base, full).split(path.sep).join("/"))
  }
  return out
}

/** The hash as it goes in frontmatter: quoted when all digits (else it reads as a number). */
function frontmatterHash(hash: string): string {
  return /^\d+$/.test(hash) ? `"${hash}"` : hash
}

function parseArgs(argv: string[]) {
  const args = { json: false, check: false, locale: null as string | null }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--json") args.json = true
    else if (arg === "--check") args.check = true
    else if (arg === "--locale") args.locale = argv[++i] ?? null
    else if (arg.startsWith("--locale=")) args.locale = arg.slice(9)
    else {
      console.error(`unknown argument "${arg}"`)
      process.exit(2)
    }
  }
  if (args.locale !== null && !GUIDE_LOCALES.includes(args.locale)) {
    console.error(
      `--locale must be one of ${GUIDE_LOCALES.join(", ")} (got "${args.locale}")`,
    )
    process.exit(2)
  }
  return args
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const locales = args.locale ? [args.locale] : [...GUIDE_LOCALES]
  const files: SourceFile[] = listFiles(CONTENT).map((rel) => ({
    path: rel,
    source: readFileSync(path.join(CONTENT, rel), "utf8"),
  }))
  const site = compileSite(files, {
    today: new Date().toISOString().slice(0, 10),
  })

  const rows: Row[] = site.guides.map((guide) => ({
    guide: guide.meta.id,
    file: `content/${guide.file}`,
    sourceHash: guide.sourceHash,
    locales: Object.fromEntries(
      locales.map((locale) => {
        const t = guide.translations.find((x) => x.locale === locale)
        return [
          locale,
          t
            ? {
                status: t.status,
                file: `content/${t.file}`,
                sourceHash: t.sourceHash,
              }
            : { status: "missing" as const },
        ]
      }),
    ),
  }))

  const count = (status: Status) =>
    rows.reduce(
      (n, row) =>
        n +
        Object.values(row.locales).filter((l) => l.status === status).length,
      0,
    )
  const totals = {
    published: count("published"),
    stale: count("stale"),
    missing: count("missing"),
  }

  if (args.json) {
    console.log(JSON.stringify({ locales, totals, guides: rows }, null, 2))
  } else {
    console.log(
      `Guide translations: ${rows.length} guides x ${locales.length} locale${locales.length === 1 ? "" : "s"} (${locales.join(", ")})`,
    )
    console.log(
      `  published ${totals.published}, stale ${totals.stale}, missing ${totals.missing}\n`,
    )
    for (const row of rows) {
      const by = (status: Status) =>
        locales.filter((l) => row.locales[l].status === status)
      const published = by("published")
      const stale = by("stale")
      const missing = by("missing")
      console.log(
        `${row.guide}  (source_hash: ${frontmatterHash(row.sourceHash)})`,
      )
      if (stale.length > 0) {
        for (const locale of stale) {
          const l = row.locales[locale]
          console.log(`  stale      ${locale}: ${l.file} has ${l.sourceHash}`)
        }
      }
      if (missing.length > 0) console.log(`  missing    ${missing.join(", ")}`)
      if (published.length > 0)
        console.log(`  up to date ${published.join(", ")}`)
    }
  }

  if (args.check && totals.stale > 0) process.exit(1)
}

main()
