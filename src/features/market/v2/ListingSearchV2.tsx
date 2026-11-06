import React, { useMemo, useCallback, useRef } from "react"
import { Box, Container, Divider, Grid, Paper, Stack } from "@mui/material"
import {
  useIsMobile,
  useBreakpointDown,
} from "../../../hooks/layout/useBreakpoint"
import { useTheme } from "@mui/material/styles"
import { useSearchParams, useLocation } from "react-router-dom"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { FRONTEND_URL } from "../../../util/constants"
import { Helmet } from "@unhead/react/helmet"
import { SeoHead } from "../../../seo/SeoHead"
import { buildMarketSearchHead } from "../../../seo/hubHeads"
import { HideOnScroll, MarketNavArea } from "../components/MarketNavArea"
import { useSearchListingsQuery } from "../../../store/api/v2/market"
import type { ListingSearchResult } from "../../../store/api/v2/market"
import {
  UnifiedSearchBar,
  marketParamsToTokens,
  marketTokensToParams,
  type SearchToken,
} from "../../../components/game-data/UnifiedSearchBar"
import { ListingSkeleton } from "../../../components/skeletons"
import { usePageReady } from "../../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../../components/metadata/pageReadyStore"
import {
  CARD_GRID_PAGE_SIZE_OPTIONS,
  NumberedPagination,
} from "../../../components/pagination/NumberedPagination"
import { EmptyListings } from "../../../components/empty-states"
import { ViewModeToggle, useViewMode } from "../../../hooks/market/useViewMode"
import { ListingTableV2 } from "./components/ListingTableV2"
import { useDrawerOpen } from "../../../hooks/layout/Drawer"
import { useTranslation } from "react-i18next"
import { AdCard } from "../../../components/ads/AdCard"
import { insertAds, type WithAds } from "../../../components/ads/adConfig"
import { formatMarketUrl } from "../domain/urls"
import { useFeatureFlag } from "../../../hooks/market/useFeatureFlag"
import { GroupedListingGrid } from "./redesign/GroupedListingGrid"
import {
  LISTING_CARD_HEIGHT,
  LISTING_CARD_ROW_HEIGHT,
  LISTING_GRID_SKELETON_COUNT,
  listingSearchGridBreakpoints,
} from "./marketSearchLayout"
import { MARKET_FILTER_PANEL_SX } from "../../../components/layout/MarketPageLayout"
import { isAwaitingData } from "../../../util/queryLoading"
import { listingSearchArgs } from "./listingSearchArgs"
import { orgScopedListingArgs } from "../../storefront/domain"
import { useCustomDomain } from "../../../hooks/contractor/CustomDomain"
import {
  CardStub,
  firstScreenCards,
  useFirstScreenRender,
} from "../../../components/grid/firstScreen"
import { ListingCardV2 } from "./ListingCardV2"
import { MarketSearchAreaV2, MarketSidebarV2 } from "./MarketSearchAreaV2"

/**
 * ListingSearchV2 - Main search/browse page for V2 listings
 *
 * Reuses V1 layout components (MarketNavArea) for visual parity.
 * Uses RTK Query hook (useSearchListingsQuery) with URL-based filter state.
 * Adds QualityFilter component for quality tier filtering.
 * Maintains identical styling to V1 (Grid spacing={1}, card heights, typography).
 */
// Unhead reads tagPriority off the element (not a DOM attribute of <title>).
const HIGH_TAG_PRIORITY = { tagPriority: "high" } as Record<string, string>

