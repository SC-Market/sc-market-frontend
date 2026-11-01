/** API response fixtures for bridge tests (only the fields the pages read). */
import type {
  BlueprintDetailResponse,
  GetGameItemListingsResponse,
  GetListingDetailResponse,
  ItemAcquisitionDocument,
  LocationDetailResponse,
  MissionDetailResponse,
  OreDetailResponse,
  ResourceDetailResponse,
  SearchWikiItemsResponse,
  ShopPublicResponse,
  WikiItemDetail,
  WikiManufacturerDetail,
  WikiManufacturerSearchResult,
  WikiShipDetail,
} from "../../store/api/v2/market"
import type { GetContractorApiResponse } from "../../store/api/contractors"
import type { GetRecruitingPostByIdApiResponse } from "../../store/api/recruiting"
import type { User } from "../../datatypes/User"

/** A title an attacker could give a listing, shop, org or post. */
export const EVIL = `</title></script><script>alert("x")</script><img src=x onerror=alert(1)> & "q" 'a'`

export const resource = {
  resource: {
    resource_id: "5db940a8-0000-0000-0000-000000000000",
    resource_name: "Gold",
    resource_category: "Metal",
    can_be_mined: true,
    can_be_purchased: true,
    can_be_salvaged: false,
    can_be_looted: false,
    base_value: 6000,
    mining_locations: [{ location_detail: "Aberdeen" }, { planet_moon: "Daymar" }],
    purchase_locations: [{ station: "Area18", average_price: 30 }],
  },
  blueprints_requiring: [{ blueprint_id: "b1", output_item_name: "Arrowhead" }],
  market_price: { min_price: 10, max_price: 50 },
} as unknown as ResourceDetailResponse

export const item = {
  id: "38fc7b63-0000-0000-0000-000000000000",
  name: "LifeCure Medsticks",
  type: "Medical",
  manufacturer: "CureLife",
  image_url: "https://cdn.example/med.png",
  market_stats: { listing_count: 2, min_price: 100, max_price: 300 },
} as unknown as WikiItemDetail

export const ship = {
  id: "57e51d27-0000-0000-0000-000000000000",
  name: "Crusader Intrepid",
  manufacturer: "Crusader Industries",
  focus: "Starter",
  role: "Exploration",
  career: "Exploration",
  crew_size: 1,
  length_m: 27,
  description: "A starter ship.",
} as unknown as WikiShipDetail

export const ore = {
  name: "beryl_raw",
  displayName: "Beryl",
  rarity: "Uncommon",
  locations: [
    { locationName: "Daymar", system: "Stanton", relativeProbability: 0.2 },
    { locationName: "Yela", system: "Stanton", relativeProbability: 0.5 },
  ],
} as unknown as OreDetailResponse

export const miningLocation = {
  name: "stanton1b",
  displayName: "Daymar",
  system: "Stanton",
} as unknown as LocationDetailResponse

export const blueprint = {
  blueprint: {
    blueprint_name: "BP_Arrowhead",
    crafting_time_seconds: 90.4,
    tier: 2,
    rarity: "Rare",
    icon_url: null,
  },
  output_item: { name: "Arrowhead Sniper Rifle", icon_url: "https://cdn.example/a.png" },
  ingredients: [{ game_item: { name: "Gold" } }, { slot_name: "Barrel" }],
} as unknown as BlueprintDetailResponse

export const mission = {
  mission: {
    mission_name: "Waste Disposal",
    category: "Delivery",
    star_system: "Stanton",
    mission_description: "Haul waste.",
    credit_reward_max: 5000,
  },
} as unknown as MissionDetailResponse

export function listing(title = "Pristine Medal"): GetListingDetailResponse {
  return {
    listing: {
      listing_id: "71012eb4-aaaa-bbbb-cccc-000000000000",
      title,
      description: `${title} in mint condition`,
      photos: ["https://cdn.example/medal.png"],
      sale_type: "fixed",
      status: "active",
      visibility: "public",
      quantity_unit: "unit",
      created_at: "2026-10-30T15:14:45.905Z",
      updated_at: "2026-10-30T15:14:45.905Z",
    },
    seller: { shop_id: "s1", name: "Hades", slug: "hades-svk-shop", rating: 5, languages: [] },
    items: [
      {
        item_id: "i1",
        game_item: { id: "1954c364-aaaa-bbbb-cccc-000000000000", name: "Pristine Medal", type: "Other" },
        pricing_mode: "unified",
        // The API sends numeric columns as strings.
        base_price: "12000",
        variants: [{ variant_id: "v1", attributes: {}, display_name: "Standard", short_name: "Std", quantity: 3, price: "12000", locations: [] }],
      },
    ],
  } as unknown as GetListingDetailResponse
}

