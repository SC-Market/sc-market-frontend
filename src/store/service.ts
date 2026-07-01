import { BACKEND_URL } from "../util/constants"
import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import { refreshAuth } from "./refreshAuth"

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${BACKEND_URL}`,
  credentials: "include",
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)
  if (result.error?.status === 401) {
    const refreshed = await refreshAuth()
    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions)
    }
  }
  return result
}

export const serviceApi = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
  reducerPath: "serviceApi",
  refetchOnReconnect: true,
  refetchOnFocus: false,
  keepUnusedDataFor: 600,
  tagTypes: [
    "RecruitingPostComments",
    "RecruitingPosts",
    "RecruitingPost",
    "Comment",
    "Order",
    "Orders",
    "Profile",
    "MyProfile",
    "Listing",
    "Contractor",
    "MyShips",
    "Service",
    "OrderWebhook",
    "ContractorInvite",
    "AllListings",
    "ContractorListings",
    "Chat",
    "Notifications",
    "Aggregates",
    "Aggregate",
    "Offers",
    "Offer",
    "PublicContracts",
    "ModerationReports",
    "SellerAnalytics",
    "AdminAlerts",
    "Blocklist",
    "OrgBlocklist",
    "OrderSettings",
    "MarketStats",
    "MarketListings",
    "MarketListingsV2",
    "MarketBids",
    "StockLocations",
    "StockLots",
    "OrderAllocations",
    "UserListings",
    "MyListings",
    "MarketCategories",
    "MarketItems",
    "PublicListings",
    "BuyOrderListings",
    "MarketListingOrders",
    "AggregateChart",
    "AggregateHistory",
    "GameItem",
    "Multiple",
    "AdminAuditLogs",
    "ContractorAuditLogs",
    "AvailabilityRequirement",
    "OrderLimits",
    "ContractorLanguages",
    "UserLanguages",
    "PushSubscriptions",
    "PushPreferences",
    "UserEmail",
    "EmailPreferences",
    "UserOrganizations",
    "ApiToken",
    "ScmdbSync",
  ],
})
