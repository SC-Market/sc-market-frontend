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
import type { SummaryBlock } from "../pages"
import * as f from "./fixtures"
import { faqPageJsonLd } from "../../seo/pageHead"
import {
  homeSeoText,
  landingFaqs,
  MAIN_HUB_LINKS,
  siteJsonLd,
} from "../../seo/siteHeads"
import {
  buildMarketSearchHead,
  contractorsSeoText,
  manufacturersSeoText,
  MAX_HUB_LINKS,
  miningSeoText,
  resourcesSeoText,
  WIKI_HUB_SECTIONS,
  wikiHubSeoText,
  wikiLocationsSeoText,
} from "../../seo/hubHeads"

import { STOREFRONTS_PAGE_SIZE } from "../../features/storefront/domain"

const ORIGIN = "https://sc-market.space"

function ctx(params: Record<string, string>, pathname = "/x"): PageContext {
  return { params, origin: ORIGIN, pathname, pageNumber: 1, related: {} }
}

function build(
  kind: BridgePageKind,
  data: unknown,
  params: Record<string, string>,
  pathname?: string,
  secondary?: unknown,
) {
  return BRIDGE_PAGES[kind].build(data, secondary, ctx(params, pathname))
}

/** A text block's text ("" for link lists). */
function text(block: SummaryBlock): string {
  return "text" in block ? block.text : ""
}

function meta(doc: ReturnType<typeof build>, key: string): string | undefined {
  return doc.head.meta.find((m) => m.name === key || m.property === key)
    ?.content
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
    expect(buildOreAnswers(f.ore, englishT, "en")).toEqual(
      buildOreAnswers(f.ore, t, "en"),
    )
    expect(buildShipSummary(f.ship, englishT)).toBe(buildShipSummary(f.ship, t))
    expect(buildItemSummary(f.item, englishT, "en")).toBe(
      buildItemSummary(f.item, t, "en"),
    )
  })

  it("resolves the layout title labels", () => {
    expect(englishT("org.orgTitle")).toBe(t("org.orgTitle"))
    expect(englishT("viewProfile.store_tab")).toBe(t("viewProfile.store_tab"))
    expect(englishT("recruiting.scOrgsNote")).toBe(t("recruiting.scOrgsNote"))
    expect(englishT("recruiting.scOrgsLfoNote")).toBe(
      t("recruiting.scOrgsLfoNote"),
    )
    expect(englishT("seoAnswers.faqTitle", "x")).toBe("Common questions")
    expect(englishT("missing.key", "Fallback {{n}}")).toBe("Fallback {{n}}")
    expect(englishT("missing.key", { defaultValue: "Hi {{n}}", n: 3 })).toBe(
      "Hi 3",
    )
  })
})

