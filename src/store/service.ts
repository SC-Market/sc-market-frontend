import { BACKEND_URL } from "../util/constants"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';

export const serviceApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}`,
    credentials: "include",
  }),
  endpoints: (builder) => ({}),
  reducerPath: "serviceApi",
  refetchOnReconnect: true,
  refetchOnFocus: false, // Don't refetch on window focus - service worker handles this
  // Enhanced caching configuration for better offline PWA experience
  keepUnusedDataFor: 600, // Increased from 5 minutes to 10 minutes for better offline support
  // This reduces API requests by keeping data in cache longer
  // Users navigating back/forth won't trigger unnecessary refetches
  // Works in coordination with service worker cache for optimal offline experience
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
  ],
})
