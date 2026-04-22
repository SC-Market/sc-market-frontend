/**
 * FilterSidebarLayout - Persistent sidebar on desktop, BottomSheet on mobile
 * 
 * Renders filter content in a sticky sidebar (300px) on desktop,
 * and in a BottomSheet triggered by a FiltersFAB on mobile.
 */

import React, { useState } from "react"
import { Box, Grid, Paper, Typography, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "../mobile/BottomSheet"
import { FiltersFAB } from "../mobile/FiltersFAB"

interface FilterSidebarLayoutProps {
  /** Filter controls to render in sidebar/bottom sheet */
  filters: React.ReactNode
  /** Main content */
  children: React.ReactNode
  /** Sidebar title */
  filterTitle?: string
  /** Sidebar width on desktop */
  sidebarWidth?: number
}

export function FilterSidebarLayout({
  filters,
  children,
  filterTitle = "Filters",
  sidebarWidth = 300,
}: FilterSidebarLayoutProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  const [sheetOpen, setSheetOpen] = useState(false)

  if (isMobile) {
    return (
      <>
        {children}
        <BottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={filterTitle}
          snapPoints={["half", "75", "full"]}
          defaultSnap="75"
        >
          <Box sx={{ p: 2 }}>{filters}</Box>
        </BottomSheet>
        <FiltersFAB onClick={() => setSheetOpen(true)} label={filterTitle} />
      </>
    )
  }

  return (
    <Grid container spacing={theme.layoutSpacing?.layout ?? 2} sx={{ flexWrap: "nowrap" }}>
      <Grid item sx={{ width: sidebarWidth, flexShrink: 0 }}>
        <Paper
          sx={{
            p: 2,
            position: "sticky",
            top: 80,
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {filterTitle}
          </Typography>
          {filters}
        </Paper>
      </Grid>
      <Grid item xs sx={{ minWidth: 0 }}>
        <Box sx={{ overflow: "hidden" }}>
          {children}
        </Box>
      </Grid>
    </Grid>
  )
}
