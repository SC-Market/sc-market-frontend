import { Box } from "@mui/material"
import React from "react"

export const LISTING_CARD_WIDTH = 200

// Reusable wrapper for consistent listing sizing
// useFixedWidth: true for horizontal scrolling (landing page), false for Grid layout
export const ListingWrapper = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; useFixedWidth?: boolean }
>(function ListingWrapper({ children, useFixedWidth = false }, ref) {
  return (
    <Box
      ref={ref}
      sx={{
        position: "relative",
        width: useFixedWidth ? { xs: "min(50vw, 200px)", sm: LISTING_CARD_WIDTH } : "100%",
        flexShrink: useFixedWidth ? 0 : undefined,
      }}
    >
      {children}
    </Box>
  )
})
