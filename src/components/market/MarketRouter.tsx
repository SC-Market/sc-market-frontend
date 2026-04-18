import React from "react"
import { CircularProgress, Box } from "@mui/material"
import { useFeatureFlag } from "../../hooks/market/useFeatureFlag"
import { useLocation, useParams } from "react-router-dom"

const MarketPageV1 = React.lazy(() =>
  import("../../features/market/components/MarketPage").then((module) => ({
    default: module.MarketPage,
  })),
)

const MarketPageV2 = React.lazy(() =>
  import("./v2/MarketPageV2").then((module) => ({
    default: module.MarketPageV2,
  })),
)

// Lazy-loaded V1 page components for non-search routes
const ViewMarketListing = React.lazy(() =>
  import("../../pages/market/ViewMarketListing").then((m) => ({
    default: m.ViewMarketListing,
  })),
)
const EditMarketListing = React.lazy(() =>
  import("../../pages/market/ViewMarketListing").then((m) => ({
    default: m.EditMarketListing,
  })),
)
const EditMultipleListing = React.lazy(() =>
  import("../../pages/market/ViewMarketListing").then((m) => ({
    default: m.EditMultipleListing,
  })),
)
const ViewMarketAggregate = React.lazy(() =>
  import("../../pages/market/ViewMarketAggregate").then((m) => ({
    default: m.ViewMarketAggregate,
  })),
)
const ViewMarketMultiple = React.lazy(() =>
  import("../../pages/market/ViewMarketMultiple").then((m) => ({
    default: m.ViewMarketMultiple,
  })),
)
const MarketCreate = React.lazy(() =>
  import("../../pages/market/MarketCreate").then((m) => ({
    default: m.MarketCreate,
  })),
)
const MyMarketListings = React.lazy(() =>
  import("../../pages/market/MyMarketListings").then((m) => ({
    default: m.MyMarketListings,
  })),
)
const ManageStock = React.lazy(() =>
  import("../../pages/market/ManageStock").then((m) => ({
    default: m.ManageStock,
  })),
)
const ManageStockLots = React.lazy(() =>
  import("../../pages/market/ManageStockLots").then((m) => ({
    default: m.ManageStockLots,
  })),
)
const ManageListingStock = React.lazy(() =>
  import("../../pages/market/ManageListingStock").then((m) => ({
    default: m.ManageListingStock,
  })),
)
const MarketCart = React.lazy(() =>
  import("../../pages/market/MarketCart").then((m) => ({
    default: m.MarketCart,
  })),
)
const CreateBuyOrder = React.lazy(() =>
  import("../../pages/market/CreateBuyOrder").then((m) => ({
    default: m.CreateBuyOrder,
  })),
)

function MarketLoadingFallback() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="400px"
    >
      <CircularProgress />
    </Box>
  )
}

/**
 * Resolves the correct V1 component based on the current route.
 * For search/browse routes (/market, /bulk, /buyorders, /market/services, /market/category/:name),
 * renders MarketPageV1. For all other routes, renders the original V1 page component.
 */
function MarketV1Router() {
  const { pathname } = useLocation()
  const params = useParams()

  // Edit routes
  if (pathname.startsWith("/market_edit/")) return <EditMarketListing />
  if (pathname.match(/^\/market\/multiple\/[^/]+\/edit$/))
    return <EditMultipleListing />

  // Aggregate detail
  if (pathname.startsWith("/market/aggregate/")) return <ViewMarketAggregate />

  // Multiple detail
  if (
    pathname.startsWith("/market/multiple/") &&
    !pathname.endsWith("/edit")
  )
    return <ViewMarketMultiple />

  // Create listing
  if (pathname.startsWith("/market/create")) return <MarketCreate />

  // My listings
  if (pathname === "/market/me") return <MyMarketListings />

  // Stock management
  if (pathname.startsWith("/market/stock/")) return <ManageListingStock />
  if (pathname === "/market/manage") return <ManageStock />
  if (pathname === "/market/manage-stock") return <ManageStockLots />

  // Cart
  if (pathname === "/market/cart") return <MarketCart />

  // Buy order create
  if (pathname === "/buyorder/create") return <CreateBuyOrder />

  // Listing detail (/market/:id)
  if (pathname.match(/^\/market\/[^/]+$/) && params.id)
    return <ViewMarketListing />

  // Default: search/browse routes → MarketPageV1
  return <MarketPageV1 />
}

export function MarketRouter() {
  const { marketVersion, isLoading, error } = useFeatureFlag()

  if (isLoading) {
    return <MarketLoadingFallback />
  }

  if (error) {
    console.error("Failed to load feature flag, falling back to V1:", error)
    return (
      <React.Suspense fallback={<MarketLoadingFallback />}>
        <MarketV1Router />
      </React.Suspense>
    )
  }

  if (marketVersion === "V2") {
    return (
      <React.Suspense fallback={<MarketLoadingFallback />}>
        <MarketPageV2 />
      </React.Suspense>
    )
  }

  return (
    <React.Suspense fallback={<MarketLoadingFallback />}>
      <MarketV1Router />
    </React.Suspense>
  )
}
