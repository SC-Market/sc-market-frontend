import { useMemo, useState, useCallback, useRef } from "react"
import {
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
} from "@mui/material"
import { useBreakpointDown } from "../../../../hooks/layout/useBreakpoint"
import AddRounded from "@mui/icons-material/AddRounded"
import { useSearchParams } from "react-router-dom"
import { Helmet } from "@unhead/react/helmet"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useSearchBuyOrdersQuery } from "../../../../store/api/v2/market"
import type { StandingBuyOrder } from "../../../../store/api/v2/market"
import { useDrawerOpen } from "../../../../hooks/layout/Drawer"
import { HideOnScroll, MarketNavArea } from "../../components/MarketNavArea"
import { MarketSearchAreaV2, MarketSidebarV2 } from "../MarketSearchAreaV2"
import { buyOrderSortArgs } from "../buyOrderSort"
import {
  CARD_GRID_PAGE_SIZE_OPTIONS,
  NumberedPagination,
} from "../../../../components/pagination/NumberedPagination"
import { ListingSkeleton } from "../../../../components/skeletons"
import { EmptyListings } from "../../../../components/empty-states/EmptyListings"
import {
  useViewMode,
  ViewModeToggle,
} from "../../../../hooks/market/useViewMode"
import { BuyOrdersTableV2 } from "../components/BuyOrdersTableV2"
import {
  UnifiedSearchBar,
  marketParamsToTokens,
  marketTokensToParams,
  type SearchToken,
} from "../../../../components/game-data/UnifiedSearchBar"
import { isAwaitingData } from "../../../../util/queryLoading"
import { usePageReady } from "../../../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../../../components/metadata/pageReadyStore"
import { CreateBuyOrderForm } from "./CreateBuyOrderForm"
import { BuyOrderCard } from "./BuyOrderCard"

/**
 * BuyOrdersRedesign — Phase 0 of the Market redesign (behind the
 * `market_v2_redesign` feature flag). It is a page-in-page that mirrors
 * BuyOrdersViewV2's shell exactly (sidebar + market nav + unified search +
 * view-mode toggle + paginated card grid) so it is visually identical to the
 * rest of the market, and adds the genuinely-new redesign feature: an inline
 * "Create buy order" form (posts through useCreateBuyOrder).
 *
 * Reads are wired to the real `useSearchBuyOrdersQuery` with URL-param search
 * state (text/page/pageSize/sort), matching BuyOrdersViewV2's arg mapping. Active
 * buy orders only. The Phase-0 "Fulfil from stock" button stays visual-only.
 */