describe("API requests", () => {
  const cases: [BridgePageKind, Record<string, string>, string][] = [
    [
      "commodity",
      { id: "5db940a8--gold" },
      "/api/v2/game-data/resources/5db940a8--gold",
    ],
    [
      "resource",
      { resource_id: "5db940a8--gold" },
      "/api/v2/game-data/resources/5db940a8--gold",
    ],
    ["item", { id: "abc" }, "/api/v2/game-data/wiki/items/abc"],
    ["ship", { id: "abc" }, "/api/v2/game-data/wiki/ships/abc"],
    ["ore", { name: "beryl_raw" }, "/api/v2/game-data/mining/ores/beryl_raw"],
    [
      "miningLocation",
      { name: "stanton1b" },
      "/api/v2/game-data/mining/locations/stanton1b",
    ],
    ["blueprint", { slug: "u-u-i-d" }, "/api/v2/game-data/blueprints/u-u-i-d"],
    ["mission", { slug: "PU_X" }, "/api/v2/game-data/missions/PU_X"],
    ["listing", { id: "71012eb4--medal" }, "/api/v2/listings/71012eb4--medal"],
    ["shop", { slug: "hades" }, "/api/v2/shops/hades"],
    ["org", { id: "NARCO" }, "/api/contractors/NARCO"],
    ["user", { username: "Some Body" }, "/api/profile/user/Some%20Body"],
    ["recruitingPost", { post_id: "p1" }, "/api/recruiting/posts/p1"],
  ]

  it.each(cases)("%s → %s", (kind, params, path) => {
    expect(BRIDGE_PAGES[kind].primary!(params).path).toBe(path)
  })

  it("encodes params so they can't change the API path", () => {
    expect(BRIDGE_PAGES.listing.primary!({ id: "../profile?x=1#y" }).path).toBe(
      "/api/v2/listings/..%2Fprofile%3Fx%3D1%23y",
    )
  })

  it("treats 404 as unknown on v2 and 400/404 on v1", () => {
    expect(BRIDGE_PAGES.listing.primary!({ id: "a" }).notFoundStatuses).toEqual(
      [404],
    )
    expect(BRIDGE_PAGES.org.primary!({ id: "a" }).notFoundStatuses).toEqual([
      400, 404,
    ])
    expect(
      BRIDGE_PAGES.user.primary!({ username: "a" }).notFoundStatuses,
    ).toEqual([400, 404])
  })

  it("caches static game data longer than live entities", () => {
    const ship = BRIDGE_PAGES.ship.primary!({ id: "a" }).ttlSeconds
    const listing = BRIDGE_PAGES.listing.primary!({ id: "a" }).ttlSeconds
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
    expect(text(doc.summary[1])).toContain(
      "Gold is a Star Citizen commodity in the Metal category.",
    )
    expect(
      doc.summary.some(
        (b) =>
          b.tag === "h3" && text(b) === "Where can I buy Gold in Star Citizen?",
      ),
    ).toBe(true)
    expect(
      doc.head.jsonLd.map((j) => (j as { "@type": string })["@type"]),
    ).toEqual(["Product", "FAQPage"])
  })

  it("resource: canonical points at the wiki commodity", () => {
    const doc = build("resource", f.resource, { resource_id: "x" })
    expect(doc.canonical).toBe(`${ORIGIN}/wiki/commodities/5db940a8--gold`)
    expect(doc.title).toBe("Gold — Star Citizen Resource | SC Market")
  })

  it("item, ship, ore, mining location, blueprint, mission", () => {
    expect(text(build("item", f.item, { id: "x" }).summary[1])).toContain(
      "LifeCure Medsticks is an item in Star Citizen.",
    )
    const ship = build("ship", f.ship, { id: "x" })
    expect(ship.canonical).toBe(
      `${ORIGIN}/wiki/ships/57e51d27--crusader-intrepid`,
    )
    expect(ship.summary.map(text)).toContain("A starter ship.")
    const ore = build("ore", f.ore, { name: "beryl_raw" })
    expect(ore.title).toBe("Beryl — Star Citizen Mining Ore | SC Market")
    expect(ore.canonical).toBe(`${ORIGIN}/mining/ores/beryl_raw`)
    expect(text(ore.summary[1])).toContain("Yela (Stanton)")
    const loc = build("miningLocation", f.miningLocation, { name: "stanton1b" })
    expect(loc.head.jsonLd[0]).toMatchObject({
      "@type": "Place",
      containedInPlace: { name: "Stanton" },
    })
    const bp = build("blueprint", f.blueprint, { slug: "bp-1" })
    expect(bp.title).toBe(
      "Arrowhead Sniper Rifle — Star Citizen Blueprint | SC Market",
    )
    expect(bp.summary.map(text)).toContain("Ingredients: Gold, Barrel.")
    const mission = build("mission", f.mission, { slug: "PU_X" })
    expect(meta(mission, "og:description")).toBe(
      "Waste Disposal is a delivery Star Citizen mission in Stanton, paying 5,000 aUEC.",
    )
    expect(
      mission.head.jsonLd.map((j) => (j as { "@type": string })["@type"]),
    ).toEqual(["WebPage", "BreadcrumbList"])
    expect(mission.canonical).toBe(`${ORIGIN}/missions/PU_X`)
  })

  it("item: how to get it, with links, attribution and an acquisition description", () => {
    const doc = BRIDGE_PAGES.item.build(f.item, undefined, {
      ...ctx({ id: "x" }),
      related: { acquisition: f.acquisition() },
    })
    expect(doc.title).toBe(
      "How to Get LifeCure Medsticks in Star Citizen | SC Market",
    )
    expect(meta(doc, "description")).toBe(
      "How to get LifeCure Medsticks in Star Citizen: buy it from 3 player sellers from 450,000 aUEC, earn it from 2 missions or craft it from 1 blueprint. Stats and…",
    )
    const texts = doc.summary.map(text)
    expect(texts).toContain("How to get LifeCure Medsticks")
    expect(texts).toContain("Buy from players")
    expect(texts).toContain("Missions that reward it")
    expect(texts).toContain("Craft it")
    expect(texts).not.toContain("In-game shops")
    expect(texts).not.toContain("Mining, salvage and loot")
    expect(texts).toContain("Showing 1 of 2 missions")
    const facts = doc.summary.flatMap((b) =>
      b.tag === "ul-text" ? b.items : [],
    )
    expect(facts).toEqual(
      expect.arrayContaining([
        "Lowest ask: 450,000 aUEC",
        "Median ask: 650,000 aUEC",
        "Sellers: 3",
      ]),
    )
    const links = doc.summary.flatMap((b) => (b.tag === "ul" ? b.links : []))
    expect(links).toEqual(
      expect.arrayContaining([
        {
          href: "/market/5e2d1f98--siebe-helmet",
          text: "Siebe Helmet — 450,000 aUEC — 1 in stock",
        },
        {
          href: "/market/aggregate/9bb3a108--siebe-helmet",
          text: "Compare all LifeCure Medsticks listings",
        },
        {
          href: "/missions/Rayari_Rank3_IrradiatedPearls",
          text: "Additional Resources For Research — Blueprint reward — 3.6% drop chance — Giver: Rayari Incorporated",
        },
        {
          href: "/blueprints/BP_CRAFT_clda_utility_heavy_helmet_03_01_01",
          text: "LifeCure Medsticks blueprint — Crafting time: 6m 30s — Missions that award this blueprint: 1",
        },
        {
          href: "/wiki/items/51c80361--stileron",
          text: "Stileron — 0.08 SCU, Shell",
        },
      ]),
    )
    expect(doc.summary).toEqual(
      expect.arrayContaining([
        {
          tag: "external",
          href: "https://api.sc-market.space/api/public/items/9bb3a108--siebe-helmet.json",
          text: "JSON data: LifeCure Medsticks",
        },
        {
          tag: "external",
          href: "https://creativecommons.org/licenses/by/4.0/",
          text: "CC BY 4.0",
        },
      ]),
    )
    expect(texts).toContain(
      "Data: SC Market (sc-market.space), CC BY 4.0. Game data © Cloud Imperium Games.",
    )
    // No Offer/AggregateOffer: aUEC is not ISO 4217.
    expect(JSON.stringify(doc.head.jsonLd)).not.toMatch(/Offer/)
  })

  it("item: a failed acquisition lookup leaves the section out; the description stays generic", () => {
    const doc = build("item", f.item, { id: "x" })
    expect(doc.summary.map(text)).not.toContain("How to get LifeCure Medsticks")
    expect(meta(doc, "description")).toBe(
      "How to get LifeCure Medsticks in Star Citizen: player listings, missions, crafting and stats for this Medical by CureLife.",
    )
  })

  it("mission: item rewards and blueprint outputs link to the item page when the API resolved them", () => {
    const data = {
      ...f.mission,
      mission: {
        ...f.mission.mission,
        item_rewards: [
          {
            name: "Anvil F7 Hornet Mk Wikelo",
            ref: "x",
            game_item_id: "88cd66e1-cf5c-4a85-a464-eff8344d3695",
            game_item_slug: "88cd66e1--anvil-f7-hornet-mk-wikelo",
          },
          {
            name: "Mystery Box",
            ref: "y",
            game_item_id: null,
            game_item_slug: null,
          },
        ],
      },
      blueprint_rewards: [
        {
          blueprints: [
            {
              blueprint_id: "b1",
              blueprint_code: "c1",
              blueprint_name: "BP_CRAFT_helmet",
              output_item_name: "Siebe Helmet",
              output_game_item_id: "9bb3a108-3556-4934-ae04-9a117e5432a2",
              output_game_item_slug: "9bb3a108--siebe-helmet",
              drop_probability: 3.57,
              is_guaranteed: false,
            },
          ],
        },
      ],
    } as unknown as typeof f.mission
    const doc = build("mission", data, { slug: "PU_X" })
    const links = doc.summary.flatMap((b) => (b.tag === "ul" ? b.links : []))
    expect(links).toEqual(
      expect.arrayContaining([
        {
          href: "/wiki/items/88cd66e1--anvil-f7-hornet-mk-wikelo",
          text: "Anvil F7 Hornet Mk Wikelo: how to get it",
        },
        {
          href: "/wiki/items/9bb3a108--siebe-helmet",
          text: "Siebe Helmet: how to get it",
        },
        {
          href: "/market/aggregate/9bb3a108--siebe-helmet",
          text: "Siebe Helmet on the market",
        },
      ]),
    )
    expect(
      doc.summary.flatMap((b) => (b.tag === "ul-text" ? b.items : [])),
    ).toContain("Mystery Box")
    // The output item comes with the mission: no per-blueprint lookups.
    const stages = BRIDGE_PAGES.mission.related ?? []
    const requested = stages.flatMap((stage) =>
      Object.keys(stage(data, undefined, {}, { slug: "PU_X" })),
    )
    expect(requested.some((key) => key.startsWith("blueprint"))).toBe(false)
  })

  it("listing, shop, recruiting post", () => {
    const listing = build("listing", f.listing(), { id: "x" })
    expect(listing.title).toBe(
      "Pristine Medal — 12,000 aUEC · Star Citizen | SC Market",
    )
    expect(meta(listing, "og:title")).toBe("Pristine Medal — 12,000 aUEC")
    expect(listing.canonical).toBe(`${ORIGIN}/market/71012eb4--pristine-medal`)
    const shop = build("shop", f.shop(), { slug: "hades-svk-shop" })
    expect(shop.head.jsonLd[0]).toMatchObject({
      "@type": "Store",
      aggregateRating: { ratingCount: 3 },
    })
    const post = build("recruitingPost", f.recruitingPost(), { post_id: "x" })
    expect(post.title).toBe("Join us — Star Citizen Recruiting | SC Market")
    expect(post.head.jsonLd[0]).toMatchObject({
      "@type": "JobPosting",
      datePosted: "2026-01-02T03:04:05.000Z",
    })
  })

  it("org and user take title and canonical from the layout", () => {
    const org = build(
      "org",
      f.contractor(),
      { id: "NARCO" },
      "/contractor/NARCO/members",
      [{ name: "Narco Shop", slug: "narco-shop" }],
    )
    expect(org.title).toBe("Narco - Org - SC Market")
    expect(org.canonical).toBe(`${ORIGIN}/contractor/NARCO/members`)
    expect(org.head.jsonLd[0]).toMatchObject({
      owns: { url: `${ORIGIN}/shops/narco-shop` },
    })
    const user = build(
      "user",
      f.user(),
      { username: "JackedCitizen" },
      "/user/JackedCitizen",
    )
    expect(user.title).toBe("Jacked Citizen - Store - SC Market")
    expect(user.canonical).toBe(`${ORIGIN}/user/JackedCitizen`)
    expect(meta(user, "description")).toBe(
      "Jacked Citizen — Star Citizen player on SC Market",
    )
  })

  it("org pages carry the storefront: trust stats, featured listings and services", () => {
    const storefront = {
      spectrum_id: "NARCO",
      name: "Narco",
      logo_url: null,
      banner_url: null,
      verified: true,
      trust: {
        completed_orders: 23,
        avg_rating: 4.94,
        rating_count: 12,
        response_rate: 91.6,
        avg_completion_hours: 5,
        members: 8,
        active_listings: 29,
        active_services: 1,
        on_sc_market_since: "2024-03-01T00:00:00.000Z",
      },
      shops: [],
      services: [
        {
          service_id: "svc-1",
          service_name: "Escort run",
          kind: null,
          cost: 0,
          payment_type: "one-time",
        },
      ],
      recruiting: null,
    }
    const doc = BRIDGE_PAGES.org.build(
      f.contractor() as never,
      [{ name: "Narco Shop", slug: "narco-shop" }] as never,
      {
        ...ctx({ id: "NARCO" }, "/contractor/NARCO"),
        related: { storefront, listings: { listings: [], total: 0 } },
      },
    )
    const texts = doc.summary.map(text)
    expect(texts).toContain(
      "RSI-verified org. 23 completed orders. Rated 4.9/5 from 12 reviews. 92% of orders completed within 24 hours. 8 members on SC Market. 29 active listings. 1 service. On SC Market since 2024.",
    )
    expect(doc.summary).toContainEqual({
      tag: "ul",
      links: [{ href: "/order/service/svc-1", text: "Escort run" }],
    })
  })

  // Unlisted listings are link-only and private ones org-internal: a crawler
  // that follows a link to one must not index it.
  it("unlisted and private listings and bundles are noindex; public ones are not", () => {
    const withVisibility = (visibility: string) =>
      ({
        ...f.listing(),
        listing: { ...f.listing().listing, visibility },
      }) as ReturnType<typeof f.listing>
    for (const visibility of ["unlisted", "private"]) {
      expect(
        meta(
          build("listing", withVisibility(visibility), { id: "x" }),
          "robots",
        ),
      ).toBe("noindex")
      expect(
        meta(
          build(
            "bundle",
            {
              ...f.bundle(),
              listing: { ...f.bundle().listing, visibility },
            } as ReturnType<typeof f.bundle>,
            { id: "x" },
            "/market/multiple/x",
          ),
          "robots",
        ),
      ).toBe("noindex")
    }
    expect(
      meta(build("listing", withVisibility("public"), { id: "x" }), "robots"),
    ).toBeUndefined()
  })

  it("keeps hostile text as data (escaped later, never interpreted here)", () => {
    const doc = build("listing", f.listing(f.EVIL), { id: "x" })
    expect(doc.summary[0]).toEqual({ tag: "h1", text: f.EVIL })
    expect(doc.title).toBe(`${f.EVIL} — 12,000 aUEC · Star Citizen | SC Market`)
  })

  it("listing body: price, stock, seller and rating, dates, and 10+ links", () => {
    const search = (prefix: string, shop: string, n: number) => ({
      listings: Array.from({ length: n }, (_, i) => ({
        listing_id: `${prefix}${i}0000-0000`,
        title: `${prefix} ${i}`,
        price_min: 1000 + i,
        shop_name: shop,
        shop_slug: shop.toLowerCase(),
      })),
      total: n,
      page: 1,
      page_size: 12,
    })
    const doc = BRIDGE_PAGES.listing.build(f.listing(), undefined, {
      ...ctx({ id: "71012eb4--pristine-medal" }),
      related: {
        shop: { ...f.shop(), rating: 4.8, rating_count: 12 },
        sellerListings: search("aaaa", "Hades", 6),
        sameItem: search("bbbb", "Other", 8),
      },
    })
    const body = doc.summary.map(text).join("\n")
    expect(body).toContain("Price: 12,000 aUEC per unit.")
    expect(body).toContain("3 units available.")
    expect(body).toContain("Sold by Hades (rated 4.8/5 from 12 reviews).")
    expect(body).toContain("Listed 30 Oct 2026.")
    const links = linksOf(doc).map((l) => l.href)
    expect(links).toContain("/market/aggregate/1954c364--pristine-medal")
    expect(links).toContain("/wiki/items/1954c364--pristine-medal")
    expect(links).toContain("/shops/hades-svk-shop")
    expect(links.filter((h) => h.startsWith("/market/aaaa"))).toHaveLength(6)
    expect(links.filter((h) => h.startsWith("/market/bbbb"))).toHaveLength(8)
    expect(links.length).toBeGreaterThanOrEqual(10)
    expect(doc.head.meta.find((m) => m.name === "description")?.content).toBe(
      "12,000 aUEC · sold by Hades · rated 5/5 · 3 available. Pristine Medal in mint condition",
    )
    expect(JSON.stringify(doc.head.jsonLd)).not.toMatch(/Offer|priceCurrency/)
    expect(
      doc.head.jsonLd.map((j) => (j as { "@type": string })["@type"]),
    ).toEqual(["Product", "BreadcrumbList"])
  })

  it("truncates long summary text", () => {
    const long = build(
      "listing",
      {
        ...f.listing(),
        listing: { ...f.listing().listing, description: "word ".repeat(400) },
      },
      { id: "x" },
    )
    const description = long.summary.find(
      (b) => b.tag === "p" && b.text.startsWith("word"),
    )!
    expect(text(description).length).toBeLessThanOrEqual(500)
    expect(text(description).endsWith("…")).toBe(true)
  })
})