export function shop(name = "Hades SVK Shop"): ShopPublicResponse {
  return {
    shop_id: "s1",
    slug: "hades-svk-shop",
    name,
    description: "We sell things.",
    banner_url: null,
    logo_url: "https://cdn.example/logo.png",
    tags: ["weapons"],
    rating: 4.5,
    rating_count: 3,
  } as unknown as ShopPublicResponse
}

export function contractor(name = "Narco"): GetContractorApiResponse {
  return {
    data: {
      name,
      spectrum_id: "NARCO",
      description: "",
      avatar: "https://cdn.example/av.png",
      banner: "",
      size: 12,
      fields: ["mining"],
    },
  } as unknown as GetContractorApiResponse
}

export function user(displayName = "Jacked Citizen"): User {
  return {
    username: "JackedCitizen",
    display_name: displayName,
    avatar: "https://cdn.example/u.png",
    banner: "",
    profile_description: "",
  } as unknown as User
}

export function recruitingPost(title = "Join us"): GetRecruitingPostByIdApiResponse {
  return {
    data: {
      post_id: "c5c4c88a-430e-4b56-a5f2-47542ad12762",
      title,
      body: "We mine.",
      timestamp: "2026-01-02T03:04:05.000Z",
      contractor: { name: "Narco", spectrum_id: "NARCO", avatar: "https://cdn.example/av.png" },
    },
  } as unknown as GetRecruitingPostByIdApiResponse
}

export function manufacturer(displayName: string | null = "Clark Defense Systems"): WikiManufacturerDetail {
  return {
    manufacturer: "cds",
    display_name: displayName,
    description: "Ground-combat defensive systems.\\n\\nModels: PAB-4",
    item_count: 517,
    items: Array.from({ length: 80 }, (_, i) => ({
      id: `dec45bed-3191-4f15-821a-${String(i).padStart(12, "0")}`,
      name: `A23 Helmet ${i}`,
      type: "Helmet",
    })),
  } as unknown as WikiManufacturerDetail
}

export function aggregate(name = "Medal"): GetGameItemListingsResponse {
  return {
    game_item: {
      id: "1954c364-6149-4314-b9cf-1cd13f50b958",
      name,
      type: "Other",
      image_url: "https://cdn.example/medal.png",
    },
    quality_distribution: [],
    listings: [
      // Two variant rows of one listing, plus a second shop.
      { listing_id: "l1", variant_id: "v1", title: `${name} pristine`, shop_name: "Hades", shop_slug: "hades", price: 1000 },
      { listing_id: "l1", variant_id: "v2", title: `${name} pristine`, shop_name: "Hades", shop_slug: "hades", price: 1500 },
      { listing_id: "l2", variant_id: "v3", title: `${name} worn`, shop_name: "Narco", shop_slug: "narco", price: 250000 },
    ],
    total: 3,
    page: 1,
    page_size: 20,
  } as unknown as GetGameItemListingsResponse
}

export function bundle(title = "Starter Bundle"): GetListingDetailResponse {
  return {
    listing: {
      listing_id: "b0ba0ba0-aaaa-bbbb-cccc-000000000000",
      title,
      description: `${title} with two items`,
      photos: [],
    },
    seller: { shop_id: "s1", name: "Hades", slug: "hades-svk-shop", rating: 5 },
    items: [
      { item_id: "i1", game_item: { id: "g1", name: "Medpen", type: "Medical", image_url: "https://cdn.example/pen.png" }, variants: [] },
      { item_id: "i2", game_item: { id: "g2", name: "Helmet", type: "Armor" }, variants: [] },
    ],
  } as unknown as GetListingDetailResponse
}

/** `count` wiki item search results (to check the link bound). */
export function wikiItems(count: number): SearchWikiItemsResponse {
  return {
    items: Array.from({ length: count }, (_, i) => ({
      id: `38fc7b63-0000-0000-0000-${String(i).padStart(12, "0")}`,
      name: `Item ${i}`,
      type: "Medical",
    })),
    total: 11555,
    page: 1,
    page_size: count,
  } as unknown as SearchWikiItemsResponse
}

export const manufacturers = [
  { manufacturer: "paint_x_logo", display_name: "Ace Astrogation", item_count: 1 },
  { manufacturer: "cds", display_name: "Clark Defense Systems", item_count: 517 },
  { manufacturer: "rsi", display_name: null, item_count: 370 },
] as WikiManufacturerSearchResult[]

