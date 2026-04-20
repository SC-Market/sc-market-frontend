/**
 * Wiki API - RTK Query hooks for Game Database Wiki
 * 
 * Provides hooks for all wiki endpoints:
 * - Items search and detail
 * - Ships search and detail
 * - Commodities/resources
 * - Locations hierarchy
 * - Manufacturers
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// ============================================================================
// Types
// ============================================================================

export interface WikiItemSearchResult {
  id: string
  name: string
  type?: string
  sub_type?: string
  size?: string
  grade?: string
  manufacturer?: string
  image_url?: string
  thumbnail_path?: string
  display_type?: string
}

export interface WikiItemDetail {
  id: string
  name: string
  type?: string
  sub_type?: string
  size?: string
  grade?: string
  manufacturer?: string
  image_url?: string
  thumbnail_path?: string
  display_type?: string
  p4k_id?: string
  p4k_file?: string
  name_key?: string
  attributes: Record<string, any>
  craftable_from: BlueprintReference[]
  rewarded_by: MissionRewardReference[]
  market_stats: MarketStats
}

export interface BlueprintReference {
  blueprint_id: string
  blueprint_name: string
  rarity?: string
  tier?: number
  crafting_time_seconds?: number
}

export interface MissionRewardReference {
  mission_id: string
  mission_name: string
  star_system?: string
  drop_probability: number
  blueprint_id: string
  blueprint_name: string
}

export interface MarketStats {
  listing_count: number
  min_price?: number
  max_price?: number
  total_quantity: number
}

export interface WikiShipSearchResult {
  id: string
  name: string
  manufacturer?: string
  focus?: string
  size?: string
  image_url?: string
}

export interface WikiShipDetail {
  id: string
  name: string
  manufacturer?: string
  focus?: string
  size?: string
  description?: string
  movement_class?: string
  image_url?: string
  default_loadout?: any
  attributes: Record<string, any>
}

export interface WikiCommoditySearchResult {
  resource_id: string
  game_item_id: string
  name: string
  resource_category: string
  resource_subcategory?: string
  can_be_mined: boolean
  can_be_purchased: boolean
  can_be_salvaged: boolean
  can_be_looted: boolean
  image_url?: string
}

export interface WikiLocationNode {
  id: string
  name: string
  type: string
  parent_id?: string
  children: WikiLocationNode[]
}

export interface WikiManufacturerSearchResult {
  manufacturer: string
  item_count: number
}

export interface WikiManufacturerDetail {
  manufacturer: string
  description?: string
  item_count: number
  items: ManufacturerItem[]
}

export interface ManufacturerItem {
  id: string
  name: string
  type?: string
  size?: string
  grade?: string
  image_url?: string
}

// ============================================================================
// API Definition
// ============================================================================

export const wikiApi = createApi({
  reducerPath: "wikiApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v2/game-data/wiki",
    credentials: "include",
  }),
  tagTypes: ["WikiItems", "WikiShips", "WikiCommodities", "WikiLocations", "WikiManufacturers"],
  endpoints: (builder) => ({
    // Items endpoints
    searchWikiItems: builder.query<
      {
        items: WikiItemSearchResult[]
        total: number
        page: number
        page_size: number
      },
      {
        text?: string
        type?: string
        sub_type?: string
        size?: string
        grade?: string
        manufacturer?: string
        category?: string
        version_id?: string
        page?: number
        page_size?: number
      }
    >({
      query: (params) => ({
        url: "/items",
        params: {
          ...params,
          page: params.page || 1,
          page_size: params.page_size || 20,
        },
      }),
      providesTags: ["WikiItems"],
    }),

    getWikiItemDetail: builder.query<WikiItemDetail, string>({
      query: (id) => `/items/${id}`,
      providesTags: (result, error, id) => [{ type: "WikiItems", id }],
    }),

    // Ships endpoints
    searchWikiShips: builder.query<
      {
        ships: WikiShipSearchResult[]
        total: number
        page: number
        page_size: number
      },
      {
        manufacturer?: string
        focus?: string
        size?: string
        page?: number
        page_size?: number
      }
    >({
      query: (params) => ({
        url: "/ships",
        params: {
          ...params,
          page: params.page || 1,
          page_size: params.page_size || 20,
        },
      }),
      providesTags: ["WikiShips"],
    }),

    getWikiShipDetail: builder.query<WikiShipDetail, string>({
      query: (id) => `/ships/${id}`,
      providesTags: (result, error, id) => [{ type: "WikiShips", id }],
    }),

    // Commodities endpoint
    searchWikiCommodities: builder.query<
      {
        commodities: WikiCommoditySearchResult[]
        total: number
        page: number
        page_size: number
      },
      {
        category?: string
        can_be_mined?: boolean
        page?: number
        page_size?: number
      }
    >({
      query: (params) => ({
        url: "/commodities",
        params: {
          ...params,
          page: params.page || 1,
          page_size: params.page_size || 20,
        },
      }),
      providesTags: ["WikiCommodities"],
    }),

    // Locations endpoint
    getWikiLocations: builder.query<WikiLocationNode[], { parent_id?: string }>({
      query: (params) => ({
        url: "/locations",
        params,
      }),
      providesTags: ["WikiLocations"],
    }),

    // Manufacturers endpoints
    getWikiManufacturers: builder.query<WikiManufacturerSearchResult[], void>({
      query: () => "/manufacturers",
      providesTags: ["WikiManufacturers"],
    }),

    getWikiManufacturerDetail: builder.query<WikiManufacturerDetail, string>({
      query: (id) => `/manufacturers/${id}`,
      providesTags: (result, error, id) => [{ type: "WikiManufacturers", id }],
    }),
  }),
})

// Export hooks
export const {
  useSearchWikiItemsQuery,
  useGetWikiItemDetailQuery,
  useSearchWikiShipsQuery,
  useGetWikiShipDetailQuery,
  useSearchWikiCommoditiesQuery,
  useGetWikiLocationsQuery,
  useGetWikiManufacturersQuery,
  useGetWikiManufacturerDetailQuery,
} = wikiApi
