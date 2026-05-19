/**
 * In-Game NPC Shops API Endpoints
 *
 * Provides queries for game shop data extracted from p4k data files.
 * Injected into serviceApi.
 */

import { serviceApi } from "../service"

export interface ShopAvailability {
  shop_id: string
  shop_name: string
  shop_location: string
  buy_price: number | null
  sell_price: number | null
}

export interface ItemShopsResponse {
  item: {
    id: string
    name: string
    type: string
  }
  shops: ShopAvailability[]
}

export const shopsApi = serviceApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get which NPC shops sell/buy a specific game item.
     * Accepts the game_item UUID (same as WikiItemDetail.id).
     */
    getItemShops: builder.query<ShopAvailability[], { itemId: string }>({
      query: ({ itemId }) => `/api/v1/shops/game/items/${itemId}/shops`,
      transformResponse: (response: { data: ItemShopsResponse }) =>
        response.data.shops,
    }),
  }),
  overrideExisting: false,
})

export const { useGetItemShopsQuery } = shopsApi
