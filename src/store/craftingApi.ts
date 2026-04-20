/**
 * Crafting API - RTK Query hooks for Crafting System
 * 
 * Provides hooks for crafting-related endpoints:
 * - Get craftable items from stock
 * - Calculate crafting quality
 * - Simulate crafting variations
 * - Crafting history
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// ============================================================================
// Types
// ============================================================================

export interface MaterialAvailability {
  game_item_id: string
  material_name: string
  quantity_required: number
  quantity_available: number
  is_sufficient: boolean
  quality_tier_min?: number
  quality_tier_max?: number
  stock_lot_ids: string[]
}

export interface CraftableItem {
  blueprint_id: string
  blueprint_name: string
  output_item_name: string
  output_item_icon?: string
  item_category?: string
  rarity?: string
  tier?: number
  crafting_time_seconds?: number
  can_craft: boolean
  max_craftable_quantity: number
  materials: MaterialAvailability[]
  missing_materials_count: number
  estimated_cost_per_craft?: number
}

export interface GetCraftableItemsResponse {
  craftable_items: CraftableItem[]
  total: number
  page: number
  page_size: number
  summary: {
    total_blueprints_owned: number
    items_craftable_now: number
    items_missing_materials: number
  }
}

export interface CraftingInputMaterial {
  game_item_id: string
  quantity: number
  quality_tier: number
  quality_value: number
}

export interface QualityContribution {
  material_name: string
  quality_tier: number
  quality_value: number
  weight: number
  contribution: number
}

export interface CalculateQualityResponse {
  output_quality_tier: number
  output_quality_value: number
  output_quantity: number
  calculation_breakdown: {
    formula_used: string
    input_weights: Record<string, number>
    quality_contributions: QualityContribution[]
  }
  estimated_cost: {
    material_cost: number
    crafting_station_fee?: number
    total_cost: number
  }
  success_probability: number
  critical_success_chance: number
}

// ============================================================================
// API Definition
// ============================================================================

export const craftingApi = createApi({
  reducerPath: "craftingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v2/game-data/crafting",
    credentials: "include",
  }),
  tagTypes: ["CraftableItems", "CraftingHistory"],
  endpoints: (builder) => ({
    // Get craftable items from stock
    getCraftableItems: builder.query<
      GetCraftableItemsResponse,
      {
        item_category?: string
        rarity?: string
        tier?: number
        craftable_only?: boolean
        version_id?: string
        page?: number
        page_size?: number
      }
    >({
      query: (params) => ({
        url: "/craftable-items",
        params: {
          ...params,
          page: params.page || 1,
          page_size: params.page_size || 20,
        },
      }),
      providesTags: ["CraftableItems"],
    }),

    // Calculate crafting quality
    calculateQuality: builder.mutation<
      CalculateQualityResponse,
      {
        blueprint_id: string
        input_materials: CraftingInputMaterial[]
      }
    >({
      query: (body) => ({
        url: "/calculate-quality",
        method: "POST",
        body,
      }),
    }),
  }),
})

// Export hooks
export const {
  useGetCraftableItemsQuery,
  useCalculateQualityMutation,
} = craftingApi
