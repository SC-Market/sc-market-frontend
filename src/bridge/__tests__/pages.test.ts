import { describe, it, expect } from "vitest"
import i18next from "i18next"
import en from "../../locales/en/english.json"
import { BRIDGE_PAGES, type PageContext } from "../pages"
import { englishT } from "../englishT"
import {
  buildCommodityAnswers,
  buildItemSummary,
  buildOreAnswers,
  buildShipSummary,
} from "../../util/answerContent"
import type { BridgePageKind } from "../routes"
import * as f from "./fixtures"

const ORIGIN = "https://sc-market.space"

function ctx(params: Record<string, string>, pathname = "/x"): PageContext {
  return { params, origin: ORIGIN, pathname }
}

function build(kind: BridgePageKind, data: unknown, params: Record<string, string>, pathname?: string, secondary?: unknown) {
  return BRIDGE_PAGES[kind].build(data, secondary, ctx(params, pathname))
}

function meta(doc: ReturnType<typeof build>, key: string): string | undefined {
  return doc.head.meta.find((m) => m.name === key || m.property === key)?.content
}

describe("englishT matches the SPA's i18next setup", () => {
  const i18n = i18next.createInstance()
  i18n.init({
    lng: "en",
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
    initAsync: false,
  })
  const t = i18n.t.bind(i18n)

  it("renders every answer builder identically", () => {
    expect(buildCommodityAnswers(f.resource, englishT, "en")).toEqual(
      buildCommodityAnswers(f.resource, t, "en"),
    )
    expect(buildOreAnswers(f.ore, englishT, "en")).toEqual(buildOreAnswers(f.ore, t, "en"))
    expect(buildShipSummary(f.ship, englishT)).toBe(buildShipSummary(f.ship, t))
    expect(buildItemSummary(f.item, englishT)).toBe(buildItemSummary(f.item, t))
  })

  it("resolves the layout title labels", () => {
    expect(englishT("org.orgTitle")).toBe(t("org.orgTitle"))
    expect(englishT("viewProfile.store_tab")).toBe(t("viewProfile.store_tab"))
    expect(englishT("seoAnswers.faqTitle", "x")).toBe("Common questions")
    expect(englishT("missing.key", "Fallback {{n}}")).toBe("Fallback {{n}}")
    expect(englishT("missing.key", { defaultValue: "Hi {{n}}", n: 3 })).toBe("Hi 3")
  })
})

describe("API requests", () => {
  const cases: [BridgePageKind, Record<string, string>, string][] = [
    ["commodity", { id: "5db940a8--gold" }, "/api/v2/game-data/resources/5db940a8--gold"],
    ["resource", { resource_id: "5db940a8--gold" }, "/api/v2/game-data/resources/5db940a8--gold"],
    ["item", { id: "abc" }, "/api/v2/game-data/wiki/items/abc"],
    ["ship", { id: "abc" }, "/api/v2/game-data/wiki/ships/abc"],
    ["ore", { name: "beryl_raw" }, "/api/v2/game-data/mining/ores/beryl_raw"],
    ["miningLocation", { name: "stanton1b" }, "/api/v2/game-data/mining/locations/stanton1b"],
    ["blueprint", { slug: "u-u-i-d" }, "/api/v2/game-data/blueprints/u-u-i-d"],
    ["mission", { slug: "PU_X" }, "/api/v2/game-data/missions/PU_X"],
    ["listing", { id: "71012eb4--medal" }, "/api/v2/listings/71012eb4--medal"],
    ["shop", { slug: "hades" }, "/api/v2/shops/hades"],
    ["org", { id: "NARCO" }, "/api/contractors/NARCO"],
    ["user", { username: "Some Body" }, "/api/profile/user/Some%20Body"],
    ["recruitingPost", { post_id: "p1" }, "/api/recruiting/posts/p1"],
  ]

  it.each(cases)("%s → %s", (kind, params, path) => {
    expect(BRIDGE_PAGES[kind].primary(params).path).toBe(path)
  })

  it("encodes params so they can't change the API path", () => {
    expect(BRIDGE_PAGES.listing.primary({ id: "../profile?x=1#y" }).path).toBe(
      "/api/v2/listings/..%2Fprofile%3Fx%3D1%23y",
    )
  })

  it("treats 404 as unknown on v2 and 400/404 on v1", () => {
    expect(BRIDGE_PAGES.listing.primary({ id: "a" }).notFoundStatuses).toEqual([404])
    expect(BRIDGE_PAGES.org.primary({ id: "a" }).notFoundStatuses).toEqual([400, 404])
    expect(BRIDGE_PAGES.user.primary({ username: "a" }).notFoundStatuses).toEqual([400, 404])
  })

  it("caches static game data longer than live entities", () => {
    const ship = BRIDGE_PAGES.ship.primary({ id: "a" }).ttlSeconds
    const listing = BRIDGE_PAGES.listing.primary({ id: "a" }).ttlSeconds
    expect(ship).toBeGreaterThan(listing)
  })

  it("looks up the org's shop for the JSON-LD owns link", () => {
    expect(BRIDGE_PAGES.org.secondary?.({ id: "NARCO" }).path).toBe(
      "/api/v2/shops/by-owner?spectrum_id=NARCO",
    )
  })
})