describe("hub and static page text matches the SPA's i18next", () => {
  const i18n = i18next.createInstance()
  i18n.init({
    lng: "en",
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
    initAsync: false,
  })
  const t = i18n.t.bind(i18n)

  it("resolves every key the static pages and hubs render", () => {
    expect(landingFaqs(englishT)).toEqual(landingFaqs(t))
    expect(homeSeoText(englishT)).toEqual(homeSeoText(t))
    expect(wikiHubSeoText(englishT)).toEqual(wikiHubSeoText(t))
    for (const fn of [
      contractorsSeoText,
      miningSeoText,
      manufacturersSeoText,
      wikiLocationsSeoText,
      resourcesSeoText,
    ]) {
      expect(fn(englishT)).toEqual(fn(t))
    }
    expect(englishT("landing.faqTitle", "x")).toBe(t("landing.faqTitle"))
    for (const section of WIKI_HUB_SECTIONS) {
      expect(englishT(section.labelKey, section.label)).toBe(
        t(section.labelKey, section.label),
      )
    }
    // Real translations, not key fallbacks.
    expect(landingFaqs(englishT)[0].question).toBe("Does SC Market take a fee?")
    expect(miningSeoText(englishT).title).toBe("Mining Database")
  })
})

describe("hub API requests", () => {
  const cases: [BridgePageKind, string][] = [
    ["market", "/api/v2/listings/search?page=1&page_size=48&quantity_min=1"],
    [
      "shops",
      "/api/v2/shops?page=1&page_size=24&sort_by=rating&sort_order=desc",
    ],
    ["storefronts", "/api/v2/contractors/storefronts?page=1&page_size=24"],
    ["wikiItems", "/api/v2/game-data/wiki/items?page=1&page_size=50"],
    ["wikiShips", "/api/v2/game-data/wiki/ships?page=1&page_size=50"],
    [
      "wikiCommodities",
      "/api/v2/game-data/wiki/commodities?page=1&page_size=50",
    ],
    ["wikiManufacturers", "/api/v2/game-data/wiki/manufacturers"],
    ["miningOres", "/api/v2/game-data/mining/ores?page=1&page_size=50"],
    [
      "miningLocations",
      "/api/v2/game-data/mining/locations?page=1&page_size=50",
    ],
    ["blueprints", "/api/v2/game-data/blueprints/search?page=1&page_size=50"],
    ["missions", "/api/v2/game-data/missions/search?page=1&page_size=50"],
    ["resources", "/api/v2/game-data/resources/search?page=1&page_size=50"],
    [
      "recruiting",
      "/api/recruiting/posts?index=0&pageSize=50&sorting=activity",
    ],
    [
      "contractors",
      "/api/contractors?index=0&pageSize=50&sorting=date-reverse",
    ],
  ]

  it.each(cases)("%s → %s, never 'not found'", (kind, path) => {
    const req = BRIDGE_PAGES[kind].primary!({})
    expect(req.path).toBe(path)
    expect(req.notFoundStatuses).toEqual([])
  })

  it.each(["home", "wikiHub", "wikiLocations"] as BridgePageKind[])(
    "%s makes no API call",
    (kind) => {
      expect(BRIDGE_PAGES[kind].primary).toBeUndefined()
    },
  )

  it("detail pages", () => {
    expect(
      BRIDGE_PAGES.aggregate.primary!({ id: "1954c364--medal" }).path,
    ).toBe("/api/v2/game-items/1954c364--medal/listings")
    expect(BRIDGE_PAGES.bundle.primary!({ id: "b0ba0ba0--x" }).path).toBe(
      "/api/v2/listings/b0ba0ba0--x",
    )
    expect(
      BRIDGE_PAGES.manufacturer.primary!({ id: "Klaus & Werner" }).path,
    ).toBe("/api/v2/game-data/wiki/manufacturers/Klaus%20%26%20Werner")
    for (const kind of [
      "aggregate",
      "bundle",
      "manufacturer",
    ] as BridgePageKind[]) {
      expect(BRIDGE_PAGES[kind].primary!({ id: "x" }).notFoundStatuses).toEqual(
        [404],
      )
    }
  })
})

