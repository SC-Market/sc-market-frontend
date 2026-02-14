import React, { useState } from "react"
import { Box, Grid, Paper, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { ItemListings } from "../../market/views/ItemListings"
import { MarketSidebarContext } from "../../market/hooks/MarketSidebar"
import { MarketSidebar } from "../../market/components/MarketSidebar"
import { MarketSideBarToggleButton } from "../../market/components/MarketSidebar"
import { MarketSearchArea } from "../../market/components/MarketSidebar"

export function ProfileStoreView(props: { user: string }) {
  const { user } = props
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <MarketSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
      {xs && <MarketSidebar />}
      {xs && <MarketSideBarToggleButton />}
      <Grid
        container
        spacing={theme.layoutSpacing.layout}
        justifyContent={"center"}
      >
        <Grid item xs={0} md={3} sx={{ display: { xs: "none", md: "block" } }}>
          <Paper sx={{ padding: 1 }}>
            <MarketSearchArea />
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              pb: 3,
            }}
          >
            <ItemListings user={user} />
          </Box>
        </Grid>
      </Grid>
    </MarketSidebarContext.Provider>
  )
}

export function OrgStoreView(props: { org: string }) {
  const { org } = props
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <MarketSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
      {xs && <MarketSidebar />}
      {xs && <MarketSideBarToggleButton />}
      <Grid
        container
        spacing={theme.layoutSpacing.layout}
        justifyContent={"center"}
      >
        <Grid item xs={0} md={3} sx={{ display: { xs: "none", md: "block" } }}>
          <Paper sx={{ padding: 1 }}>
            <MarketSearchArea />
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              pb: 3,
            }}
          >
            <ItemListings org={org} />
          </Box>
        </Grid>
      </Grid>
    </MarketSidebarContext.Provider>
  )
}