export function ListingSearchV2() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const showMobileSidebar = useBreakpointDown("lg")
  const isMobile = useIsMobile()
  const [drawerOpen] = useDrawerOpen()
  const [viewMode, setViewMode] = useViewMode()
  const { flags } = useFeatureFlag()

  // Read filter state from URL params
  const [searchParams, setSearchParams] = useSearchParams()
  const { pathname } = useLocation()

  // Unified search bar
  const marketSearchTokens = React.useMemo(
    () => marketParamsToTokens(searchParams),
    [searchParams],
  )
  const handleMarketTokensChange = (tokens: SearchToken[]) => {
    const tokenParams = marketTokensToParams(tokens)
    const params = new URLSearchParams(searchParams)
    for (const key of [
      "query",
      "q",
      "type",
      "has_photos",
      "in_stock",
      "bulk_discount",
    ])
      params.delete(key)
    for (const [k, v] of Object.entries(tokenParams)) params.set(k, v)
    setSearchParams(params, { replace: true })
  }

  // Parse URL params to API format (supports both V2 and V1 param names)
  // On an org's white-label domain the market is the org's own listings.
  const { customOrg } = useCustomDomain()
  const searchQuery = useMemo(
    () =>
      orgScopedListingArgs(
        listingSearchArgs(searchParams, isMobile),
        customOrg,
      ),
    [searchParams, isMobile, customOrg],
  )

  // Fetch listings using RTK Query
  const {
    data: results,
    isFetching,
    currentData,
    error,
    refetch,
  } = useSearchListingsQuery(searchQuery)
  // The results grid is the market page's primary content (main[data-ready]).
  usePageReady(isPrimaryLoading({ isFetching, currentData }))

  const {
    listings = [],
    total = 0,
    page: currentPage = 1,
    page_size: currentPageSize = 48,
  } = results || {}

  // Dynamic SEO head based on active filters (shared with the edge bridge)
  const seoHead = useMemo(
    () =>
      buildMarketSearchHead(
        { text: searchQuery.text, itemType: searchQuery.itemType, total },
        FRONTEND_URL,
      ),
    [searchQuery.text, searchQuery.itemType, total],
  )

  // Grid breakpoints - match V1 exactly
  const gridBreakpoints = listingSearchGridBreakpoints(
    !showMobileSidebar,
    drawerOpen,
  )

  // Pagination handlers
  const ref = useRef<HTMLDivElement>(null)

  const handleChangePage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams)
      params.set("page", String(newPage + 1)) // Convert 0-based to 1-based
      setSearchParams(params)
      if (ref.current) {
        ref.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        })
      }
    },
    [searchParams, setSearchParams],
  )

  const handleChangeRowsPerPage = useCallback(
    (pageSize: number) => {
      const params = new URLSearchParams(searchParams)
      params.set("page_size", String(pageSize))
      params.set("page", "1") // Reset to first page
      setSearchParams(params)
    },
    [searchParams, setSearchParams],
  )

  return (
    <>
      <SeoHead head={seoHead} />
      <Helmet>
        {/* The search page's own title beats MarketPageV2's generic "Market"
            title. Both mount in the same commit (MarketRouter preloads this
            chunk), so mount order can't decide it. */}
        <title {...HIGH_TAG_PRIORITY}>{seoHead.title}</title>
        {currentPage > 1 && (
          <link
            rel="prev"
            href={`${FRONTEND_URL}/market?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(currentPage - 1) })}`}
          />
        )}
        {currentPage * currentPageSize < total && (
          <link
            rel="next"
            href={`${FRONTEND_URL}/market?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(currentPage + 1) })}`}
          />
        )}
      </Helmet>
      {/* Mobile/Tablet: Use bottom sheet for filters */}
      {showMobileSidebar && <MarketSidebarV2 />}

      <Container maxWidth={"xxxl"} sx={{ padding: 0, px: { xs: 0, sm: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {showMobileSidebar ? (
            <Grid container spacing={{ xs: 1, sm: theme.layoutSpacing.layout }}>
              <Grid item xs={12}>
                <HideOnScroll>
                  <MarketNavArea />
                </HideOnScroll>
              </Grid>

              <Grid item xs={12}>
                <Divider light />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <UnifiedSearchBar
                      tokens={marketSearchTokens}
                      onChange={handleMarketTokensChange}
                      mode="market"
                      placeholder={t("marketV2.searchItems")}
                    />
                  </Box>
                  <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ px: { xs: 0 } }}>
                {viewMode === "list" ? (
                  <ListingTableV2 listings={listings} />
                ) : flags.market_v2_redesign ? (
                  <GroupedListingGrid
                    listings={listings}
                    loading={isAwaitingData({ isFetching, currentData })}
                    error={!!error}
                    onRetry={refetch}
                    gridBreakpoints={gridBreakpoints}
                    ref={ref}
                  />
                ) : (
                  <ListingGrid
                    listings={listings}
                    loading={isAwaitingData({ isFetching, currentData })}
                    error={!!error}
                    onRetry={refetch}
                    gridBreakpoints={gridBreakpoints}
                    ref={ref}
                  />
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider light />
              </Grid>

              <Grid item xs={12}>
                <NumberedPagination
                  count={total}
                  page={currentPage - 1} // Convert 1-based to 0-based
                  rowsPerPage={currentPageSize}
                  onPageChange={handleChangePage}
                  rowsPerPageOptions={CARD_GRID_PAGE_SIZE_OPTIONS}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  link={{ path: pathname, searchParams }}
                />
              </Grid>
            </Grid>
          ) : (
            <Stack
              direction="row"
              justifyContent="center"
              spacing={theme.layoutSpacing.layout}
              sx={{ width: "100%", maxWidth: "xxxl" }}
            >
              {/* Desktop: Persistent sidebar */}
              <Paper sx={MARKET_FILTER_PANEL_SX}>
                <MarketSearchAreaV2 />
              </Paper>

              {/* Main content area – minWidth: 0 so flex child can shrink and grid gets full width */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    mb: 1.5,
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <UnifiedSearchBar
                      tokens={marketSearchTokens}
                      onChange={handleMarketTokensChange}
                      mode="market"
                      placeholder={t("marketV2.searchItemsSellers")}
                    />
                  </Box>
                  <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={12} sx={{ px: 0 }}>
                    {viewMode === "list" ? (
                      <ListingTableV2 listings={listings} />
                    ) : flags.market_v2_redesign ? (
                      <GroupedListingGrid
                        listings={listings}
                        loading={isAwaitingData({ isFetching, currentData })}
                        error={!!error}
                        onRetry={refetch}
                        gridBreakpoints={gridBreakpoints}
                        ref={ref}
                      />
                    ) : (
                      <ListingGrid
                        listings={listings}
                        loading={isAwaitingData({ isFetching, currentData })}
                        error={!!error}
                        onRetry={refetch}
                        gridBreakpoints={gridBreakpoints}
                        ref={ref}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Divider light />
                  </Grid>

                  <Grid item xs={12}>
                    <NumberedPagination
                      count={total}
                      page={currentPage - 1} // Convert 1-based to 0-based
                      rowsPerPage={currentPageSize}
                      onPageChange={handleChangePage}
                      rowsPerPageOptions={CARD_GRID_PAGE_SIZE_OPTIONS}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      link={{ path: pathname, searchParams }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </>
  )
}

/**
 * ListingGrid - Grid display for V2 listings with loading and empty states
 */
export interface ListingGridProps {
  listings: ListingSearchResult[]
  loading: boolean
  error: boolean
  onRetry: () => void
  gridBreakpoints: Record<string, number>
}

type ListingOrAd = WithAds<ListingSearchResult>

const ListingGridInner = React.forwardRef<HTMLDivElement, ListingGridProps>(
  ({ listings, loading, error, onRetry, gridBreakpoints }, ref) => {
    const listingsWithAds = useMemo(
      (): ListingOrAd[] => insertAds(listings, (listing) => listing.listing_id),
      [listings],
    )

    // Only the first screen of cards in the commit that shows the results;
    // the rest right after (components/grid/firstScreen.tsx).
    const firstScreen = firstScreenCards(
      gridBreakpoints,
      LISTING_CARD_ROW_HEIGHT,
    )
    const rendered = useFirstScreenRender(
      listingsWithAds.length,
      firstScreen.count,
    )

    if (loading) {
      return (
        <Grid container spacing={1}>
          {new Array(LISTING_GRID_SKELETON_COUNT)
            .fill(undefined)
            .map((_, i) => (
              <Grid item {...gridBreakpoints} key={i}>
                <ListingSkeleton />
              </Grid>
            ))}
        </Grid>
      )
    }

    if (listings.length === 0) {
      return (
        <Grid item xs={12}>
          <EmptyListings
            isSearchResult={true}
            isError={error}
            onRetry={onRetry}
            showCreateAction={false}
          />
        </Grid>
      )
    }

    return (
      <>
        <div ref={ref} style={{ position: "absolute", top: 0 }} />
        <Grid container spacing={1}>
          {listingsWithAds.map((item, index) => (
            <Grid
              item
              {...gridBreakpoints}
              key={"_isAd" in item ? `ad-${index}` : item.listing_id}
            >
              {index >= rendered ? (
                <CardStub
                  height={LISTING_CARD_HEIGHT}
                  {...("_isAd" in item
                    ? {}
                    : { to: formatMarketUrl(item), label: item.title })}
                />
              ) : "_isAd" in item ? (
                <AdCard ad={item.ad} index={index} />
              ) : (
                <ListingCardV2
                  listing={item}
                  index={index}
                  priority={index < firstScreen.priorityCount}
                />
              )}
            </Grid>
          ))}
        </Grid>
      </>
    )
  },
)

// memo: the grid's props are stable across unrelated parent re-renders (e.g.
// the nav drawer opening re-renders this page through DrawerOpenContext), so it
// skips re-rendering every card on those.
const ListingGrid = React.memo(ListingGridInner)

ListingGridInner.displayName = "ListingGrid"
