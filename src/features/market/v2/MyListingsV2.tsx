/**
 * MyListingsV2 — V2 equivalent of V1 MyMarketListings.
 *
 * Matches V1 layout: three stacked sections (Active / Inactive / Archived)
 * separated by Dividers and HeaderTitles, each rendering a card grid via
 * DisplayListingsMin-style layout. Uses V2 RTK Query hooks exclusively.
 */

import React, { lazy, useCallback, useMemo, useRef, useState } from "react"
import { Divider, Grid, Button } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { AddCircleOutlineRounded } from "@mui/icons-material"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import {
  useGetMyListingsQuery,
  type MyListingItem,
} from "../../../store/api/v2/market"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { ManageListingsTabBar } from "../components/ManageListingsTabBar"
import { ListingSkeleton } from "../../../components/skeletons"
import { EmptyListings } from "../../../components/empty-states"
import { useDrawerOpen } from "../../../hooks/layout/Drawer"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { HeaderTitle } from "../../../components/typography/HeaderTitle"
import { LazySection } from "../../../components/layout/LazySection"
import { MyListingCardV2 } from "./components/MyListingCardV2"

/**
 * Section that fetches and displays listings for a given status.
 * Mirrors V1 MyItemListings but uses V2 useGetMyListingsQuery.
 */
function MyListingSectionV2({ status }: { status: "active" | "expired" | "cancelled" }) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [drawerOpen] = useDrawerOpen()
  const [currentOrg] = useCurrentOrg()
  const [page, setPage] = useState(0)
  const perPage = 48

  const gridBreakpoints = useMemo(() => {
    return { xs: 6, sm: 4, md: 4, lg: 3, xl: 2.4, xxl: 2, xxxl: 12 / 8 }
  }, [])

  const { data, isLoading, isFetching } = useGetMyListingsQuery({
    status,
    page: page + 1,
    pageSize: perPage,
    sortBy: "created_at",
    sortOrder: "desc",
    spectrumId: currentOrg?.spectrum_id,
  })

  const listings = data?.listings ?? []
  const loading = isLoading || isFetching

  if (loading) {
    return (
      <Grid container spacing={1} sx={{ width: "100%" }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <Grid item {...gridBreakpoints} key={i}>
            <ListingSkeleton index={i} sidebarOpen={false} />
          </Grid>
        ))}
      </Grid>
    )
  }

  if (listings.length === 0) {
    return (
      <Grid item xs={12}>
        <EmptyListings
          isSearchResult={false}
          showCreateAction={status === "active"}
        />
      </Grid>
    )
  }

  return (
    <Grid container spacing={1} sx={{ width: "100%" }}>
      {listings.map((listing, index) => (
        <Grid item {...gridBreakpoints} key={listing.listing_id}>
          <MyListingCardV2 listing={listing} index={index} />
        </Grid>
      ))}
    </Grid>
  )
}

// Lazy wrappers matching V1 pattern
const ActiveListingsV2 = lazy(() =>
  Promise.resolve({
    default: () => <MyListingSectionV2 status="active" />,
  }),
)

const InactiveListingsV2 = lazy(() =>
  Promise.resolve({
    default: () => <MyListingSectionV2 status="expired" />,
  }),
)

const ArchivedListingsV2 = lazy(() =>
  Promise.resolve({
    default: () => <MyListingSectionV2 status="cancelled" />,
  }),
)

function ListingsSkeleton() {
  return (
    <Grid item xs={12}>
      <div>Loading...</div>
    </Grid>
  )
}

export function MyListingsV2() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
    <StandardPageLayout
      title={t("sidebar.my_market_listings", "My Listings")}
      breadcrumbs={[
        { label: t("sidebar.market_short", "Market"), href: "/market" },
        { label: t("sidebar.my_market_listings", "My Listings") },
      ]}
      headerTitle={
        <ManageListingsTabBar
          title={t("sidebar.my_market_listings", "My Listings")}
          rightAction={
            <Link to="/market/create" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<AddCircleOutlineRounded />}
              >
                {t("market.createListing", "Create Listing")}
              </Button>
            </Link>
          }
        />
      }
      sidebarOpen={true}
      maxWidth="lg"
    >
      <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
        {/* Active Listings */}
        <LazySection
          component={ActiveListingsV2}
          skeleton={ListingsSkeleton}
          gridProps={{
            item: true,
            container: true,
            xs: 12,
            lg: 12,
            spacing: theme.layoutSpacing.component,
            sx: { transition: "0.3s" },
          }}
        />

        <Grid
          item
          container
          justifyContent="space-between"
          spacing={theme.layoutSpacing.layout}
          xs={12}
        >
          <HeaderTitle lg={12} xl={12}>
            {t("market.inactiveListings", "Inactive Listings")}
          </HeaderTitle>
        </Grid>

        <Grid item xs={12}>
          <Divider light />
        </Grid>

        <LazySection
          component={InactiveListingsV2}
          skeleton={ListingsSkeleton}
          gridProps={{
            item: true,
            container: true,
            xs: 12,
            lg: 12,
            spacing: theme.layoutSpacing.component,
            sx: { transition: "0.3s" },
          }}
        />

        <Grid
          item
          container
          justifyContent="space-between"
          spacing={theme.layoutSpacing.layout}
          xs={12}
        >
          <HeaderTitle lg={12} xl={12}>
            {t("market.archivedListings", "Archived Listings")}
          </HeaderTitle>
        </Grid>

        <Grid item xs={12}>
          <Divider light />
        </Grid>

        <LazySection
          component={ArchivedListingsV2}
          skeleton={ListingsSkeleton}
          gridProps={{
            item: true,
            container: true,
            xs: 12,
            lg: 12,
            spacing: theme.layoutSpacing.component,
            sx: { transition: "0.3s" },
          }}
        />
      </Grid>
      </Grid>
    </StandardPageLayout>
  )
}
