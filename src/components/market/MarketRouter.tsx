import React from "react"
import { CircularProgress, Box } from "@mui/material"
import { useFeatureFlag } from "../../hooks/market/useFeatureFlag"

// V1 component (existing)
const MarketPageV1 = React.lazy(() =>
  import("../../features/market/components/MarketPage").then((module) => ({
    default: module.MarketPage,
  })),
)

// V2 component (placeholder for now)
const MarketPageV2 = React.lazy(() =>
  import("./v2/MarketPageV2").then((module) => ({
    default: module.MarketPageV2,
  })),
)

/**
 * MarketRouter component that conditionally renders V1 or V2 market experience
 * based on the feature flag setting.
 * 
 * This component:
 * - Fetches the current market version from the feature flag service
 * - Shows a loading state while the flag is being fetched
 * - Renders the appropriate market version (V1 or V2) based on the flag
 * - Handles errors gracefully with fallback to V1
 * 
 * @returns The appropriate market component based on feature flag
 */
export function MarketRouter() {
  const { marketVersion, isLoading, error } = useFeatureFlag()

  // Show loading state while fetching feature flag
  if (isLoading) {
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

  // On error, fall back to V1 for safety
  if (error) {
    console.error("Failed to load feature flag, falling back to V1:", error)
    return (
      <React.Suspense
        fallback={
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        }
      >
        <MarketPageV1 />
      </React.Suspense>
    )
  }

  // Render V2 if flag is set to V2
  if (marketVersion === "V2") {
    return (
      <React.Suspense
        fallback={
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        }
      >
        <MarketPageV2 />
      </React.Suspense>
    )
  }

  // Default to V1
  return (
    <React.Suspense
      fallback={
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      }
    >
      <MarketPageV1 />
    </React.Suspense>
  )
}
