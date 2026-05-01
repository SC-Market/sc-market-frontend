import { generatedApiV2 as api } from "../../generatedApiV2"

// --- Types ---

export interface MiningOreSearchResult {
  element_id: string
  name: string
  resource_name: string | null
  instability: number | null
  resistance: number | null
  optimal_window_midpoint: number | null
  optimal_window_thinness: number | null
  explosion_multiplier: number | null
  cluster_factor: number | null
  rarity: string | null
  mining_method: string | null
  market_price: number | null
  game_item_id: string | null
  top_locations: { location_name: string; system: string; probability: number }[]
}

export interface SearchMiningOresResponse {
  ores: MiningOreSearchResult[]
  total: number
  page: number
  page_size: number
}

export interface SearchMiningOresArg {
  text?: string
  system?: string
  mining_method?: string
  rarity?: string
  page?: number
  page_size?: number
}

export interface MiningOreDetail extends MiningOreSearchResult {
  optimal_window_midpoint_randomness: number | null
  locations: {
    location_name: string
    system: string
    location_type: string
    group_name: string
    mining_method: string
    probability_pct: number
  }[]
}

export interface GetMiningOreDetailResponse {
  ore: MiningOreDetail
}

export interface MiningGroupSummary {
  group_name: string
  group_probability: number
  ore_count: number
}

export interface MiningLocationSearchResult {
  location_name: string
  system: string
  location_type: string
  groups: MiningGroupSummary[]
  has_refinery: boolean
  amenities: string[]
}

export interface SearchMiningLocationsResponse {
  locations: MiningLocationSearchResult[]
  total: number
  page: number
  page_size: number
}

export interface SearchMiningLocationsArg {
  text?: string
  system?: string
  location_type?: string
  page?: number
  page_size?: number
}

export interface MiningLocationOre {
  ore_name: string
  rarity: string | null
  probability_pct: number
  market_price: number | null
  estimated_value: number | null
}

export interface MiningLocationGroup {
  group_name: string
  group_probability: number
  ores: MiningLocationOre[]
}

export interface MiningLocationDetail {
  location_name: string
  system: string
  location_type: string
  groups: MiningLocationGroup[]
  amenities: string[]
  has_refinery: boolean
}

export interface GetMiningLocationDetailResponse {
  location: MiningLocationDetail
}

// --- API ---

const injectedRtkApi = api
  .enhanceEndpoints({ addTagTypes: ["Game Data - Mining"] })
  .injectEndpoints({
    endpoints: (build) => ({
      searchMiningOres: build.query<SearchMiningOresResponse, SearchMiningOresArg>({
        query: (args) => ({
          url: `/game-data/mining/ores`,
          params: {
            text: args.text,
            system: args.system,
            mining_method: args.mining_method,
            rarity: args.rarity,
            page: args.page,
            page_size: args.page_size,
          },
        }),
        providesTags: ["Game Data - Mining"],
      }),
      getMiningOreDetail: build.query<GetMiningOreDetailResponse, { name: string }>({
        query: ({ name }) => ({ url: `/game-data/mining/ores/${encodeURIComponent(name)}` }),
        providesTags: ["Game Data - Mining"],
      }),
      searchMiningLocations: build.query<SearchMiningLocationsResponse, SearchMiningLocationsArg>({
        query: (args) => ({
          url: `/game-data/mining/locations`,
          params: {
            text: args.text,
            system: args.system,
            location_type: args.location_type,
            page: args.page,
            page_size: args.page_size,
          },
        }),
        providesTags: ["Game Data - Mining"],
      }),
      getMiningLocationDetail: build.query<GetMiningLocationDetailResponse, { name: string }>({
        query: ({ name }) => ({ url: `/game-data/mining/locations/${encodeURIComponent(name)}` }),
        providesTags: ["Game Data - Mining"],
      }),
    }),
  })

export const {
  useSearchMiningOresQuery,
  useGetMiningOreDetailQuery,
  useSearchMiningLocationsQuery,
  useGetMiningLocationDetailQuery,
} = injectedRtkApi
