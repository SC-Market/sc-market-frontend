import React from "react"
import { CircularProgress, Box } from "@mui/material"
import { useFeatureFlag } from "../../hooks/market/useFeatureFlag"

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
 * MarketRouter – switches between V1 and V2 market search/browse experience
 * based on the feature flag. Only used for search/browse routes
 * (/market, /bulk, /buyorders, /market/services, /market/category/:name).
 * All other market routes (detail, create, edit, cart, stock) are routed
 * directly in App.tsx.
 */
export function MarketRouter() {
  const { marketVersion, isLoading, error } = useFeatureFlag()

  if (isLoading) {
    return <MarketLoadingFallback />
  }

  if (error) {
    console.error("Failed to load feature flag, falling back to V1:", error)
    return (
      <React.Suspense fallback={<MarketLoadingFallback />}>
        <MarketPageV1 />
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
      <MarketPageV1 />
    </React.Suspense>
  )
}
