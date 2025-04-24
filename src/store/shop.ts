import { serviceApi } from "./service"
import { ShopListing } from "../datatypes/Shop"

export const shopApi = serviceApi.injectEndpoints({
  endpoints: (builder) => ({
    getShops: builder.query<
      { total: number; shops: ShopListing[] },
      { page: number; page_size: number; query?: string; sort?: string }
    >({
      query: (params) => ({
        url: `${VITE_BACKEND_URL}/api/shops`,
        params,
      }),
      providesTags: ['Shops'],
    }),
    // Add other shop-related endpoints here
  }),
})

export const { useGetShopsQuery } = shopApi 