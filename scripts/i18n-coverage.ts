/**
 * Locale completeness audit.
 *
 * Compares every shipped locale against the English source catalog (the source
 * of truth) and reports, per locale: total keys, missing keys, extra/stale keys
 * (present in the locale but no longer in English), and % coverage.
 *
 * The existing `i18n:validate` only checks that the English catalog is in sync
 * with the code — it does NOT verify the other locales. This fills that gap.
 *
 * Usage:
 *   npx tsx scripts/i18n-coverage.ts            # summary table
 *   npx tsx scripts/i18n-coverage.ts --list     # also list missing keys per locale
 *   npx tsx scripts/i18n-coverage.ts --json     # machine-readable output
 *   npx tsx scripts/i18n-coverage.ts --threshold 80   # exit 1 if any locale below N%
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const localesDir = resolve(__dirname, "../src/locales")

// code -> catalog file. Mirrors the wiring in src/util/i18n.ts.
const LOCALE_FILES: Record<string, string> = {
  en: "en/english.json",
  de: "de/de.json",
  es: "es/es.json",
  fr: "fr/fr.json",
  ja: "ja/ja.json",
  uk: "uk/ukrainian.json",
  "zh-CN": "zh/zh_Hans.json",
  "zh-TW": "zh/zh_Hant.json",
}

type Json = string | number | boolean | null | Json[] | { [k: string]: Json }

/** Flatten a nested catalog into dotted/indexed leaf keys. */
function flatten(
  value: Json,
  prefix = "",
  out = new Set<string>(),
): Set<string> {
  if (Array.isArray(value)) {
    value.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out))
  } else if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      const next = prefix ? `${prefix}.${k}` : k
      if (v !== null && typeof v === "object") flatten(v, next, out)
      else out.add(next)
    }
  } else if (prefix) {
    out.add(prefix)
  }
  return out
}

function load(file: string): Set<string> {
  return flatten(
    JSON.parse(readFileSync(resolve(localesDir, file), "utf8")) as Json,
  )
}

const args = process.argv.slice(2)
const showList = args.includes("--list")
const asJson = args.includes("--json")
const thresholdArg = args.indexOf("--threshold")
const threshold = thresholdArg >= 0 ? Number(args[thresholdArg + 1]) : null

const en = load(LOCALE_FILES.en)
const report = Object.entries(LOCALE_FILES)
  .filter(([code]) => code !== "en")
  .map(([code, file]) => {
    const keys = load(file)
    const missing = [...en].filter((k) => !keys.has(k)).sort()
    // CLDR plural forms English doesn't use (uk _few/_many, fr/es _many) are
    // required by those languages, not stale; scripts/check-i18n.mjs checks them.
    const isPluralForm = (k: string) => {
      const m = k.match(/^(.*)_(zero|two|few|many)$/)
      return !!m && en.has(`${m[1]}_other`)
    }
    const extra = [...keys].filter((k) => !en.has(k) && !isPluralForm(k)).sort()
    const coverage = ((en.size - missing.length) / en.size) * 100
    return { code, total: keys.size, missing, extra, coverage }
  })

if (asJson) {
  console.log(
    JSON.stringify(
      { source: "en", sourceKeys: en.size, locales: report },
      null,
      2,
    ),
  )
} else {
  console.log(`\nLocale completeness vs English (${en.size} keys)\n`)
  console.log(
    `${"locale".padEnd(8)}${"keys".padStart(8)}${"missing".padStart(9)}${"stale".padStart(7)}${"coverage".padStart(11)}`,
  )
  console.log("-".repeat(43))
  for (const r of report) {
    console.log(
      `${r.code.padEnd(8)}${String(r.total).padStart(8)}${String(r.missing.length).padStart(9)}${String(r.extra.length).padStart(7)}${`${r.coverage.toFixed(1)}%`.padStart(11)}`,
    )
  }
  if (showList) {
    for (const r of report) {
      console.log(`\n=== ${r.code}: ${r.missing.length} missing keys ===`)
      for (const k of r.missing) console.log(`  ${k}`)
      if (r.extra.length) {
        console.log(
          `\n  --- ${r.extra.length} stale keys (in ${r.code}, not in en) ---`,
        )
        for (const k of r.extra) console.log(`  ${k}`)
      }
    }
  }
  console.log("")
}

if (threshold !== null) {
  const below = report.filter((r) => r.coverage < threshold)
  if (below.length) {
    console.error(
      `FAIL: ${below.map((r) => `${r.code} (${r.coverage.toFixed(1)}%)`).join(", ")} below ${threshold}% coverage`,
    )
    process.exit(1)
  }
}
