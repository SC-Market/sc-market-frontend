import React, { useMemo, useState, useCallback, useRef } from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Fade,
  Grid,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme, cardFadeGradient } from "../../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import {
  useSearchBuyOrdersQuery,
  type StandingBuyOrder,
} from "../../../store/api/v2/market"
import { useMarketSidebarExp } from "../hooks/MarketSidebar"
import { HideOnScroll, MarketNavArea } from "../components/MarketNavArea"
import { MarketSearchAreaV2, MarketSidebarV2 } from "./ListingSearchV2"
import { ListingWrapper } from "../components/listings/ListingWrapper"
import { ListingPagination } from "../components/listings/ListingPagination"
import { ListingSkeleton } from "../../../components/skeletons"
import { EmptyListings } from "../../../components/empty-states/EmptyListings"
import { FALLBACK_IMAGE_URL } from "../../../util/constants"
import { useViewMode, ViewModeToggle } from "../../../hooks/market/useViewMode"
import { BuyOrdersTableV2 } from "./components/BuyOrdersTableV2"
import { UnifiedSearchBar, marketParamsToTokens, marketTokensToParams, type SearchToken } from "../../../components/game-data/UnifiedSearchBar"
import { MARKET_PATHS } from "../../../routes/paths"

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
  const showMobileSidebar = useMediaQuery(theme.breakpoints.down("lg"))

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

  const { data, isLoading, isFetching } = useSearchBuyOrdersQuery({
    page: page + 1,
    pageSize: perPage,
    text: searchText,
  })

  const aggregates = useMemo(() => {
    if (!data?.buy_orders) return []
    const grouped = new Map<
      string,
      { item_id: string; item_name: string; orders: StandingBuyOrder[] }
    >()
    for (const bo of data.buy_orders) {
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
  }, [data])

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

  const gridBreakpoints = useMemo(() => {
    if (marketSidebarOpen) return { xs: 6, sm: 4, md: 4, lg: 3, xl: 2.4, xxl: 2, xxxl: 12 / 8 }
    return { xs: 6, sm: 4, md: 4, lg: 2.4, xl: 2, xxl: 12 / 7, xxxl: 12 / 8 }
  }, [marketSidebarOpen])

  const loading = isLoading || isFetching

  const cardGrid = (
    <>
      <div ref={ref} style={{ position: "absolute", top: 0 }} />
      <Grid container spacing={1}>
        {loading
          ? new Array(Math.min(perPage, 12))
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

/** Card for a game item with active buy orders */
function BuyOrderAggregateCard({
  aggregate,
  index,
}: {
  aggregate: { item_id: string; item_name: string; orders: StandingBuyOrder[] }
  index: number
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t, i18n } = useTranslation()

  const maxPrice = useMemo(
    () => aggregate.orders.reduce((max, o) => Math.max(max, o.price_per_unit || 0), 0),
    [aggregate.orders],
  )
  const minPrice = useMemo(
    () => aggregate.orders.reduce((min, o) => Math.min(min, o.price_per_unit || Infinity), Infinity),
    [aggregate.orders],
  )
  const totalQty = useMemo(
    () => aggregate.orders.reduce((sum, o) => sum + (o.quantity - (o.quantity_fulfilled || 0)), 0),
    [aggregate.orders],
  )
  const imageUrl = useMemo(
    () => aggregate.orders.find(o => o.photos && o.photos.length > 0)?.photos?.[0]?.url || FALLBACK_IMAGE_URL,
    [aggregate.orders],
  )

  const priceDisplay = minPrice === maxPrice
    ? `${maxPrice.toLocaleString(i18n.language)} aUEC`
    : `${minPrice.toLocaleString(i18n.language)} – ${maxPrice.toLocaleString(i18n.language)} aUEC`

  const isDark = theme.palette.mode === "dark"

  return (
    <ListingWrapper useFixedWidth={false}>
      <Fade in timeout={500} style={{ transitionDelay: `${50 + 50 * index}ms` }}>
        <Link to={MARKET_PATHS.aggregate(aggregate.item_id)} style={{ textDecoration: "none", color: "inherit" }}>
          <CardActionArea sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}>
            <Card sx={{ height: 300, position: "relative" }}>
              <CardMedia
                component="img"
                loading="lazy"
                image={imageUrl}
                sx={{
                  width: "100%",
                  objectFit: "cover",
                  ...(isDark
                    ? { height: "100%", aspectRatio: "16/9" }
                    : { height: 180, aspectRatio: "16/9" }),
                  overflow: "hidden",
                }}
                onError={({ currentTarget }) => { currentTarget.onerror = null; currentTarget.src = FALLBACK_IMAGE_URL }}
                alt={`Image of ${aggregate.item_name}`}
              />
              <Box
                sx={{
                  ...(theme.palette.mode === "light" ? { display: "none" } : {}),
                  position: "absolute",
                  zIndex: 3,
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: "100%",
                  borderRadius: theme.spacing(theme.borderRadius.topLevel),
                  background: cardFadeGradient(theme, 50, 60),
                }}
              />
              <CardContent
                sx={{
                  ...(isDark
                    ? { position: "absolute", bottom: 0, zIndex: 4 }
                    : {}),
                  maxWidth: "100%",
                  padding: "8px 12px !important",
                }}
              >
                <Typography
                  variant="h6"
                  color="primary"
                  fontWeight="bold"
                  noWrap
                  sx={{ fontSize: "0.95rem", mb: 0.5 }}
                >
                  {priceDisplay}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: "0.75rem",
                    lineHeight: 1.3,
                    maxHeight: 36,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    mb: 0.5,
                  }}
                >
                  {aggregate.item_name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.7rem", lineHeight: 1 }}
                >
                  {totalQty.toLocaleString(i18n.language)} {t("market.requested", "requested")}
                  {" · "}{aggregate.orders.length} {t("market.buyOrders", "buy orders")}
                </Typography>
              </CardContent>
            </Card>
          </CardActionArea>
        </Link>
      </Fade>
    </ListingWrapper>
  )
}