describe("documents", () => {
  it("commodity: head, summary and FAQ structured data", () => {
    const doc = build("commodity", f.resource, { id: "5db940a8--gold" })
    expect(doc.title).toBe("Gold — Star Citizen Commodity | SC Market")
    expect(doc.canonical).toBe(`${ORIGIN}/wiki/commodities/5db940a8--gold`)
    expect(meta(doc, "og:type")).toBe("product")
    expect(doc.summary[0]).toEqual({ tag: "h1", text: "Gold" })
    expect(doc.summary[1].text).toContain("Gold is a Star Citizen commodity in the Metal category.")
    expect(doc.summary.some((b) => b.tag === "h3" && b.text === "Where can I buy Gold in Star Citizen?")).toBe(true)
    expect(doc.head.jsonLd.map((j) => (j as { "@type": string })["@type"])).toEqual(["Product", "FAQPage"])
  })

  it("resource: canonical points at the wiki commodity", () => {
    const doc = build("resource", f.resource, { resource_id: "x" })
    expect(doc.canonical).toBe(`${ORIGIN}/wiki/commodities/5db940a8--gold`)
    expect(doc.title).toBe("Gold — Star Citizen Resource | SC Market")
  })

  it("item, ship, ore, mining location, blueprint, mission", () => {
    expect(build("item", f.item, { id: "x" }).summary[1].text).toContain("LifeCure Medsticks is an item in Star Citizen.")
    const ship = build("ship", f.ship, { id: "x" })
    expect(ship.canonical).toBe(`${ORIGIN}/wiki/ships/57e51d27--crusader-intrepid`)
    expect(ship.summary.map((b) => b.text)).toContain("A starter ship.")
    const ore = build("ore", f.ore, { name: "beryl_raw" })
    expect(ore.title).toBe("Beryl — Star Citizen Mining Ore | SC Market")
    expect(ore.canonical).toBe(`${ORIGIN}/mining/ores/beryl_raw`)
    expect(ore.summary[1].text).toContain("Yela (Stanton)")
    const loc = build("miningLocation", f.miningLocation, { name: "stanton1b" })
    expect(loc.head.jsonLd[0]).toMatchObject({ "@type": "Place", containedInPlace: { name: "Stanton" } })
    const bp = build("blueprint", f.blueprint, { slug: "bp-1" })
    expect(bp.title).toBe("Arrowhead Sniper Rifle — Star Citizen Blueprint | SC Market")
    expect(bp.summary.map((b) => b.text)).toContain("Ingredients: Gold, Barrel.")
    const mission = build("mission", f.mission, { slug: "PU_X" })
    expect(meta(mission, "og:description")).toBe("Haul waste.")
    expect(mission.canonical).toBe(`${ORIGIN}/missions/PU_X`)
  })

  it("listing, shop, recruiting post", () => {
    const listing = build("listing", f.listing(), { id: "x" })
    expect(listing.title).toBe("Pristine Medal — SC Market")
    expect(meta(listing, "og:title")).toBe("Pristine Medal")
    expect(listing.canonical).toBe(`${ORIGIN}/market/71012eb4--pristine-medal`)
    const shop = build("shop", f.shop(), { slug: "hades-svk-shop" })
    expect(shop.head.jsonLd[0]).toMatchObject({ "@type": "Store", aggregateRating: { ratingCount: 3 } })
    const post = build("recruitingPost", f.recruitingPost(), { post_id: "x" })
    expect(post.title).toBe("Join us — Star Citizen Recruiting | SC Market")
    expect(post.head.jsonLd[0]).toMatchObject({ "@type": "JobPosting", datePosted: "2026-01-02T03:04:05.000Z" })
  })

  it("org and user take title and canonical from the layout", () => {
    const org = build("org", f.contractor(), { id: "NARCO" }, "/contractor/NARCO/members", [
      { name: "Narco Shop", slug: "narco-shop" },
    ])
    expect(org.title).toBe("Narco - Org - SC Market")
    expect(org.canonical).toBe(`${ORIGIN}/contractor/NARCO/members`)
    expect(org.head.jsonLd[0]).toMatchObject({ owns: { url: `${ORIGIN}/shops/narco-shop` } })
    const user = build("user", f.user(), { username: "JackedCitizen" }, "/user/JackedCitizen")
    expect(user.title).toBe("Jacked Citizen - Store - SC Market")
    expect(user.canonical).toBe(`${ORIGIN}/user/JackedCitizen`)
    expect(meta(user, "description")).toBe("Jacked Citizen — Star Citizen player on SC Market")
  })

  it("keeps hostile text as data (escaped later, never interpreted here)", () => {
    const doc = build("listing", f.listing(f.EVIL), { id: "x" })
    expect(doc.summary[0]).toEqual({ tag: "h1", text: f.EVIL })
    expect(doc.title).toBe(`${f.EVIL} — SC Market`)
  })

  it("truncates long summary text", () => {
    const long = build("listing", { ...f.listing(), listing: { ...f.listing().listing, description: "word ".repeat(400) } }, { id: "x" })
    expect(long.summary[1].text.length).toBeLessThanOrEqual(500)
    expect(long.summary[1].text.endsWith("…")).toBe(true)
  })
})
