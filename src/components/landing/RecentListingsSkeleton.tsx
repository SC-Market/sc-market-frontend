import React from "react"
import { Box } from "@mui/material"
import { HorizontalListingSkeleton } from "../skeletons"

/**
 * Skeleton loader for recent listings display
 * Extracted from LandingPage to prevent circular dependencies
 */
export function RecentListingsSkeleton() {
  return (
    <Box
      display={"flex"}
      sx={{
        maxWidth: "100%",
        overflowX: "scroll",
      }}
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <HorizontalListingSkeleton key={index} />
      ))}
    </Box>
  )
}
