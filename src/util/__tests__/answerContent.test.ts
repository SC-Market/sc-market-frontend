import { describe, it, expect } from "vitest"
import type { TFunction } from "i18next"
import {
  buildCommodityAnswers,
  buildItemSummary,
  buildOreAnswers,
  buildShipSummary,
} from "../answerContent"
import type {
  OreDetailResponse,
  ResourceDetailResponse,
  WikiItemDetail,
  WikiShipDetail,
} from "../../store/api/v2/market"

// Renders the English default with {{var}} interpolation, like i18next with an empty catalog.
const t = ((_key: string, opts?: string | Record<string, unknown>) => {
  if (typeof opts === "string") return opts
  const template = String(opts?.defaultValue ?? "")
  return template.replace(/\{\{(\w+)\}\}/g, (_, v) => String(opts?.[v]))
}) as unknown as TFunction

function commodity(
  overrides: Partial<ResourceDetailResponse["resource"]> = {},
  rest: Partial<ResourceDetailResponse> = {},
): ResourceDetailResponse {
  return {
    resource: {
      resource_name: "Agricium",
      resource_category: "Metal",
      can_be_mined: true,
      can_be_purchased: true,
      can_be_salvaged: false,
      can_be_looted: false,
      ...overrides,
    } as ResourceDetailResponse["resource"],
    blueprints_requiring: [],
    ...rest,
  }
}

describe("buildCommodityAnswers", () => {
  it("answers where to buy, cheapest first", () => {
    const { summary, faqs } = buildCommodityAnswers(
      commodity({
        purchase_locations: [
          { station: "Area18", average_price: 30 },
          { station: "Lorville", average_price: 20 },
          { station: "No price" },
        ],
      }),
      t,
      "en",
    )
    expect(summary).toContain("The cheapest known place to buy it is Lorville, at about 20 aUEC.")
    const buy = faqs.find((f) => f.question === "Where can I buy Agricium in Star Citizen?")
    expect(buy?.answer).toBe("Agricium can be bought at Lorville (20 aUEC) and Area18 (30 aUEC).")
  })

  it("lists acquisition methods as alternatives", () => {
    const { summary } = buildCommodityAnswers(commodity(), t, "en")
    expect(summary).toContain("It can be obtained by mining or purchasing.")
  })

  it("caps listed mining locations and skips unnamed ones", () => {
    const { faqs } = buildCommodityAnswers(
      commodity({
        mining_locations: [
          { location_detail: "Aberdeen" },
          { planet_moon: "Daymar" },
          {},
          { planet_moon: "Lyria" },
          { planet_moon: "Wala" },
        ],
      }),
      t,
      "en",
    )
    const mine = faqs.find((f) => f.question.startsWith("Where can I mine"))
    expect(mine?.answer).toBe("Agricium can be mined at Aberdeen, Daymar, and Lyria.")
  })

  it("omits sections without data", () => {
    const { summary, faqs } = buildCommodityAnswers(
      commodity({ can_be_mined: false, can_be_purchased: false }),
      t,
      "en",
    )
    expect(summary).toBe("Agricium is a Star Citizen commodity in the Metal category.")
    expect(faqs).toEqual([])
  })

  it("names blueprint outputs as uses", () => {
    const { faqs } = buildCommodityAnswers(
      commodity({}, {
        blueprints_requiring: [
          { output_item_name: "Arclight", blueprint_name: "bp_arclight" },
        ] as ResourceDetailResponse["blueprints_requiring"],
      }),
      t,
      "en",
    )
    expect(faqs.at(-1)?.answer).toBe("Agricium is a crafting ingredient for items such as Arclight.")
  })
})

describe("buildOreAnswers", () => {
  it("ranks locations by relative probability", () => {
    const ore = {
      displayName: "Quantanium",
      rarity: "Rare",
      marketPrice: 88,
      locations: [
        { locationName: "Lyria", system: "Stanton", relativeProbability: 0.2 },
        { locationName: "Aberdeen", system: "Stanton", relativeProbability: 0.9 },
      ],
    } as OreDetailResponse
    const { summary, faqs } = buildOreAnswers(ore, t, "en")
    expect(summary).toContain("Known locations include Aberdeen (Stanton) and Lyria (Stanton).")
    expect(faqs).toHaveLength(1)
  })
})

describe("buildShipSummary", () => {
  it("falls back to role and skips missing specs", () => {
    const ship = { name: "Cutlass Black", role: "Medium Freight" } as WikiShipDetail
    expect(buildShipSummary(ship, t)).toBe(
      "The Cutlass Black is a ship in Star Citizen. Role: Medium Freight.",
    )
  })
})

describe("buildItemSummary", () => {
  it("only mentions listings when there are priced listings", () => {
    const item = {
      name: "Arclight",
      type: "Weapon",
      market_stats: { listing_count: 0, total_quantity: 0 },
    } as unknown as WikiItemDetail
    expect(buildItemSummary(item, t)).toBe("Arclight is an item in Star Citizen. Type: Weapon.")

    item.market_stats = { listing_count: 4, min_price: 1000, max_price: 2500, total_quantity: 9 }
    expect(buildItemSummary(item, t)).toContain(
      "Players sell it on SC Market for 1,000 aUEC to 2,500 aUEC (active listings: 4).",
    )
  })
})
