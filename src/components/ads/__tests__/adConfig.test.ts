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
  AD_MIN_LISTINGS,
  MARKET_ADS,
  buildAdRotation,
  insertAds,
} from "../adConfig"
import type { AdConfig } from "../types"

const listings = (n: number, prefix = "l") =>
  Array.from({ length: n }, (_, i) => ({ listing_id: `${prefix}${i}` }))

describe("market ad rotation", () => {
  it("gives each ad its weight's share of its group's rotation", () => {
    for (const group of [true, false]) {
      const ads = MARKET_ADS.filter((ad) => !!ad.sisterSite === group)
      const rotation = buildAdRotation(ads)
      const total = ads.reduce((sum, ad) => sum + ad.weight, 0)
      expect(rotation).toHaveLength(total)
      for (const ad of ads) {
        expect(rotation.filter((r) => r.id === ad.id)).toHaveLength(ad.weight)
      }
    }
  })

  it("marks exactly the SC Orgs posters as sister-site ads", () => {
    expect(MARKET_ADS.filter((ad) => ad.sisterSite).map((ad) => ad.id)).toEqual(
      ["sc-orgs-finder", "sc-orgs-ops-demo"],
    )
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
    const expected: number[] = []
    for (
      let i = AD_FIRST_POSITION;
      i < 60 + expected.length;
      i += AD_FREQUENCY + 1
    ) {
      expected.push(i)
    }
    expect(adAt).toEqual(expected)
    expect(out.filter((item) => !("_isAd" in item))).toHaveLength(60)
  })

  it("puts one ad in a default page of 12 listings", () => {
    const out = insertAds(listings(12), (l) => l.listing_id)
    expect(out.filter((item) => "_isAd" in item)).toHaveLength(1)
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

  it("adds nothing to pages shorter than AD_MIN_LISTINGS", () => {
    for (let n = 0; n < AD_MIN_LISTINGS; n++) {
      const few = listings(n)
      expect(insertAds(few, (l) => l.listing_id)).toBe(few)
    }
  })

  // 12 listings: 1 slot; 48: 2 slots; 120: 5 slots; 200: 8 slots.
  it.each([
    [12, 1],
    [48, 2],
    [120, 5],
    [200, 8],
  ])(
    "puts exactly one SC Orgs ad in a page of %i listings (%i slots), whatever the page",
    (size, slots) => {
      const seen = { slot: new Set<number>(), poster: new Set<string>() }
      for (let seed = 0; seed < 200; seed++) {
        const ads = insertAds(
          listings(size, `p${seed}-`),
          (l) => l.listing_id,
        ).flatMap((item) => ("_isAd" in item ? [item.ad] : []))
        expect(ads).toHaveLength(slots)
        const sister = ads.filter((ad) => ad.sisterSite)
        expect(sister).toHaveLength(1)
        expect(sister[0].id.startsWith("sc-orgs")).toBe(true)
        seen.slot.add(ads.indexOf(sister[0]))
        seen.poster.add(sister[0].id)
        // The ship posters fill the rest, never the same one twice in a row.
        const ships = ads.filter((ad) => !ad.sisterSite)
        for (const ad of ships) expect(ad.kind).toBe("image")
        ships.forEach((ad, i) => {
          if (i > 0) expect(ad.id).not.toBe(ships[i - 1].id)
        })
      }
      // Across pages, the SC Orgs ad moves between slots and posters.
      expect(seen.slot.size).toBe(slots)
      expect(seen.poster.size).toBe(2)
    },
  )

  it("gives the same page the same ads every time", () => {
    const key = (l: { listing_id: string }) => l.listing_id
    for (const prefix of ["a", "b", "c", "d"]) {
      const ids = () =>
        insertAds(listings(120, prefix), key).map((item) =>
          "_isAd" in item ? `ad:${item.ad.id}` : item.listing_id,
        )
      expect(ids()).toEqual(ids())
    }
  })

  it("still places the one sister ad when there are no other ads", () => {
    const sisterOnly = MARKET_ADS.filter((ad) => ad.sisterSite)
    const out = insertAds(listings(60), (l) => l.listing_id, sisterOnly)
    expect(out.filter((item) => "_isAd" in item)).toHaveLength(1)
    expect(out.filter((item) => !("_isAd" in item))).toHaveLength(60)
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