/** The acquisition document of a crafted helmet with listings, a mission and a blueprint. */
export function acquisition(): ItemAcquisitionDocument {
  return {
    feed: {
      dataset: "items",
      version: 1,
      terms: "Free to use",
      license: {
        license: "CC-BY-4.0",
        url: "https://creativecommons.org/licenses/by/4.0/",
        attribution: "Data: SC Market (sc-market.space)",
        notice: "Game data © Cloud Imperium Games; aggregation and price data by SC Market, CC BY 4.0.",
      },
    },
    item: { id: "9bb3a108-3556-4934-ae04-9a117e5432a2", slug: "9bb3a108--siebe-helmet", name: "Siebe Helmet", type: "Helmet" },
    as_of: "2026-11-01T02:47:24.741Z",
    freshness: {
      as_of: "2026-11-01T02:47:24.741Z",
      game_version: "4.10.2-LIVE.12881860",
      game_data_updated_at: "2026-10-24T07:55:26.639Z",
      price_snapshot_date: "2026-11-01",
    },
    price: {
      currency: "aUEC",
      unit_note: "All prices are in aUEC.",
      current: {
        confidence: "medium",
        sample_note: "Based on 3 listings from 3 sellers on SC Market.",
        ask_count: 3,
        seller_count: 3,
        quantity_available: 4,
        lowest_ask: 450000,
        median_ask: 650000,
        highest_ask: 1000000,
        outliers_excluded: 0,
      },
      trend_30d: { days_with_data: 1, median_30d: null, change_pct: null, daily: [] },
      sales_30d: { count: 0, median_price: null },
      summary: "As of 2026-11-01, SC Market player listings for Siebe Helmet: lowest ask 450,000 aUEC, median ask 650,000 aUEC.",
      links: {
        page: "https://sc-market.space/market/aggregate/9bb3a108--siebe-helmet",
        json: "https://api.sc-market.space/api/public/prices/9bb3a108--siebe-helmet.json",
        index: "https://api.sc-market.space/api/public/prices/index.json",
      },
    },
    listings: {
      count: 3,
      seller_count: 3,
      quantity_available: 4,
      lowest_ask: 450000,
      page: "https://sc-market.space/market/aggregate/9bb3a108--siebe-helmet",
      top: [
        { listing_id: "5e2d1f98-5d8f-4d55-969a-e32b006684f4", slug: "5e2d1f98--siebe-helmet", title: "Siebe Helmet", price: 450000, quantity_available: 1, sale_type: "fixed" },
      ],
    },
    missions: {
      total: 2,
      top: [
        {
          mission_id: "5216ebc5-933d-465f-a287-03dbfc6c3c3c",
          mission_code: "Rayari_Rank3_IrradiatedPearls",
          mission_name: "Additional Resources For Research",
          reward_kind: "blueprint",
          blueprint_id: "3696262b-4bd6-4f52-a319-0649704cdf0a",
          drop_probability: 3.57,
          is_guaranteed: false,
          category: "collection",
          mission_giver_org: "Rayari Incorporated",
          faction: "Rayari Incorporated",
          star_system: null,
          legal_status: null,
          credit_reward_max: null,
          associated_event: null,
        },
      ],
    },
    blueprints: {
      total: 1,
      items: [
        {
          blueprint_id: "3696262b-4bd6-4f52-a319-0649704cdf0a",
          blueprint_code: "f74b672f",
          blueprint_name: "BP_CRAFT_clda_utility_heavy_helmet_03_01_01",
          output_quantity: 1,
          tier: null,
          rarity: null,
          crafting_station_type: null,
          crafting_time_seconds: 390,
          mission_count: 1,
          ingredients: [
            { game_item_id: "51c80361-1734-47ae-83ba-c3a6817f815a", slug: "51c80361--stileron", name: "Stileron", quantity: 0.08, quantity_scu: 0.08, min_quality: null, slot_display_name: "Shell" },
          ],
        },
      ],
    },
    in_game_shops: { total: 0, shops: [] },
    resource: null,
    attribution: "Data: SC Market (https://sc-market.space).",
    links: {
      wiki: "https://sc-market.space/wiki/items/9bb3a108--siebe-helmet",
      market: "https://sc-market.space/market/aggregate/9bb3a108--siebe-helmet",
      json: "https://api.sc-market.space/api/public/items/9bb3a108--siebe-helmet.json",
    },
  }
}
