#!/usr/bin/env node
// Locale completeness check. `en` is the source of truth; every other locale
// must carry every key `en` has, with the same {{placeholders}} and <tags>.
//
// Plurals follow i18next's suffix scheme (`key_one`, `key_other`, ...). For a
// plural key in `en`, a locale must provide exactly the categories its own
// language uses (Intl.PluralRules), e.g. ja needs only `_other`, uk needs
// `_one/_few/_many/_other`.
//
// Unlike scripts/i18n-coverage.ts (plain key-set diff), this is plural-aware,
// so e.g. a uk catalog with only _one/_other is reported as missing _few/_many
// (i18next would otherwise show English for most counts).
//
// Usage: node scripts/check-i18n.mjs [--json] [--list]
//   exits 1 when any locale is missing keys or has placeholder mismatches.
//   Extra keys (present in a locale, absent from en) are reported, not fatal.
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const LOCALES_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "locales",
)
const SOURCE = "en"
// code -> catalog file. Mirrors the wiring in src/util/i18n.ts.
const LOCALE_FILES = {
  en: "en/english.json",
  de: "de/de.json",
  es: "es/es.json",
  fr: "fr/fr.json",
  ja: "ja/ja.json",
  uk: "uk/ukrainian.json",
  "zh-CN": "zh/zh_Hans.json",
  "zh-TW": "zh/zh_Hant.json",
}
const PLURAL_SUFFIXES = ["zero", "one", "two", "few", "many", "other"]
const PLURAL_RE = new RegExp(`^(.*)_(${PLURAL_SUFFIXES.join("|")})$`)

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out)
    else out[key] = v
  }
  return out
}

// Compared tokens: {{placeholders}}, $t() nestings and <Trans> component tags.
// Tags are only compared when the en string has real markup (a closing tag),
// so literal text such as "Bearer <key>" may be translated. <br/> is a
// layout choice per language and is not compared.
function tokens(value, markup) {
  if (typeof value !== "string") return ""
  const found = [
    ...(value.match(/\{\{\s*[\w.-]+\s*(?:,[^}]*)?\}\}/g) ?? []).map((t) =>
      t.replace(/\s+/g, "").replace(/,.*\}\}$/, "}}"),
    ),
    ...(value.match(/\$t\([^)]*\)/g) ?? []),
  ]
  if (markup) {
    found.push(
      ...(value.match(/<\/?[\w-]+\s*\/?>/g) ?? [])
        .map((t) => t.replace(/\s+/g, ""))
        .filter((t) => !/^<br\/?>$/.test(t)),
    )
  }
  return found.sort().join(" ")
}

const hasMarkup = (v) => typeof v === "string" && /<\/[\w-]+>/.test(v)

function loadLocale(locale) {
  return {
    translation: flatten(
      JSON.parse(readFileSync(join(LOCALES_DIR, LOCALE_FILES[locale]), "utf8")),
    ),
  }
}

function pluralCategories(locale) {
  return new Intl.PluralRules(locale).resolvedOptions().pluralCategories
}

/** Expected keys for `locale`, derived from the `en` keys of one namespace. */
function expectedKeys(enKeys, locale) {
  const cats = pluralCategories(locale)
  const enCats = pluralCategories(SOURCE)
  const bases = new Map()
  const expected = new Map() // key -> en key it is checked against
  for (const key of Object.keys(enKeys)) {
    const m = key.match(PLURAL_RE)
    if (m && enCats.includes(m[2])) {
      if (!bases.has(m[1])) bases.set(m[1], new Set())
      bases.get(m[1]).add(m[2])
    } else {
      expected.set(key, key)
    }
  }
  for (const [base, enHas] of bases) {
    // A lone `_other` without `_one` in en is not a plural pair; treat literally.
    if (!enHas.has("other") || enHas.size < 2) {
      for (const c of enHas) expected.set(`${base}_${c}`, `${base}_${c}`)
      continue
    }
    for (const c of cats) {
      expected.set(
        `${base}_${c}`,
        enHas.has(c) ? `${base}_${c}` : `${base}_other`,
      )
    }
  }
  return { expected, pluralBases: bases }
}

