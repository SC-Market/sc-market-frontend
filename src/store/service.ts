import { BACKEND_URL } from "../util/constants"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const serviceApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}`,
    credentials: "include",
  }),
  endpoints: (builder) => ({}),
  reducerPath: "serviceApi",
  refetchOnReconnect: true,
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
    "Shops",
  ],
})
