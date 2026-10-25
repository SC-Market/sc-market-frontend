/**
 * The SPA pages moved their inline title/description/JSON-LD into these
 * shared builders (also used by the edge bridge). These pin the output to
 * what the pages rendered before, so the move is head-identical.
 */
import { describe, it, expect } from "vitest"
import i18next from "i18next"
import en from "../../locales/en/english.json"
import { layoutDescription, serializeJsonLd } from "../pageHead"
import { homeSeoText, landingFaqs, siteJsonLd } from "../siteHeads"
import {
  blueprintsSeoText,
  buildMarketSearchHead,
  marketSearchSeoText,
  missionsSeoText,
  shopDirectorySeoText,
  wikiCommoditiesSeoText,
  wikiItemsSeoText,
  wikiShipsSeoText,
} from "../hubHeads"

const i18n = i18next.createInstance()
i18n.init({ lng: "en", resources: { en: { translation: en } }, initAsync: false })
const t = i18n.t.bind(i18n)

describe("site JSON-LD (Footer)", () => {
  it("serializes to the same bytes JSON.stringify gave the Footer", () => {
    expect(serializeJsonLd(siteJsonLd())).toBe(JSON.stringify(siteJsonLd()))
    expect(siteJsonLd()).toMatchObject({
      "@graph": [
        { "@type": "Organization", "@id": "https://sc-market.space/#organization" },
        {
          "@type": "WebSite",
          potentialAction: {
            target: { urlTemplate: "https://sc-market.space/market?text={search_term_string}" },
          },
        },
      ],
    })
  })
})

describe("landing", () => {
  it("FAQ comes from the landing locale keys, in display order", () => {
    expect(landingFaqs(t).map((f) => f.question)).toEqual([
      t("landing.faqSellItemsQ"),
      t("landing.faqBuyQ"),
      t("landing.faqSafeQ"),
      t("landing.faqOfficialQ"),
      t("landing.faqListThingsQ"),
      t("landing.faqOrgsQ"),
      t("landing.faqFeeQ"),
      t("landing.faqRealMoneyQ"),
    ])
  })

  it("has the keyword title (deliberate change from 'SC Market')", () => {
    expect(homeSeoText(t).title).toBe(
      "SC Market — Star Citizen Marketplace: Buy, Sell & Trade Items in aUEC",
    )
  })
})

describe("hub text matches the pages' previous inline strings", () => {
  it("lists with a filter and a total", () => {
    expect(wikiItemsSeoText(undefined, 10)).toEqual({
      title: "All Items — Star Citizen Game Database | SC Market",
      description: "Browse 10 Star Citizen items. Stats, prices, crafting uses, and locations.",
    })
    expect(wikiItemsSeoText("Weapon", undefined).description).toBe(
      "Browse  Weapon items. Stats, prices, crafting uses, and locations.",
    )
    expect(wikiCommoditiesSeoText("Metal", 5).title).toBe("Metal Commodities — Star Citizen | SC Market")
    expect(wikiShipsSeoText("", 0).description).toBe(
      "Browse 0 Star Citizen ships and vehicles. Specs, loadouts, and market availability.",
    )
    expect(blueprintsSeoText(null, 3).title).toBe("All Blueprints — Star Citizen Crafting | SC Market")
    expect(missionsSeoText("Delivery", 3).title).toBe("Delivery Missions — Star Citizen Mission Database | SC Market")
    expect(shopDirectorySeoText(null, undefined)).toEqual({
      title: "All Shops — Star Citizen Marketplace | SC Market",
      description: "Browse  verified Star Citizen shops. Compare ratings, listings, and specialties.",
    })
  })

  it("market search", () => {
    expect(marketSearchSeoText({ total: 0 }).description).toBe(
      "Browse  items for sale on SC Market. Compare prices from verified Star Citizen sellers.",
    )
    expect(marketSearchSeoText({ text: "gold", itemType: "Metal" }).title).toBe(
      "gold Metal for Sale — Star Citizen | SC Market",
    )
    const head = buildMarketSearchHead({ total: 5 }, "https://sc-market.space")
    expect(head.canonical).toBe("https://sc-market.space/market")
    expect(head.meta.map((m) => m.name ?? m.property)).toEqual([
      "description",
      "og:type",
      "og:title",
      "og:description",
      "og:url",
      "twitter:card",
      "twitter:title",
      "twitter:description",
    ])
  })

  it("StandardPageLayout's generic description", () => {
    expect(layoutDescription("Mining Database", undefined)).toBe(
      "Mining Database - SC Market, the Star Citizen marketplace",
    )
    expect(layoutDescription(null, "")).toBe("SC Market - SC Market, the Star Citizen marketplace")
    expect(layoutDescription("x", "Own")).toBe("Own")
  })
})
