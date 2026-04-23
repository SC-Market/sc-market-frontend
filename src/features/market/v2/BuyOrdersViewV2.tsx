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
import { Link, useNavigate } from "react-router-dom"
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
import { ListingWrapper } from "../components/listings/ListingCard"
import { ListingPagination } from "../components/listings/ListingPagination"
import { ListingSkeleton } from "../../../components/skeletons"
import { EmptyListings } from "../../../components/empty-states/EmptyListings"
import { FALLBACK_IMAGE_URL } from "../../../util/constants"

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
  const showMobileSidebar = useMediaQuery(theme.breakpoints.down("lg"))

  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(48)
  const ref = useRef<HTMLDivElement>(null)

  const { data, isLoading, isFetching } = useSearchBuyOrdersQuery({
    page: page + 1,
    pageSize: perPage,
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
    if (marketSidebarOpen) return { xs: 6, sm: 6, md: 4, lg: 3, xl: 2 }
    return { xs: 6, sm: 4, md: 3, lg: 2, xl: 2 }
  }, [marketSidebarOpen])

  const loading = isLoading || isFetching

  const cardGrid = (
    <>
      <div ref={ref} style={{ position: "absolute", top: 0 }} />
      <Grid container spacing={1} sx={{ width: "100%" }}>
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
                    onClick: () => navigate("/buyorder/create"),
                    variant: "contained" as const,
                  }}
                />
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
    () => aggregate.orders.reduce((sum, o) => sum + o.quantity, 0),
    [aggregate.orders],
  )

  const priceDisplay = minPrice === maxPrice
    ? `${maxPrice.toLocaleString(i18n.language)} aUEC`
    : `${minPrice.toLocaleString(i18n.language)} - ${maxPrice.toLocaleString(i18n.language)} aUEC`

  const cardHeight = 300
  const isDark = theme.palette.mode === "dark"
  const contentSx = isDark
    ? { position: "absolute" as const, bottom: 0, zIndex: 4, width: "100%" }
    : {}

  return (
    <ListingWrapper>
      <Fade in style={{ transitionDelay: `${50 + 50 * index}ms`, transitionDuration: "500ms" }}>
        <Link to={`/market/aggregate/${aggregate.item_id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <CardActionArea sx={{ borderRadius: (t) => t.spacing((t as ExtendedTheme).borderRadius.topLevel) }}>
            <Card sx={{ borderRadius: (t) => t.spacing((t as ExtendedTheme).borderRadius.topLevel), height: cardHeight, position: "relative" }}>
              <CardMedia
                component="img"
                loading="lazy"
                image={FALLBACK_IMAGE_URL}
                sx={{ width: "100%", objectFit: "cover", height: isDark ? "100%" : 150 }}
                onError={({ currentTarget }) => { currentTarget.onerror = null; currentTarget.src = FALLBACK_IMAGE_URL }}
              />
              {isDark && (
                <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "100%", background: cardFadeGradient(theme), zIndex: 3 }} />
              )}
              <CardContent sx={contentSx}>
                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {aggregate.item_name}
                </Typography>
                <Typography variant="body2" color="primary">
                  {priceDisplay}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
