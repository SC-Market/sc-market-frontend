/**
 * Resources API - RTK Query hooks for Game Data Resources
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface ResourceSearchResult {
  resource_id: string
  game_item_id: string
  resource_name: string
  resource_icon?: string
  resource_category: string
  resource_subcategory?: string
  max_stack_size?: number
  base_value?: number
  can_be_mined: boolean
  can_be_purchased: boolean
  can_be_salvaged: boolean
  can_be_looted: boolean
  blueprint_count: number
}

export interface SearchResourcesResponse {
  resources: ResourceSearchResult[]
  total: number
  page: number
  page_size: number
}

export interface SearchResourcesParams {
  text?: string
  resource_category?: string
  resource_subcategory?: string
  acquisition_method?: "mined" | "purchased" | "salvaged" | "looted"
  version_id?: string
  page?: number
  page_size?: number
}

export interface ResourceCategory {
  category: string
  subcategory?: string
  count: number
}

export interface BlueprintRequiringResource {
  blueprint_id: string
  blueprint_name: string
  output_item_name: string
  output_item_icon?: string
  quantity_required: number
  min_quality_tier?: number
}

export interface ResourceDetailResponse {
  resource: {
    resource_id: string
    game_item_id: string
    resource_name: string
    resource_icon?: string
    resource_category: string
    resource_subcategory?: string
    max_stack_size?: number
    base_value?: number
    can_be_mined: boolean
    can_be_purchased: boolean
    can_be_salvaged: boolean
    can_be_looted: boolean
  }
  blueprints_requiring: BlueprintRequiringResource[]
  market_price?: {
    min_price?: number
    max_price?: number
    average_price?: number
  }
}

export const resourcesApi = createApi({
  reducerPath: "resourcesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v2/game-data/resources",
    credentials: "include",
  }),
  tagTypes: ["Resources", "ResourceDetail", "ResourceCategories"],
  endpoints: (builder) => ({
    searchResources: builder.query<SearchResourcesResponse, SearchResourcesParams>({
      query: (params) => ({
        url: "/search",
        params: { ...params, page: params.page || 1, page_size: params.page_size || 20 },
      }),
      providesTags: ["Resources"],
    }),
    getResourceDetail: builder.query<ResourceDetailResponse, string>({
      query: (id) => `/${id}`,
      providesTags: (_r, _e, id) => [{ type: "ResourceDetail", id }],
    }),
    getResourceCategories: builder.query<ResourceCategory[], { version_id?: string } | void>({
      query: (params) => ({
        url: "/categories",
        params: params || undefined,
      }),
      providesTags: ["ResourceCategories"],
    }),
  }),
})

export const {
  useSearchResourcesQuery,
  useGetResourceDetailQuery,
  useGetResourceCategoriesQuery,
} = resourcesApi