describe("recruiting hub", () => {
  it("points recruiters to SC Orgs and players to its Looking for Org board, like the SPA's ScOrgsNote", () => {
    const doc = build(
      "recruiting",
      { data: { items: [], total: 0 } },
      {},
      "/recruiting",
    )
    const external = doc.summary.filter((b) => b.tag === "external")
    expect(external).toEqual([
      {
        tag: "external",
        href: "https://sc-orgs.space/",
        text: englishT("recruiting.scOrgsNote"),
      },
      {
        tag: "external",
        href: "https://sc-orgs.space/lfo",
        text: englishT("recruiting.scOrgsLfoNote"),
      },
    ])
    expect(external[1].tag === "external" && external[1].text).toMatch(
      /^Looking for an org\?/,
    )
  })
})

function jsonLdTypes(doc: ReturnType<typeof build>): string[] {
  return doc.head.jsonLd.map(
    (j) => (j as { "@type"?: string })["@type"] ?? "@graph",
  )
}

/** The page's entry links (not the hub's page-number links). */
function linksOf(doc: ReturnType<typeof build>) {
  return doc.summary
    .flatMap((b) => (b.tag === "ul" ? b.links : []))
    .filter((l) => !/[?]page=\d+$/.test(l.href) && !l.text.startsWith("Page "))
}

