import { describe, expect, it } from "vitest"
import en from "../../../locales/en/english.json"
import de from "../../../locales/de/de.json"
import es from "../../../locales/es/es.json"
import fr from "../../../locales/fr/fr.json"
import ja from "../../../locales/ja/ja.json"
import uk from "../../../locales/uk/ukrainian.json"
import zhHans from "../../../locales/zh/zh_Hans.json"
import zhHant from "../../../locales/zh/zh_Hant.json"
import {
  AD_FIRST_POSITION,
  AD_FREQUENCY,
  MARKET_ADS,
  buildAdRotation,
  insertAds,
} from "../adConfig"
import type { AdConfig } from "../types"

const listings = (n: number, prefix = "l") =>
  Array.from({ length: n }, (_, i) => ({ listing_id: `${prefix}${i}` }))

describe("market ad rotation", () => {
  it("gives each ad its weight's share, the ship posters most of it", () => {
    const rotation = buildAdRotation(MARKET_ADS)
    const total = MARKET_ADS.reduce((sum, ad) => sum + ad.weight, 0)
    expect(rotation).toHaveLength(total)
    for (const ad of MARKET_ADS) {
      expect(rotation.filter((r) => r.id === ad.id)).toHaveLength(ad.weight)
    }
    const scOrgs = rotation.filter((ad) => ad.id.startsWith("sc-orgs")).length
    expect(scOrgs / rotation.length).toBe(0.25)
  })

  it("never puts the same ad in two neighbouring slots", () => {
    const rotation = buildAdRotation(MARKET_ADS)
    rotation.forEach((ad, i) => {
      expect(ad.id).not.toBe(rotation[(i + 1) % rotation.length].id)
    })
  })

  it("splices ads at the first position and then every AD_FREQUENCY listings", () => {
    const out = insertAds(listings(60), (l) => l.listing_id)
    const adAt = out.flatMap((item, i) => ("_isAd" in item ? [i] : []))
    expect(adAt).toEqual([
      AD_FIRST_POSITION,
      AD_FIRST_POSITION + AD_FREQUENCY + 1,
    ])
    expect(out.filter((item) => !("_isAd" in item))).toHaveLength(60)
  })

  it("is deterministic per result page and varies between pages", () => {
    const key = (l: { listing_id: string }) => l.listing_id
    const firstAds = (prefix: string) =>
      insertAds(listings(30, prefix), key).flatMap((item) =>
        "_isAd" in item ? [item.ad.id] : [],
      )[0]
    expect(firstAds("a")).toBe(firstAds("a"))
    const openers = new Set(
      ["a", "b", "c", "d", "e", "f", "g", "h"].map(firstAds),
    )
    expect(openers.size).toBeGreaterThan(1)
  })

  it("adds nothing to short pages", () => {
    const few = listings(9)
    expect(insertAds(few, (l) => l.listing_id)).toBe(few)
  })

  it("SC Orgs posters link to SC Orgs, never imply RSI, and are translated everywhere", () => {
    const posters = MARKET_ADS.filter(
      (ad): ad is Extract<AdConfig, { kind: "poster" }> => ad.kind === "poster",
    )
    expect(posters.map((p) => p.id)).toEqual([
      "sc-orgs-finder",
      "sc-orgs-ops-demo",
    ])
    for (const p of posters)
      expect(p.linkUrl.startsWith("https://sc-orgs.space/")).toBe(true)
    for (const locale of [en, de, es, fr, ja, uk, zhHans, zhHant]) {
      const scOrgs = (locale as { ads: { scOrgs: Record<string, unknown> } })
        .ads.scOrgs
      expect(typeof scOrgs.disclaimer).toBe("string")
      for (const p of posters) {
        const copy = scOrgs[p.copyKey.split(".").pop()!] as Record<
          string,
          string
        >
        for (const field of ["kicker", "title", "tagline", "cta"]) {
          expect(copy[field]?.length).toBeGreaterThan(0)
        }
        // Copy that names RSI may only do so to disclaim it.
        expect(Object.values(copy).join(" ")).not.toMatch(
          /RSI|Roberts|CIG|official/i,
        )
      }
    }
  })
})