export function BuyOrdersRedesign() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useViewMode()
  const showMobileSidebar = useBreakpointDown("lg")
  const [drawerOpen] = useDrawerOpen()

  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(48)
  const [showForm, setShowForm] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const searchText =
    searchParams.get("text") || searchParams.get("query") || undefined
  const marketSearchTokens = useMemo(
    () => marketParamsToTokens(searchParams),
    [searchParams],
  )

  const handleMarketTokensChange = useCallback(
    (tokens: SearchToken[]) => {
      const params = marketTokensToParams(tokens)
      setSearchParams(params)
      setPage(0)
    },
    [setSearchParams],
  )

  const { data, isLoading, isFetching, currentData } = useSearchBuyOrdersQuery({
    page: page + 1,
    pageSize: perPage,
    text: searchText,
    ...buyOrderSortArgs(searchParams),
  })
  // Primary content: drives main[data-ready].
  usePageReady(isPrimaryLoading({ isLoading, isFetching, currentData }))

  // Active buy orders only (preserved redesign behavior).
  const activeOrders = useMemo(
    () => (data?.buy_orders ?? []).filter((o) => o.status === "active"),
    [data],
  )

  // Grouped by game item for the list/table view (matches BuyOrdersViewV2).
  const aggregates = useMemo(() => {
    const grouped = new Map<
      string,
      { item_id: string; item_name: string; orders: StandingBuyOrder[] }
    >()
    for (const bo of activeOrders) {
      const existing = grouped.get(bo.game_item_id)
      if (existing) {
        existing.orders.push(bo)
      } else {
        grouped.set(bo.game_item_id, {
          item_id: bo.game_item_id,
          item_name: bo.game_item_name,
          orders: [bo],
        })
      }
    }
    return Array.from(grouped.values())
  }, [activeOrders])

  const handleChangePage = useCallback((newPage: number) => {
    setPage(newPage)
    ref.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [])

  const handleChangeRowsPerPage = useCallback((rowsPerPage: number) => {
    setPerPage(rowsPerPage)
    setPage(0)
  }, [])

  // Match ListingSearchV2's breakpoints EXACTLY so buy-order cards are the same
  // size as main-search cards (same per-row count at each width).
  const gridBreakpoints = useMemo(() => {
    const sidebarInLayout = !showMobileSidebar
    const base = { xs: 6, sm: 4, md: 4, lg: 3, xl: 2.4, xxl: 2, xxxl: 12 / 8 }
    if (!sidebarInLayout || drawerOpen) return base
    return { xs: 6, sm: 4, md: 4, lg: 2.4, xl: 2, xxl: 12 / 7, xxxl: 12 / 8 }
  }, [showMobileSidebar, drawerOpen])

  const loading = isAwaitingData({ isFetching, currentData })

  const cardGrid = (
    <>
      <div ref={ref} style={{ position: "absolute", top: 0 }} />
      <Grid container spacing={1}>
        {loading ? (
          new Array(Math.min(perPage, 12)).fill(undefined).map((_, i) => (
            <Grid item {...gridBreakpoints} key={i}>
              <ListingSkeleton />
            </Grid>
          ))
        ) : activeOrders.length === 0 ? (
          <Grid item xs={12}>
            <EmptyListings
              isSearchResult={false}
              showCreateAction={false}
              action={{
                label: t("buyOrderActions.createBuyOrder", "Create Buy Order"),
                onClick: () => setShowForm(true),
                variant: "contained" as const,
              }}
            />
          </Grid>
        ) : viewMode === "list" ? (
          <Grid item xs={12}>
            <BuyOrdersTableV2 aggregates={aggregates} />
          </Grid>
        ) : (
          activeOrders.map((order, index) => (
            <Grid item {...gridBreakpoints} key={order.buy_order_id}>
              <BuyOrderCard order={order} index={index} />
            </Grid>
          ))
        )}
      </Grid>
      <Divider light sx={{ my: 1 }} />
      <NumberedPagination
        count={data?.total || activeOrders.length}
        page={page}
        rowsPerPage={perPage}
        onPageChange={handleChangePage}
        rowsPerPageOptions={CARD_GRID_PAGE_SIZE_OPTIONS}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  )

  const createButton = (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddRounded />}
      onClick={() => setShowForm((s) => !s)}
      sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
    >
      {t("BuyOrdersRedesign.createBuyOrder", "Create buy order")}
    </Button>
  )

  const createForm = (
    <Collapse in={showForm} unmountOnExit>
      <Box sx={{ mb: 1.5 }}>
        <CreateBuyOrderForm onDone={() => setShowForm(false)} />
      </Box>
    </Collapse>
  )

  const searchRow = (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <UnifiedSearchBar
          tokens={marketSearchTokens}
          onChange={handleMarketTokensChange}
          mode="market"
          placeholder={t("marketV2.searchBuyOrders")}
        />
      </Box>
      <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      {createButton}
    </Box>
  )

  return (
    <>
      <Helmet>
        <title>
          {t("BuyOrdersRedesign.title", "Buy Orders")}
          {data?.total ? ` (${data.total})` : ""}
        </title>
      </Helmet>

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
                {searchRow}
              </Grid>
              <Grid item xs={12}>
                {createForm}
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
              <Paper
                sx={{
                  position: "sticky",
                  top: "calc(64px + 16px)",
                  maxHeight: "calc(100vh - 64px - 32px)",
                  height: "fit-content",
                  width: 300,
                  flexShrink: 0,
                  overflowY: "auto",
                }}
              >
                <MarketSearchAreaV2 />
              </Paper>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ mb: 1.5 }}>{searchRow}</Box>
                {createForm}
                {cardGrid}
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </>
  )
}