describe("homepage", () => {
  const doc = build("home", undefined, {}, "/")

  it("has the keyword title, canonical and site + FAQ structured data", () => {
    expect(doc.title).toBe(
      "SC Market — Star Citizen Trading Marketplace: Buy, Sell & Trade Items for aUEC",
    )
    expect(doc.canonical).toBe(`${ORIGIN}/`)
    expect(meta(doc, "description")).toBe(homeSeoText(englishT).description)
    expect(meta(doc, "og:title")).toBe(doc.title)
    expect(jsonLdTypes(doc)).toEqual(["@graph", "FAQPage"])
    // Same objects the SPA's Footer and FAQSection render.
    expect(doc.head.jsonLd[0]).toEqual(siteJsonLd())
    const graph = (doc.head.jsonLd[0] as { "@graph": { "@type": string }[] })[
      "@graph"
    ]
    expect(graph.map((n) => n["@type"])).toEqual(["Organization", "WebSite"])
    expect(doc.head.jsonLd[1]).toEqual(faqPageJsonLd(landingFaqs(englishT)))
  })

  it("has the SPA hero's keyword <h1> and intro line", () => {
    expect(doc.summary[0]).toEqual({
      tag: "h1",
      text: englishT("landing.heroTitle"),
    })
    expect(doc.summary[0].tag === "h1" && doc.summary[0].text).toContain(
      "Star Citizen",
    )
    expect(doc.summary[1]).toEqual({
      tag: "p",
      text: englishT("landing.heroText"),
    })
  })

  it("has the SPA homepage's sections: intents, start selling, why SC Market", () => {
    const headings = doc.summary.flatMap((b) =>
      b.tag === "h2" ? [b.text] : [],
    )
    expect(headings).toEqual([
      "What do you want to do?",
      "Browse SC Market",
      "Start selling",
      "Free to use, with two-way reviews",
      "Common questions",
    ])
    expect(linksOf(doc)[0]).toEqual({
      href: "/market",
      text: "Buy: Items from player shops",
    })
    expect(doc.summary).toContainEqual({
      tag: "ol",
      items: [
        "List it: Any item or service, any quantity, priced in aUEC.",
        "Get a Discord alert: The bot pings you and opens a thread for each order.",
        "Meet in game: Hand off the goods and aUEC, then rate each other.",
      ],
    })
    expect(doc.summary).toContainEqual({ tag: "h3", text: "Two-way reviews" })
  })

  it("includes the official / buying / orgs FAQs in the Q&A and FAQPage", () => {
    const questions = landingFaqs(englishT).map((f) => f.question)
    expect(questions).toEqual(
      expect.arrayContaining([
        "Is SC Market affiliated with Cloud Imperium Games?",
        "How do I buy items in Star Citizen from other players?",
        "Can my org sell on SC Market?",
      ]),
    )
    const faqLd = doc.head.jsonLd[1] as { mainEntity: { name: string }[] }
    expect(faqLd.mainEntity.map((q) => q.name)).toEqual(questions)
  })

  it("shows the FAQ as visible Q&A and links every main hub", () => {
    for (const faq of landingFaqs(englishT)) {
      expect(doc.summary).toContainEqual({ tag: "h3", text: faq.question })
      expect(doc.summary).toContainEqual({ tag: "p", text: faq.answer })
    }
    expect(linksOf(doc).map((l) => l.href)).toEqual([
      "/market",
      "/market/services",
      "/buyorder/create",
      "/market/create",
      ...MAIN_HUB_LINKS.map((l) => l.href),
    ])
    for (const href of [
      "/market",
      "/shops",
      "/wiki",
      "/mining",
      "/blueprints",
      "/missions",
      "/recruiting",
      "/contractors",
    ]) {
      expect(linksOf(doc).map((l) => l.href)).toContain(href)
    }
  })
})

