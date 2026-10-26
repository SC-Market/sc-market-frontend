import { Box, Container, Divider, Grid, Paper, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import {
  useBreakpointDown,
  useIsMobile,
} from "../../hooks/layout/useBreakpoint"
import { useDrawerOpen } from "../../hooks/layout/Drawer"
import { useMarketSidebarExp } from "../../features/market/hooks/MarketSidebar"
import {
  LISTING_GRID_SKELETON_COUNT,
  buyOrderGridBreakpoints,
  listingSearchGridBreakpoints,
} from "../../features/market/v2/marketSearchLayout"
import type { ExtendedTheme } from "../../hooks/styles/Theme"
import { MARKET_FILTER_PANEL_SX } from "../layout/MarketPageLayout"
import { BaseSkeleton } from "./BaseSkeleton"
import { ListingSkeleton } from "./ListingSkeleton"
import { ServiceListingSkeleton } from "./ServiceListingSkeleton"

/** Filter fields of MarketSearchAreaV2 / ServiceSearchArea, as placeholders. */
export function FilterPanelSkeleton({ fields = 7 }: { fields?: number }) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Box sx={{ padding: theme.spacing(2) }}>
      <Stack spacing={2}>
        <BaseSkeleton variant="rectangular" height={40} />
        {Array.from({ length: fields }).map((_, i) => (
          <Box key={i}>
            <BaseSkeleton variant="text" width={90} height={20} />
            <BaseSkeleton variant="rectangular" height={40} />
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

/** The desktop filter panel: same box as the real one, filled with placeholders. */
export function FilterPanelBoxSkeleton({ fields }: { fields?: number }) {
  return (
    <Paper
      sx={{
        ...MARKET_FILTER_PANEL_SX,
        // The real panel's content is taller than the viewport, so it always
        // renders at its max height.
        height: MARKET_FILTER_PANEL_SX.maxHeight,
        overflowY: "hidden",
      }}
    >
      <FilterPanelSkeleton fields={fields} />
    </Paper>
  )
}

/** UnifiedSearchBar + ViewModeToggle row above the results. */
function SearchRowSkeleton() {
  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <BaseSkeleton
        variant="rectangular"
        height={40}
        sx={{ flex: 1, borderRadius: 1 }}
      />
      <BaseSkeleton
        variant="rectangular"
        width={72}
        height={36}
        sx={{ borderRadius: 1 }}
      />
    </Box>
  )
}

/**
 * Body of the /market and /buyorders pages while they load: the same
 * container, filter panel and card grid (columns from marketSearchLayout) as
 * ListingSearchV2 and BuyOrdersViewV2, with skeleton cards. Goes inside
 * MarketPageLayout, under the page header.
 */
export function MarketSearchSkeleton({
  kind = "listings",
}: {
  kind?: "listings" | "buyorders"
}) {
  const theme = useTheme<ExtendedTheme>()
  const showMobileSidebar = useBreakpointDown("lg")
  const [drawerOpen] = useDrawerOpen()
  const marketSidebarOpen = useMarketSidebarExp()

  const gridBreakpoints =
    kind === "buyorders"
      ? buyOrderGridBreakpoints(marketSidebarOpen)
      : listingSearchGridBreakpoints(!showMobileSidebar, drawerOpen)

  const cards = (
    <Grid container spacing={1}>
      {Array.from({ length: LISTING_GRID_SKELETON_COUNT }).map((_, i) => (
        <Grid item {...gridBreakpoints} key={i}>
          <ListingSkeleton index={i} sidebarOpen={marketSidebarOpen} />
        </Grid>
      ))}
    </Grid>
  )

  return (
    <Container
      maxWidth={"xxxl"}
      sx={
        kind === "listings"
          ? { padding: 0, px: { xs: 0, sm: 2 } }
          : { padding: 0 }
      }
    >
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {showMobileSidebar ? (
          <Grid
            container
            spacing={
              kind === "listings"
                ? { xs: 1, sm: theme.layoutSpacing.layout }
                : theme.layoutSpacing.layout
            }
          >
            {/* MarketNavArea renders an empty row here */}
            <Grid item xs={12} />
            <Grid item xs={12}>
              <Divider light />
            </Grid>
            <Grid item xs={12}>
              <SearchRowSkeleton />
            </Grid>
            <Grid item xs={12} sx={{ px: { xs: 0 } }}>
              {cards}
            </Grid>
          </Grid>
        ) : (
          <Stack
            direction="row"
            justifyContent="center"
            spacing={theme.layoutSpacing.layout}
            sx={{ width: "100%", maxWidth: "xxxl" }}
          >
            <FilterPanelBoxSkeleton />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ mb: 1.5 }}>
                <SearchRowSkeleton />
              </Box>
              {cards}
            </Box>
          </Stack>
        )}
      </Box>
    </Container>
  )
}

/** Service cards shown while ServiceListings (and its chunk) loads. */
export function ServiceListingsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ServiceListingSkeleton key={i} index={i} />
      ))}
    </>
  )
}

/**
 * Body of /market/services while it loads: ServiceMarketView's container,
 * filter panel and two-column card grid, with skeleton cards.
 */
export function ServiceMarketSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  const xs = useIsMobile()

  return (
    <Container maxWidth={"xxl"} sx={{ padding: 0 }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {xs ? (
          <Grid container spacing={theme.layoutSpacing.layout}>
            <Grid item xs={12}>
              <Divider light />
            </Grid>
            <Grid item xs={12}>
              <Grid
                container
                spacing={theme.layoutSpacing.layout}
                justifyContent={"center"}
              >
                <ServiceListingsSkeleton />
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <Stack
            direction="row"
            justifyContent="center"
            spacing={theme.layoutSpacing.layout}
            sx={{ width: "100%", maxWidth: "xxl" }}
          >
            <FilterPanelBoxSkeleton />
            <Box sx={{ flex: 1 }}>
              <Grid
                container
                spacing={theme.layoutSpacing.layout}
                justifyContent={"center"}
              >
                <ServiceListingsSkeleton />
              </Grid>
            </Box>
          </Stack>
        )}
      </Box>
    </Container>
  )
}
