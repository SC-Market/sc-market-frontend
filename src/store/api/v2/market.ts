import { generatedApi as api } from "../../generatedApi";
export const addTagTypes = ["Market"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      searchListings: build.query<
        SearchListingsApiResponse,
        SearchListingsApiArg
      >({
        query: (queryArg) => ({
          url: `/market/listings`,
          params: {
            query: queryArg.query,
            item_type: queryArg.itemType,
            sale_type: queryArg.saleType,
            min_price: queryArg.minPrice,
            max_price: queryArg.maxPrice,
            quantity_available: queryArg.quantityAvailable,
            user_seller_id: queryArg.userSellerId,
            contractor_seller_id: queryArg.contractorSellerId,
            statuses: queryArg.statuses,
            listing_type: queryArg.listingType,
            sort: queryArg.sort,
            page: queryArg.page,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["Market"],
      }),
      createListing: build.mutation<
        CreateListingApiResponse,
        CreateListingApiArg
      >({
        query: (queryArg) => ({
          url: `/market/listings`,
          method: "POST",
          body: queryArg.createListingRequest,
        }),
        invalidatesTags: ["Market"],
      }),
      getListingDetails: build.query<
        GetListingDetailsApiResponse,
        GetListingDetailsApiArg
      >({
        query: (queryArg) => ({
          url: `/market/listings/${queryArg.listingId}/details`,
        }),
        providesTags: ["Market"],
      }),
      updateListing: build.mutation<
        UpdateListingApiResponse,
        UpdateListingApiArg
      >({
        query: (queryArg) => ({
          url: `/market/listings/${queryArg.listingId}`,
          method: "PUT",
          body: queryArg.updateListingRequest,
        }),
        invalidatesTags: ["Market"],
      }),
      deleteListing: build.mutation<
        DeleteListingApiResponse,
        DeleteListingApiArg
      >({
        query: (queryArg) => ({
          url: `/market/listings/${queryArg.listingId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Market"],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as v2_marketApi };
export type SearchListingsApiResponse =
  /** status 200 Successfully retrieved listings */ ListingSearchResponse;
export type SearchListingsApiArg = {
  query?: string;
  itemType?: string;
  saleType?: string;
  minPrice?: number;
  maxPrice?: number;
  quantityAvailable?: number;
  userSellerId?: string;
  contractorSellerId?: string;
  statuses?: string;
  listingType?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};
export type CreateListingApiResponse =
  /** status 201 Successfully created listing */ ListingDetailResponse;
export type CreateListingApiArg = {
  createListingRequest: CreateListingRequest;
};
export type GetListingDetailsApiResponse =
  /** status 200 Successfully retrieved listing details */ ListingDetailResponse;
export type GetListingDetailsApiArg = {
  listingId: string;
};
export type UpdateListingApiResponse =
  /** status 200 Successfully updated listing */ ListingDetailResponse;
export type UpdateListingApiArg = {
  listingId: string;
  updateListingRequest: UpdateListingRequest;
};
export type DeleteListingApiResponse = unknown;
export type DeleteListingApiArg = {
  listingId: string;
};
export type ListingSearchResult = {
  listing_id: string;
  listing_type: string;
  item_type: string;
  item_name: string | null;
  game_item_id: string | null;
  sale_type: string;
  price: number;
  expiration: string | null;
  minimum_price: number;
  maximum_price: number;
  quantity_available: number;
  timestamp: string;
  total_rating: number;
  avg_rating: number;
  details_id: string | null;
  status: "active" | "inactive" | "archived";
  user_seller: string | null;
  contractor_seller: string | null;
  auction_end_time: string | null;
  rating_count: number | null;
  rating_streak: number | null;
  total_orders: number | null;
  total_assignments: number | null;
  response_rate: number | null;
  title: string;
  photo: string;
  internal: boolean;
  badges: any | null;
};
export type ListingSearchResponse = {
  total: number;
  listings: ListingSearchResult[];
};
export type ListingDetailResponse = {
  type: "unique" | "aggregate" | "multiple";
  listing: {
    expiration: string;
    timestamp: string;
    status: string;
    quantity_available: number;
    price: number;
    sale_type: string;
    listing_id: string;
  };
  details: {
    game_item_id: string | null;
    item_type: string;
    description: string;
    title: string;
  };
  photos: string[];
  stats: {
    view_count: number | string;
    offer_count?: number;
    order_count?: number;
  };
  accept_offers?: boolean;
  auction_details?: any;
  buy_orders?: any[];
  listings?: any[];
};
export type CreateListingRequest = {
  /** Listing title */
  title: string;
  /** Listing description */
  description: string;
  /** Price in aUEC */
  price: number;
  /** Available quantity */
  quantity: number;
  /** Game item ID (optional) */
  game_item_id?: string | null;
  /** Item type (e.g., "ship", "component", "commodity") */
  item_type: string;
  /** Sale type (e.g., "sale", "auction") */
  sale_type?: string;
  /** Photo URLs */
  photos?: string[];
  /** Contractor spectrum ID (for contractor listings) */
  spectrum_id?: string;
  /** Whether listing is internal to contractor */
  internal?: boolean;
};
export type UpdateListingRequest = {
  /** Updated title */
  title?: string;
  /** Updated description */
  description?: string;
  /** Updated price */
  price?: number;
  /** Updated quantity */
  quantity_available?: number;
  /** Updated status */
  status?: string;
  /** Updated item type */
  item_type?: string;
  /** Updated game item name */
  item_name?: string | null;
  /** Updated photos */
  photos?: string[];
  /** Updated internal flag */
  internal?: boolean;
};
export const {
  useSearchListingsQuery,
  useCreateListingMutation,
  useGetListingDetailsQuery,
  useUpdateListingMutation,
  useDeleteListingMutation,
} = injectedRtkApi;
