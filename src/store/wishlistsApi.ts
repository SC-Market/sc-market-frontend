/**
 * Wishlists API - RTK Query hooks for Game Data Wishlists
 * 
 * Provides hooks for wishlist management, item operations, and shopping list generation.
 * Task 14.1 - Wishlist Manager Frontend
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 32.1-32.6, 46.1-46.10, 53.1-53.10
 */

import { createApi } from "@reduxjs/toolkit/query/react"
import { createV2BaseQuery } from "./generatedApiV2"

// ============================================================================
// Types
// ============================================================================

export interface Wishlist {
  wishlist_id: string
  user_id: string
  wishlist_name: string
  wishlist_description?: string
  is_public: boolean
  share_token?: string
  organization_id?: string
  is_collaborative: boolean
  created_at: string
  updated_at: string
}

export interface WishlistWithStats extends Wishlist {
  item_count: number
  completed_items: number
  progress_percentage: number
}

export interface WishlistItem {
  item_id: string
  wishlist_id: string
  game_item_id: string
  desired_quantity: number
  desired_quality_tier?: number
  blueprint_id?: string
  priority: number
  notes?: string
  is_acquired: boolean
  acquired_quantity: number
  created_at: string
  updated_at: string
}

export interface WishlistItemWithDetails extends WishlistItem {
  game_item_name: string
  game_item_icon?: string
  game_item_type: string
  blueprint_name?: string
  estimated_cost?: number
  crafting_available: boolean
}

export interface ListWishlistsResponse {
  wishlists: WishlistWithStats[]
}

export interface GetWishlistResponse {
  wishlist: Wishlist
  items: WishlistItemWithDetails[]
  statistics: {
    total_items: number
    completed_items: number
    progress_percentage: number
    total_estimated_cost: number
  }
}

export interface CreateWishlistRequest {
  wishlist_name: string
  wishlist_description?: string
  is_public: boolean
  organization_id?: string
  is_collaborative: boolean
}

export interface UpdateWishlistRequest {
  wishlist_name?: string
  wishlist_description?: string
  is_public?: boolean
  is_collaborative?: boolean
}

export interface AddWishlistItemRequest {
  game_item_id: string
  desired_quantity: number
  desired_quality_tier?: number
  blueprint_id?: string
  priority: number
  notes?: string
}

export interface UpdateWishlistItemRequest {
  desired_quantity?: number
  desired_quality_tier?: number
  priority?: number
  notes?: string
  is_acquired?: boolean
  acquired_quantity?: number
}

export interface ShoppingListMaterial {
  game_item_id: string
  game_item_name: string
  game_item_icon?: string
  total_quantity_needed: number
  desired_quality_tier?: number
  user_inventory_quantity: number
  quantity_to_acquire: number
  estimated_unit_price?: number
  estimated_total_cost?: number
  acquisition_methods: string[]
  used_by_items: Array<{
    wishlist_item_id: string
    item_name: string
    quantity_for_this_item: number
  }>
}

export interface ShoppingListResponse {
  wishlist_id: string
  wishlist_name: string
  materials_needed: ShoppingListMaterial[]
  total_estimated_cost: number
  materials_fully_stocked: number
  materials_partially_stocked: number
  materials_not_stocked: number
}

// ============================================================================
// API Definition
// ============================================================================

export const wishlistsApi = createApi({
  reducerPath: "wishlistsApi",
  baseQuery: createV2BaseQuery("/game-data/wishlists"),
    tagTypes: ["Wishlists", "WishlistDetail", "WishlistItems"],
  endpoints: (builder) => ({
    // Get user's wishlists
    getWishlists: builder.query<ListWishlistsResponse, void>({
      query: () => "/",
      providesTags: ["Wishlists"],
    }),

    // Create a new wishlist
    createWishlist: builder.mutation<Wishlist, CreateWishlistRequest>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wishlists"],
    }),

    // Get wishlist detail with items
    getWishlist: builder.query<GetWishlistResponse, { wishlist_id: string; share_token?: string }>({
      query: ({ wishlist_id, share_token }) => ({
        url: `/${wishlist_id}`,
        params: share_token ? { share_token } : undefined,
      }),
      providesTags: (_result, _error, { wishlist_id }) => [
        { type: "WishlistDetail", id: wishlist_id },
        { type: "WishlistItems", id: wishlist_id },
      ],
    }),

    // Update wishlist
    updateWishlist: builder.mutation<Wishlist, { wishlist_id: string; body: UpdateWishlistRequest }>({
      query: ({ wishlist_id, body }) => ({
        url: `/${wishlist_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { wishlist_id }) => [
        "Wishlists",
        { type: "WishlistDetail", id: wishlist_id },
      ],
    }),

    // Delete wishlist
    deleteWishlist: builder.mutation<{ success: boolean }, string>({
      query: (wishlist_id) => ({
        url: `/${wishlist_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlists"],
    }),

    // Add item to wishlist
    addWishlistItem: builder.mutation<
      WishlistItemWithDetails,
      { wishlist_id: string; body: AddWishlistItemRequest }
    >({
      query: ({ wishlist_id, body }) => ({
        url: `/${wishlist_id}/items`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { wishlist_id }) => [
        "Wishlists",
        { type: "WishlistDetail", id: wishlist_id },
        { type: "WishlistItems", id: wishlist_id },
      ],
    }),

    // Remove item from wishlist
    removeWishlistItem: builder.mutation<{ success: boolean }, { wishlist_id: string; item_id: string }>({
      query: ({ wishlist_id, item_id }) => ({
        url: `/${wishlist_id}/items/${item_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { wishlist_id }) => [
        "Wishlists",
        { type: "WishlistDetail", id: wishlist_id },
        { type: "WishlistItems", id: wishlist_id },
      ],
    }),

    // Update wishlist item
    updateWishlistItem: builder.mutation<
      WishlistItemWithDetails,
      { wishlist_id: string; item_id: string; body: UpdateWishlistItemRequest }
    >({
      query: ({ wishlist_id, item_id, body }) => ({
        url: `/${wishlist_id}/items/${item_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { wishlist_id }) => [
        "Wishlists",
        { type: "WishlistDetail", id: wishlist_id },
        { type: "WishlistItems", id: wishlist_id },
      ],
    }),

    // Generate shopping list
    getShoppingList: builder.query<ShoppingListResponse, string>({
      query: (wishlist_id) => `/${wishlist_id}/shopping-list`,
      providesTags: (_result, _error, wishlist_id) => [{ type: "WishlistItems", id: wishlist_id }],
    }),
  }),
})

// Export hooks
export const {
  useGetWishlistsQuery,
  useCreateWishlistMutation,
  useGetWishlistQuery,
  useUpdateWishlistMutation,
  useDeleteWishlistMutation,
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
  useUpdateWishlistItemMutation,
  useGetShoppingListQuery,
} = wishlistsApi
