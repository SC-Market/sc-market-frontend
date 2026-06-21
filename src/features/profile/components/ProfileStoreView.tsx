import React, { useState } from "react"
import { Box, Grid, Paper, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { MarketSidebarContext } from "../../market/hooks/MarketSidebar"
import { MarketSidebar } from "../../market/components/MarketSidebar"
import { MarketSearchArea } from "../../market/components/MarketSidebar"
import { FiltersFAB } from "../../../components/mobile/FiltersFAB"
import { useSearchListingsQuery } from "../../../store/api/v2/market"
import { ListingCardV2 } from "../../market/v2/ListingSearchV2"

export function ProfileStoreView(props: { user: string }) {
  const { user } = props
  const theme = useTheme<ExtendedTheme>()
  const xs = useMediaQuery(theme.breakpoints.down("md"))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <MarketSidebarContext.Provider value={[sidebarOpen, setSidebarOpen]}>
      {xs && <MarketSidebar />}
      {xs && <FiltersFAB onClick={() => setSidebarOpen(true)} label="Filters" />}
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
            <ProfileListingsV2 sellerId={user} />
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
      {xs && <FiltersFAB onClick={() => setSidebarOpen(true)} label="Filters" />}
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
            <ProfileListingsV2 contractorId={org} />
          </Box>
        </Grid>
      </Grid>
    </MarketSidebarContext.Provider>
  )
}

/** Lightweight V2 listing grid for profile/org pages */
function ProfileListingsV2(props: { sellerId?: string; contractorId?: string }) {
  const { data, isLoading } = useSearchListingsQuery({
    shopSlug: props.contractorId ?? props.sellerId,
    page: 1,
    pageSize: 20,
    status: "active",
    sortBy: "created_at",
    sortOrder: "desc",
  })

  if (isLoading) return null

  return (
    <Grid container spacing={1}>
      {(data?.listings || []).map((listing, index) => (
        <Grid item xs={6} sm={4} md={4} lg={3} key={listing.listing_id}>
          <ListingCardV2 listing={listing} index={index} />
        </Grid>
      ))}
    </Grid>
  )
}
