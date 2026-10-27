import React, { useMemo, useState, useCallback, useRef } from "react"
import { Box, Container, Divider, Grid, Paper, Stack } from "@mui/material"
import { useBreakpointDown } from "../../../hooks/layout/useBreakpoint"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { useSearchBuyOrdersQuery } from "../../../store/api/v2/market"
import {
  BuyOrderAggregateCard,
  groupBuyOrdersByItem,
} from "./BuyOrderAggregateCard"
import { useMarketSidebarExp } from "../hooks/MarketSidebar"
import { HideOnScroll, MarketNavArea } from "../components/MarketNavArea"
import { MarketSearchAreaV2, MarketSidebarV2 } from "./ListingSearchV2"
import { buyOrderSortArgs } from "./buyOrderSort"
import { ListingPagination } from "../components/listings/ListingPagination"
import { ListingSkeleton } from "../../../components/skeletons"
import {
  LISTING_GRID_SKELETON_COUNT,
  buyOrderGridBreakpoints,
} from "./marketSearchLayout"
import { MARKET_FILTER_PANEL_SX } from "../../../components/layout/MarketPageLayout"
import { EmptyListings } from "../../../components/empty-states/EmptyListings"
import { useViewMode, ViewModeToggle } from "../../../hooks/market/useViewMode"
import { BuyOrdersTableV2 } from "./components/BuyOrdersTableV2"
import { UnifiedSearchBar, marketParamsToTokens, marketTokensToParams, type SearchToken } from "../../../components/game-data/UnifiedSearchBar"
import { MARKET_PATHS } from "../../../routes/paths"
import { isAwaitingData } from "../../../util/queryLoading"
import { usePageReady } from "../../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../../components/metadata/pageReadyStore"

/**
 * BuyOrdersViewV2 — V2 buy orders browse page.
 *
 * Matches V1 layout: sidebar + card grid of game items with active buy orders.
 * Desktop: sticky sidebar on left, card grid on right.
 * Mobile: bottom sheet sidebar, nav area above cards.
 */
export function BuyOrdersViewV2() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const marketSidebarOpen = useMarketSidebarExp()
  const [viewMode, setViewMode] = useViewMode()
  const showMobileSidebar = useBreakpointDown("lg")

  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(48)
  const ref = useRef<HTMLDivElement>(null)

  const searchText = searchParams.get("text") || searchParams.get("query") || undefined
  const marketSearchTokens = useMemo(() => marketParamsToTokens(searchParams), [searchParams])

  const handleMarketTokensChange = useCallback((tokens: SearchToken[]) => {
    const params = marketTokensToParams(tokens)
    setSearchParams(params)
    setPage(0)
  }, [setSearchParams])

  const { data, isFetching, currentData, isLoading: pageIsLoading } = useSearchBuyOrdersQuery({
    page: page + 1,
    pageSize: perPage,
    text: searchText,
    ...buyOrderSortArgs(searchParams),
  })
  // Primary content: drives main[data-ready].
  usePageReady(
    isPrimaryLoading({ isLoading: pageIsLoading, isFetching, currentData }),
  )

  const aggregates = useMemo(
    () => (data?.buy_orders ? groupBuyOrdersByItem(data.buy_orders) : []),
    [data],
  )

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage)
    ref.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [])

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  const gridBreakpoints = buyOrderGridBreakpoints(marketSidebarOpen)

  const loading = isAwaitingData({ isFetching, currentData })

  const cardGrid = (
    <>
      <div ref={ref} style={{ position: "absolute", top: 0 }} />
      <Grid container spacing={1}>
        {loading
          ? new Array(Math.min(perPage, LISTING_GRID_SKELETON_COUNT))
              .fill(undefined)
              .map((_, i) => (
                <Grid item {...gridBreakpoints} key={i}>
                  <ListingSkeleton index={i} />
                </Grid>
              ))
          : aggregates.length === 0
            ? (
              <Grid item xs={12}>
                <EmptyListings
                  isSearchResult={false}
                  showCreateAction={false}
                  action={{
                    label: t("buyOrderActions.createBuyOrder", "Create Buy Order"),
                    onClick: () => navigate(MARKET_PATHS.buyOrderCreate),
                    variant: "contained" as const,
                  }}
                />
              </Grid>
            )
            : viewMode === "list"
              ? (
                <Grid item xs={12}>
                  <BuyOrdersTableV2 aggregates={aggregates} />
                </Grid>
              )
              : aggregates.map((agg, index) => (
              <Grid item {...gridBreakpoints} key={agg.item_id}>
                <BuyOrderAggregateCard aggregate={agg} index={index} />
              </Grid>
            ))}
      </Grid>
      <Divider light sx={{ my: 1 }} />
      <ListingPagination
        count={data?.total || aggregates.length}
        page={page}
        rowsPerPage={perPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  )

  return (
    <>
      {showMobileSidebar && <MarketSidebarV2 />}

      <Container maxWidth={"xxxl"} sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {showMobileSidebar ? (
            <Grid container spacing={theme.layoutSpacing.layout}>
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
                      placeholder="Search buy orders..."
                    />
                  </Box>
                  <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                </Box>
              </Grid>
              <Grid item xs={12}>
                {cardGrid}
              </Grid>
            </Grid>
          ) : (
            <Stack
              direction="row"
              justifyContent="center"
              spacing={theme.layoutSpacing.layout}
              sx={{ width: "100%", maxWidth: "xxxl" }}
            >
              <Paper sx={MARKET_FILTER_PANEL_SX}>
                <MarketSearchAreaV2 />
              </Paper>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ mb: 1.5, display: "flex", gap: 1, alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <UnifiedSearchBar
                      tokens={marketSearchTokens}
                      onChange={handleMarketTokensChange}
                      mode="market"
                      placeholder="Search buy orders..."
                    />
                  </Box>
                  <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                </Box>
                {cardGrid}
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </>
  )
}
