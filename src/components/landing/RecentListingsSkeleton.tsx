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
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
        (item, index) => (
          <HorizontalListingSkeleton key={index} index={index} />
        ),
      )}
    </Box>
  )
}
