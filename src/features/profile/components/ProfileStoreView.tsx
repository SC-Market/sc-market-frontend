import React, { useState } from "react"
import { Box, Grid, Paper, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { ItemListings } from "../../market/views/ItemListings"
import { MarketSidebarContext } from "../../market/hooks/MarketSidebar"
import { MarketSidebar } from "../../market/components/MarketSidebar"
import { MarketSideBarToggleButton } from "../../market/components/MarketSidebar"
import { MarketSearchArea } from "../../market/components/MarketSidebar"
import { useFeatureFlag } from "../../../hooks/market/useFeatureFlag"
import { ContractorListingsV2 } from "../../market/v2/ContractorListingsV2"
import { useSearchListingsQuery } from "../../../store/api/v2/market"
import { ListingCardV2 } from "../../market/v2/ListingSearchV2"

export function ProfileStoreView(props: { user: string }) {
  const { user } = props
  const { marketVersion } = useFeatureFlag()
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
            {marketVersion === "V2" ? (
              <ProfileListingsV2 sellerId={user} />
            ) : (
              <ItemListings user={user} />
            )}
          </Box>
        </Grid>
      </Grid>
    </MarketSidebarContext.Provider>
  )
}

export function OrgStoreView(props: { org: string }) {
  const { org } = props
  const { marketVersion } = useFeatureFlag()
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
            {marketVersion === "V2" ? (
              <ProfileListingsV2 contractorId={org} />
            ) : (
              <ItemListings org={org} />
            )}
          </Box>
        </Grid>
      </Grid>
    </MarketSidebarContext.Provider>
  )
}

/** Lightweight V2 listing grid for profile/org pages */
function ProfileListingsV2(props: { sellerId?: string; contractorId?: string }) {
  const { data, isLoading } = useSearchListingsQuery({
    sellerId: props.sellerId,
    contractorId: props.contractorId,
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
        <Grid item xs={12} sm={6} md={4} key={listing.listing_id}>
          <ListingCardV2 listing={listing} index={index} />
        </Grid>
      ))}
    </Grid>
  )
}
