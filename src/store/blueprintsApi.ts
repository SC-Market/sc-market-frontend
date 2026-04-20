/**
 * Blueprints API - RTK Query hooks for Game Data Blueprints
 * 
 * Provides hooks for blueprint search, detail, and inventory queries.
 * Task 12.1 - Blueprint Browser Frontend
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BACKEND_URL } from "../util/constants"

// ============================================================================
// Types
// ============================================================================

export interface BlueprintSearchResult {
  blueprint_id: string
  blueprint_name: string
  output_item_name: string
  output_item_icon?: string
  item_category?: string
  item_subcategory?: string
  rarity?: string
  tier?: number
  ingredient_count: number
  mission_count: number
  crafting_time_seconds?: number
  user_owns?: boolean
}

export interface SearchBlueprintsResponse {
  blueprints: BlueprintSearchResult[]
  total: number
  page: number
  page_size: number
}

export interface SearchBlueprintsParams {
  text?: string
  item_category?: string
  item_subcategory?: string
  rarity?: string
  tier?: number
  crafting_station_type?: string
  output_game_item_id?: string
  user_owned_only?: boolean
  version_id?: string
  page?: number
  page_size?: number
}

export interface BlueprintCategory {
  category: string
  subcategory?: string
  count: number
}

// ============================================================================
// API Definition
// ============================================================================

export const blueprintsApi = createApi({
  reducerPath: "blueprintsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/v2/game-data/blueprints`,
    credentials: "include",
  }),
  tagTypes: ["Blueprints", "BlueprintDetail", "BlueprintCategories"],
  endpoints: (builder) => ({
    // Search blueprints with comprehensive filters
    searchBlueprints: builder.query<SearchBlueprintsResponse, SearchBlueprintsParams>({
      query: (params) => ({
        url: "/search",
        params: {
          ...params,
          page: params.page || 1,
          page_size: params.page_size || 20,
        },
      }),
      providesTags: ["Blueprints"],
    }),

    // Get blueprint categories
    getBlueprintCategories: builder.query<BlueprintCategory[], { version_id?: string }>({
      query: ({ version_id }) => ({
        url: "/categories",
        params: version_id ? { version_id } : undefined,
      }),
      providesTags: ["BlueprintCategories"],
    }),
  }),
})

// Export hooks
export const {
  useSearchBlueprintsQuery,
  useGetBlueprintCategoriesQuery,
} = blueprintsApi
