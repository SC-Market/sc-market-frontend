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
import { IAE_2956 } from "../iae2956"

const SC_ORGS_POSTERS = [
  "sc-orgs-finder",
  "sc-orgs-ops-demo",
  "sc-orgs-lfo",
  "sc-orgs-events",
  "sc-orgs-discord",
  "sc-orgs-fleet",
  "sc-orgs-treasury",
  "sc-orgs-dispatch",
]

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
      SC_ORGS_POSTERS,
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
      expect(seen.poster.size).toBe(SC_ORGS_POSTERS.length)
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
    expect(posters.map((p) => p.id)).toEqual(SC_ORGS_POSTERS)
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
  it("gives every poster its own id, copy, accent and utm campaign, with all four lines in every locale", () => {
    const posters = MARKET_ADS.filter(
      (ad): ad is Extract<AdConfig, { kind: "poster" }> => ad.kind === "poster",
    )
    const unique = (values: string[]) => new Set(values).size === values.length
    expect(unique(MARKET_ADS.map((ad) => ad.id))).toBe(true)
    expect(unique(posters.map((p) => p.copyKey))).toBe(true)
    expect(unique(posters.map((p) => p.accent.toLowerCase()))).toBe(true)
    const campaigns = posters.map(
      (p) => new URL(p.linkUrl).searchParams.get("utm_campaign") ?? "",
    )
    expect(campaigns.every((c) => c.length > 0)).toBe(true)
    expect(unique(campaigns)).toBe(true)
    for (const p of posters) {
      const url = new URL(p.linkUrl)
      expect(url.origin).toBe("https://sc-orgs.space")
      expect(url.searchParams.get("utm_source")).toBe("sc-market")
      expect(url.searchParams.get("utm_medium")).toBe("in-universe-ad")
      expect(p.sisterSite).toBe(true)
      expect(p.weight).toBeGreaterThan(0)
    }

    const locales = { en, de, es, fr, ja, uk, zhHans, zhHant }
    for (const [name, locale] of Object.entries(locales)) {
      for (const p of posters) {
        // copyKey is a path into the catalog: ads.scOrgs.<poster>
        const copy = p.copyKey
          .split(".")
          .reduce<unknown>(
            (node, key) => (node as Record<string, unknown> | undefined)?.[key],
            locale,
          ) as Record<string, unknown> | undefined
        for (const field of ["kicker", "title", "tagline", "cta"]) {
          const text = copy?.[field]
          expect(typeof text, `${name} ${p.copyKey}.${field}`).toBe("string")
          expect((text as string).trim().length).toBeGreaterThan(0)
        }
        expect(Object.keys(copy ?? {}).sort()).toEqual([
          "cta",
          "kicker",
          "tagline",
          "title",
        ])
      }
    }
  })

  it("draws every poster's accent at AA contrast on the poster's background", () => {
    // Relative luminance (WCAG 2), of a #rrggbb colour.
    const channel = (hex: string, i: number) =>
      parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16)
    const luminance = (rgb: number[]) =>
      rgb
        .map((c) => c / 255)
        .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
        .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0)
    const rgb = (hex: string) => [0, 1, 2].map((i) => channel(hex, i))
    const posters = MARKET_ADS.filter(
      (ad): ad is Extract<AdConfig, { kind: "poster" }> => ad.kind === "poster",
    )
    for (const p of posters) {
      // The lightest the background gets behind the text: its top colour
      // (#0d1626) under the accent glow at its strongest (0x33 = 20%).
      const glow = rgb(p.accent).map(
        (c, i) => 0.2 * c + 0.8 * rgb("#0d1626")[i],
      )
      const ratio = (luminance(rgb(p.accent)) + 0.05) / (luminance(glow) + 0.05)
      expect(ratio, `${p.id} ${p.accent}`).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe("campaign ad slot", () => {
  const key = (l: { listing_id: string }) => l.listing_id
  const adsOf = (out: ReturnType<typeof insertAds<{ listing_id: string }>>) =>
    out.flatMap((item) => ("_isAd" in item ? [item.ad] : []))

  // 12 and 24 listings: 1 slot (SC Orgs); 48 (the default): 2; 120: 5.
  it.each([
    [12, 1, 0],
    [24, 1, 0],
    [48, 2, 1],
    [120, 5, 1],
    [200, 8, 1],
  ])(
    "a page of %i listings (%i slots) shows %i campaign ad and still exactly one SC Orgs ad",
    (size, slots, campaignCount) => {
      for (const creative of IAE_2956.creatives) {
        for (let seed = 0; seed < 20; seed++) {
          const page = listings(size, `c${seed}-`)
          const withCampaign = adsOf(insertAds(page, key, MARKET_ADS, creative))
          const without = adsOf(insertAds(page, key, MARKET_ADS))
          expect(withCampaign).toHaveLength(slots)
          expect(
            withCampaign.filter((ad) => ad.id.startsWith("iae2956-")),
          ).toHaveLength(campaignCount)
          expect(withCampaign.filter((ad) => ad.sisterSite)).toHaveLength(1)
          // The campaign ad replaces one ship poster; every other slot,
          // the SC Orgs one included, keeps its ad.
          const changed = withCampaign.filter((ad, i) => ad !== without[i])
          expect(changed).toHaveLength(campaignCount)
          if (campaignCount) expect(changed[0]).toBe(creative)
        }
      }
    },
  )

  it("moves the campaign ad between the non-SC Orgs slots across pages", () => {
    const creative = IAE_2956.creatives[0]
    const slotsSeen = new Set<number>()
    for (let seed = 0; seed < 100; seed++) {
      const ads = adsOf(
        insertAds(listings(120, `m${seed}-`), key, MARKET_ADS, creative),
      )
      const slot = ads.indexOf(creative)
      expect(ads[slot].sisterSite).toBeFalsy()
      slotsSeen.add(slot)
    }
    // 5 slots: it takes each of them on some page (never the SC Orgs one).
    expect(slotsSeen.size).toBe(5)
  })

  it("is the same with a null campaign ad as without one", () => {
    const page = listings(120)
    expect(insertAds(page, key, MARKET_ADS, null)).toEqual(insertAds(page, key))
  })

  it("keeps the campaign creatives out of the regular rotation", () => {
    const ids = new Set(MARKET_ADS.map((ad) => ad.id))
    for (const c of IAE_2956.creatives) expect(ids.has(c.id)).toBe(false)
  })
})
