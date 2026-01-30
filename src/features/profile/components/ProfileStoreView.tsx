import React, { useState } from "react"
import { Container, Grid, Paper, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { ItemListings } from "../../../views/market/ItemListings"
import {
  MarketSidebarContext,
  MarketSidebar,
  MarketSideBarToggleButton,
  MarketSearchArea,
} from "../../market"

export function ProfileStoreView(props: { user: string }) {
  const { user } = props
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <MarketSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
      {xs && <MarketSidebar />}
      {xs && <MarketSideBarToggleButton />}
      <Container maxWidth={"xl"}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout}
          justifyContent={"center"}
        >
          <Grid
            item
            xs={0}
            md={3}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Paper sx={{ padding: 1 }}>
              <MarketSearchArea />
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid
              container
              spacing={theme.layoutSpacing.layout}
              justifyContent={"center"}
            >
              <ItemListings user={user} />
            </Grid>
          </Grid>
        </Grid>
      </Container>
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
      <Container maxWidth={"xl"}>
        <Grid
          container
          spacing={theme.layoutSpacing.layout}
          justifyContent={"center"}
        >
          <Grid
            item
            xs={0}
            md={3}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Paper sx={{ padding: 1 }}>
              <MarketSearchArea />
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid
              container
              spacing={theme.layoutSpacing.layout}
              justifyContent={"center"}
            >
              <ItemListings org={org} />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </MarketSidebarContext.Provider>
  )
}