// A value that just repeats its own key path (e.g. "a.b_one": "a.b") is an
// untranslated placeholder: i18next would render the key name to users.
const isKeyEcho = (key, value) =>
  typeof value === "string" &&
  (value === key || value === key.replace(PLURAL_RE, "$1"))

export function audit() {
  const locales = Object.keys(LOCALE_FILES)
  const en = loadLocale(SOURCE)
  const report = {}
  const enEchoes = Object.entries(en).flatMap(([ns, keys]) =>
    Object.entries(keys)
      .filter(([k, v]) => isKeyEcho(k, v))
      .map(([k]) => `${ns}:${k} (en value is the key name)`),
  )
  report[SOURCE] = { missing: enEchoes, extra: [], placeholder: [], total: 0 }
  for (const locale of locales) {
    if (locale === SOURCE) continue
    const loc = loadLocale(locale)
    const r = { missing: [], extra: [], placeholder: [], total: 0 }
    for (const [ns, enKeys] of Object.entries(en)) {
      const have = loc[ns] ?? {}
      const { expected, pluralBases } = expectedKeys(enKeys, locale)
      const pluralised = new Set()
      r.total += expected.size
      for (const [key, enKey] of expected) {
        if (!(key in have)) {
          // en may use a single `{{count}}` string where a locale needs real
          // plural forms; that locale then provides key_<category> instead.
          const cats = pluralCategories(locale)
          const asPlural =
            typeof enKeys[key] === "string" &&
            enKeys[key].includes("{{count}}") &&
            cats.every((c) => `${key}_${c}` in have)
          if (asPlural) {
            for (const c of cats) pluralised.add(`${key}_${c}`)
          } else {
            r.missing.push(`${ns}:${key}`)
          }
          continue
        }
        if (isKeyEcho(key, have[key])) {
          r.missing.push(`${ns}:${key} (value is the key name)`)
          continue
        }
        // Plural forms other than _one may legitimately drop {{count}}
        // when the en "one" form spells the number out; compare against
        // the en form it maps to, but allow a missing count token.
        const markup = hasMarkup(enKeys[enKey])
        const want = tokens(enKeys[enKey], markup)
        const got = tokens(have[key], markup)
        if (want !== got) {
          const isPlural =
            PLURAL_RE.test(key) && pluralBases.has(key.match(PLURAL_RE)[1])
          const strip = (s) =>
            s
              .split(" ")
              .filter((t) => t && t !== "{{count}}")
              .join(" ")
          if (!(isPlural && strip(want) === strip(got))) {
            r.placeholder.push(
              `${ns}:${key} (en: "${want}" vs ${locale}: "${got}")`,
            )
          }
        }
      }
      for (const key of Object.keys(have)) {
        if (!expected.has(key) && !pluralised.has(key))
          r.extra.push(`${ns}:${key}`)
      }
    }
    for (const ns of Object.keys(loc)) {
      if (!(ns in en)) r.extra.push(`${ns}:* (namespace not in en)`)
    }
    report[locale] = r
  }
  return report
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  const report = audit()
  const json = process.argv.includes("--json")
  const list = process.argv.includes("--list")
  if (json) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    for (const [locale, r] of Object.entries(report)) {
      console.log(
        `${locale.padEnd(8)} missing ${String(r.missing.length).padStart(4)} / ${r.total}` +
          `  extra ${String(r.extra.length).padStart(3)}  placeholder-mismatch ${r.placeholder.length}`,
      )
      if (list) {
        for (const k of r.missing) console.log(`  - missing ${k}`)
        for (const k of r.extra) console.log(`  + extra   ${k}`)
        for (const k of r.placeholder) console.log(`  ! tokens  ${k}`)
      }
    }
  }
  const failed = Object.values(report).some(
    (r) => r.missing.length || r.placeholder.length,
  )
  if (failed && !json) {
    console.error(
      "\ni18n check failed: run `node scripts/check-i18n.mjs --list` for details.",
    )
  }
  process.exitCode = failed ? 1 : 0
}
