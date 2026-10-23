/** API response fixtures for bridge tests (only the fields the pages read). */
import type {
  BlueprintDetailResponse,
  GetListingDetailResponse,
  LocationDetailResponse,
  MissionDetailResponse,
  OreDetailResponse,
  ResourceDetailResponse,
  ShopPublicResponse,
  WikiItemDetail,
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
      sale_type: "sale",
    },
    seller: { shop_id: "s1", name: "Hades", slug: "hades-svk-shop", rating: 5, languages: [] },
    items: [],
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
