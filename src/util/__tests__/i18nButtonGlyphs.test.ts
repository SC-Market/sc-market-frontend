// @vitest-environment node
// Button labels carry no glyph standing in for an icon ("+ Create", "Next →",
// "← Back", "Owned ✓"): the icon is the button's startIcon/endIcon
// (ARCHITECTURE.md, Button icons). Stricter than "button-label keys": no
// value in any of the 8 catalogs starts or ends with one, except the keys
// below, which are not button labels.
import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { hasEdgeGlyph, LABEL_GLYPHS } from "../../../scripts/button-icons.mjs"

const LOCALES_DIR = path.resolve(import.meta.dirname, "../../locales")
// Mirrors scripts/check-i18n.mjs (and the wiring in src/util/i18n.ts).
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

/** Keys (plural suffix stripped) whose glyph is content, not an icon. */
const NOT_BUTTON_LABELS: Record<string, string> = {
  "landing.wantedNowQuantity": "a quantity (×12) in the wanted-now table",
  "priceAlerts.manager.qualityValue": "a minimum quality (Tier 3+)",
  "blueprintsUi.moreCount": "overflow count on a chip row (+3 more)",
  "apiTokensUi.list.moreScopes": "overflow count on a chip row (+3 more)",
  "miningUi.locationBrowser.moreOres": "overflow count on a chip row (+3 more)",
}

function flatten(
  obj: Record<string, unknown>,
  prefix = "",
  out: Record<string, unknown> = {},
) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === "object" && !Array.isArray(v))
      flatten(v as Record<string, unknown>, key, out)
    else out[key] = v
  }
  return out
}

const baseKey = (key: string) =>
  key.replace(/_(zero|one|two|few|many|other)$/, "")

describe("button labels in the catalogs", () => {
  it("knows the glyphs the lint and this test share", () => {
    for (const g of ["+", "→", "←", "✓", "×", "▸"])
      expect(LABEL_GLYPHS).toContain(g)
    expect(hasEdgeGlyph("+ Create Listing")).toBe(true)
    expect(hasEdgeGlyph("Next →")).toBe(true)
    expect(hasEdgeGlyph("Owned ✓")).toBe(true)
    expect(hasEdgeGlyph("Stanton → Hurston")).toBe(false)
    expect(hasEdgeGlyph("Create Listing")).toBe(false)
  })

  it.each(Object.entries(LOCALE_FILES))(
    "%s: no value starts or ends with an icon glyph",
    (_locale, file) => {
      const catalog = JSON.parse(
        readFileSync(path.join(LOCALES_DIR, file), "utf8"),
      )
      const offenders = Object.entries(flatten(catalog))
        .filter(([key]) => !(baseKey(key) in NOT_BUTTON_LABELS))
        .filter(([, value]) => hasEdgeGlyph(value))
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      expect(offenders).toEqual([])
    },
  )

  it("allowlisted keys still exist (drop stale entries)", () => {
    const en = flatten(
      JSON.parse(
        readFileSync(path.join(LOCALES_DIR, "en/english.json"), "utf8"),
      ),
    )
    const present = new Set(Object.keys(en).map(baseKey))
    for (const key of Object.keys(NOT_BUTTON_LABELS))
      expect(present.has(key), key).toBe(true)
  })
})