describe("hub documents", () => {
  describe("storefronts, a page at a time (the SPA's storefrontsHubArgs pages)", () => {
    const cards = (from: number, n: number) =>
      Array.from({ length: n }, (_, i) => ({
        spectrum_id: `ORG${from + i}`,
        name: `Org ${from + i}`,
        tagline: "",
      }))
    const atPage = (pageNumber: number, data: unknown) =>
      BRIDGE_PAGES.storefronts.build(data, undefined, {
        ...ctx({}, "/storefronts"),
        pageNumber,
      })

    it("asks the API for page N with the SPA's page size", () => {
      expect(BRIDGE_PAGES.storefronts.paginated).toBe(true)
      expect(BRIDGE_PAGES.storefronts.primary!({}, 3).path).toBe(
        `/api/v2/contractors/storefronts?page=3&page_size=${STOREFRONTS_PAGE_SIZE}`,
      )
    })

    it("page 1 is the clean hub with links to the other pages", () => {
      const doc = atPage(1, {
        storefronts: cards(0, 24),
        total: 60,
        page: 1,
        page_size: 24,
        fields: [],
      })
      expect(doc.canonical).toBe(`${ORIGIN}/storefronts`)
      expect(doc.title).toBe("Org storefronts - SC Market")
      expect(linksOf(doc)).toHaveLength(24)
      const pageLinks = doc.summary
        .flatMap((b) => (b.tag === "ul" ? b.links : []))
        .filter((l) => l.href.includes("?page="))
      expect(pageLinks).toContainEqual({
        href: "/storefronts?page=2",
        text: "Next page (2)",
        rel: "next",
      })
      expect(pageLinks.map((l) => l.href)).toContain("/storefronts?page=3")
    })

    it("page 2 is self-canonical, says its page, and links its own orgs", () => {
      const doc = atPage(2, {
        storefronts: cards(24, 24),
        total: 60,
        page: 2,
        page_size: 24,
        fields: [],
      })
      expect(doc.canonical).toBe(`${ORIGIN}/storefronts?page=2`)
      expect(meta(doc, "og:url")).toBe(`${ORIGIN}/storefronts?page=2`)
      expect(doc.title).toBe("Org storefronts — Page 2 - SC Market")
      expect(meta(doc, "description")).toMatch(/ Page 2 of 3\.$/)
      expect(linksOf(doc)[0]).toEqual({
        href: "/contractor/ORG24",
        text: "Org 24",
      })
      const rels = doc.summary
        .flatMap((b) => (b.tag === "ul" ? b.links : []))
        .filter((l) => l.rel)
      expect(rels).toEqual([
        { href: "/storefronts", text: "Previous page (1)", rel: "prev" },
        { href: "/storefronts?page=3", text: "Next page (3)", rel: "next" },
      ])
    })

    it("a page past the end is a 404", () => {
      expect(
        atPage(4, {
          storefronts: [],
          total: 60,
          page: 4,
          page_size: 24,
          fields: [],
        }).status,
      ).toBe(404)
    })
  })

  it("wiki items: SPA title/description, canonical, breadcrumbs, bounded ItemList", () => {
    const doc = build("wikiItems", f.wikiItems(200), {}, "/wiki/items")
    expect(doc.title).toBe("All Items — Star Citizen Game Database | SC Market")
    expect(meta(doc, "description")).toBe(
      "Browse 11555 Star Citizen items. Stats, prices, crafting uses, and locations.",
    )
    expect(doc.canonical).toBe(`${ORIGIN}/wiki/items`)
    expect(meta(doc, "og:url")).toBe(`${ORIGIN}/wiki/items`)
    expect(jsonLdTypes(doc)).toEqual(["BreadcrumbList", "CollectionPage"])
    expect(doc.head.jsonLd[0]).toMatchObject({
      itemListElement: [
        { position: 1, item: `${ORIGIN}/` },
        { position: 2, name: "Game Database", item: `${ORIGIN}/wiki` },
        { position: 3, item: `${ORIGIN}/wiki/items` },
      ],
    })
    const links = linksOf(doc)
    expect(links).toHaveLength(MAX_HUB_LINKS)
    expect(links[0]).toEqual({
      href: "/wiki/items/38fc7b63--item-0",
      text: "Item 0 — Medical",
    })
    const list = (
      doc.head.jsonLd[1] as {
        mainEntity: { numberOfItems: number; itemListElement: unknown[] }
      }
    ).mainEntity
    expect(list.numberOfItems).toBe(MAX_HUB_LINKS)
    expect(list.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Item 0 — Medical",
      url: `${ORIGIN}/wiki/items/38fc7b63--item-0`,
    })
  })

  it("every hub stays within the link bound", () => {
    const many = <T>(n: number, fn: (i: number) => T) =>
      Array.from({ length: n }, (_, i) => fn(i))
    const docs = [
      build(
        "market",
        {
          listings: many(120, (i) => ({
            listing_id: `l${i}`,
            title: `L${i}`,
            shop_name: "S",
            price_min: 5,
          })),
          total: 120,
        },
        {},
      ),
      build(
        "shops",
        {
          shops: many(120, (i) => ({ slug: `s${i}`, name: `S${i}` })),
          total: 120,
        },
        {},
      ),
      build(
        "wikiManufacturers",
        many(1040, (i) => ({
          manufacturer: `m${i}`,
          display_name: null,
          item_count: i,
        })),
        {},
      ),
      build(
        "contractors",
        {
          data: {
            total: "296",
            items: many(120, (i) => ({ spectrum_id: `O${i}`, name: `O${i}` })),
          },
        },
        {},
      ),
    ]
    for (const doc of docs) {
      expect(linksOf(doc).length).toBeLessThanOrEqual(MAX_HUB_LINKS)
      expect(linksOf(doc).length).toBeGreaterThan(0)
    }
  })

  it("market keeps ListingSearchV2's head and adds structured data", () => {
    const doc = build(
      "market",
      {
        listings: [
          {
            listing_id: "71012eb4-aaaa",
            title: "Pristine Medal",
            shop_name: "Hades",
            price_min: 12000,
          },
        ],
        total: 7,
      },
      {},
    )
    const spa = buildMarketSearchHead({ total: 7 }, ORIGIN)
    expect(doc.title).toBe(
      "Star Citizen Player Trading — Buy & Sell Items for aUEC | SC Market",
    )
    expect(doc.head.meta).toEqual(spa.meta)
    expect(doc.canonical).toBe(`${ORIGIN}/market`)
    expect(jsonLdTypes(doc)).toEqual(["BreadcrumbList", "CollectionPage"])
    expect(linksOf(doc)).toEqual([
      {
        href: "/market/71012eb4--pristine-medal",
        text: "Pristine Medal — 12,000 aUEC — Hades",
      },
    ])
  })

  it("manufacturers: most prolific first, display names", () => {
    const doc = build(
      "wikiManufacturers",
      f.manufacturers,
      {},
      "/wiki/manufacturers",
    )
    expect(doc.title).toBe("Manufacturers - SC Market")
    expect(meta(doc, "description")).toBe(
      "Manufacturers - SC Market, the Star Citizen marketplace",
    )
    expect(linksOf(doc)).toEqual([
      {
        href: "/wiki/manufacturers/cds",
        text: "Clark Defense Systems — 517 items",
      },
      { href: "/wiki/manufacturers/rsi", text: "rsi — 370 items" },
      {
        href: "/wiki/manufacturers/paint_x_logo",
        text: "Ace Astrogation — 1 items",
      },
    ])
  })

  it("static hubs link without data", () => {
    const wiki = build("wikiHub", undefined, {}, "/wiki")
    expect(wiki.title).toBe(
      "Game Database — Star Citizen Items, Ships & More | SC Market",
    )
    expect(linksOf(wiki).map((l) => l.href)).toEqual(
      WIKI_HUB_SECTIONS.map((s) => s.route),
    )
    const locations = build("wikiLocations", undefined, {}, "/wiki/locations")
    expect(locations.title).toBe("Star Map & Locations - SC Market")
    expect(locations.canonical).toBe(`${ORIGIN}/wiki/locations`)
  })

  it("encodes entry codes in hrefs and v1 list totals", () => {
    const doc = build(
      "missions",
      {
        missions: [
          { mission_code: "A B/C", mission_name: "M", category: "Delivery" },
        ],
        total: 1,
      },
      {},
    )
    expect(linksOf(doc)[0].href).toBe("/missions/A%20B%2FC")
    const orgs = build(
      "contractors",
      {
        data: {
          total: "296",
          items: [{ spectrum_id: "NARCO", name: "Narco" }],
        },
      },
      {},
    )
    expect(text(orgs.summary[2])).toBe(
      "296 Star Citizen organizations and contractors on SC Market.",
    )
    expect(linksOf(orgs)).toEqual([
      { href: "/contractor/NARCO", text: "Narco" },
    ])
  })
})

describe("market detail + manufacturer documents", () => {
  it("aggregate: SPA head, path canonical, de-duplicated listing links", () => {
    const doc = build(
      "aggregate",
      f.aggregate(),
      { id: "1954c364--medal" },
      "/market/aggregate/1954c364--medal",
    )
    expect(doc.title).toBe("Medal — SC Market")
    expect(doc.canonical).toBe(`${ORIGIN}/market/aggregate/1954c364--medal`)
    expect(meta(doc, "og:url")).toBe(
      `${ORIGIN}/market/aggregate/1954c364--medal`,
    )
    expect(meta(doc, "description")).toBe(
      "Browse all Medal listings on SC Market. Compare prices from multiple sellers.",
    )
    expect(doc.head.jsonLd[0]).toMatchObject({ "@type": "Product" })
    // No AggregateOffer: aUEC isn't an ISO 4217 currency.
    expect(JSON.stringify(doc.head.jsonLd)).not.toMatch(/Offer|priceCurrency/)
    expect(doc.summary.map(text)).toContain(
      "3 listings from 2 shops, 1,000 aUEC to 250,000 aUEC.",
    )
    expect(linksOf(doc).map((l) => l.href)).toEqual([
      "/market/l1--medal-pristine",
      "/market/l2--medal-worn",
    ])
  })

  it("aggregate without listings has no Product JSON-LD", () => {
    const doc = build(
      "aggregate",
      { ...f.aggregate(), listings: [], total: 0 },
      { id: "x" },
      "/market/aggregate/x",
    )
    expect(doc.head.jsonLd).toEqual([])
    expect(doc.summary.map(text)).toContain("No active listings right now.")
  })

  it("bundle: layout title, path canonical, item list and seller link", () => {
    const doc = build(
      "bundle",
      f.bundle(),
      { id: "b0ba0ba0--starter-bundle" },
      "/market/multiple/b0ba0ba0--starter-bundle",
    )
    expect(doc.title).toBe("Starter Bundle - SC Market")
    expect(doc.canonical).toBe(
      `${ORIGIN}/market/multiple/b0ba0ba0--starter-bundle`,
    )
    expect(meta(doc, "og:image")).toBe("https://cdn.example/pen.png")
    expect(meta(doc, "twitter:url")).toBe(
      `${ORIGIN}/market/multiple/b0ba0ba0-aaaa-bbbb-cccc-000000000000`,
    )
    expect(doc.summary.map(text)).toContain("Includes: Medpen, Helmet.")
    expect(linksOf(doc)).toEqual([
      { href: "/shops/hades-svk-shop", text: "Hades" },
    ])
  })

  it("manufacturer: display name, route canonical, bounded product links", () => {
    const doc = build(
      "manufacturer",
      f.manufacturer(),
      { id: "cds" },
      "/wiki/manufacturers/cds",
    )
    expect(doc.title).toBe(
      "Clark Defense Systems — Star Citizen Manufacturer | SC Market",
    )
    expect(doc.canonical).toBe(`${ORIGIN}/wiki/manufacturers/cds`)
    expect(meta(doc, "og:url")).toBe(`${ORIGIN}/wiki/manufacturers/cds`)
    expect(doc.summary[0]).toEqual({ tag: "h1", text: "Clark Defense Systems" })
    expect(text(doc.summary[1])).toBe(
      "Ground-combat defensive systems. Models: PAB-4",
    )
    expect(linksOf(doc)).toHaveLength(MAX_HUB_LINKS)
    expect(linksOf(doc)[0].href).toBe("/wiki/items/dec45bed--a23-helmet-0")
    // Falls back to the code when there's no display name.
    expect(
      build("manufacturer", f.manufacturer(null), { id: "cds" }).title,
    ).toBe("cds — Star Citizen Manufacturer | SC Market")
  })
})
