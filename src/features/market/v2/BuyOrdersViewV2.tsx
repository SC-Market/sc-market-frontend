import React, { useMemo, useState, useCallback, useRef, useEffect } from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Divider,
  Fade,
  Grid,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme, cardFadeGradient } from "../../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { useSearchBuyOrdersQuery, StandingBuyOrder } from "../../../store/api/v2/market"
import { useMarketSidebarExp } from "../hooks/MarketSidebar"
import { ListingWrapper } from "../components/listings/ListingCard"
import { ListingPagination } from "../components/listings/ListingPagination"
import { ListingSkeleton } from "../../../components/skeletons"
import { EmptyListings } from "../../../components/empty-states/EmptyListings"
import { FALLBACK_IMAGE_URL } from "../../../util/constants"

/**
 * BuyOrdersViewV2 — V2 buy orders browse page.
 *
 * Matches V1 layout: a card grid of game items that have active buy orders.
 * Each card shows the game item image, name, total quantity requested,
 * price range across all buy orders, and the number of active buy orders.
 *
 * Clicking a card navigates to the aggregate view for that game item.
 */
export function BuyOrdersViewV2() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const marketSidebarOpen = useMarketSidebarExp()

  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(48)
  const ref = useRef<HTMLDivElement>(null)

  const { data, isLoading, isFetching } = useSearchBuyOrdersQuery({
    page: page + 1,
    pageSize: perPage,
  })

  // Group buy orders by game_item_id to create aggregate cards
  const aggregates = useMemo(() => {
    if (!data?.buy_orders) return []
    const grouped = new Map<string, { item_id: string; item_name: string; orders: StandingBuyOrder[] }>()
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

  const handleChangePage = useCallback(
    (_: unknown, newPage: number) => {
      setPage(newPage)
      ref.current?.scrollIntoView({ block: "end", behavior: "smooth" })
    },
    [],
  )

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  // Grid breakpoints matching V1
  const gridBreakpoints = useMemo(() => {
    if (marketSidebarOpen) {
      return { xs: 6, sm: 6, md: 4, lg: 3, xl: 2 }
    }
    return { xs: 6, sm: 4, md: 3, lg: 2, xl: 2 }
  }, [marketSidebarOpen])

  const loading = isLoading || isFetching

  return (
    <Grid container spacing={1} sx={{ width: "100%" }}>
      <div ref={ref} style={{ position: "absolute", top: 0 }} />

      <Grid item xs={12} sx={{ width: "100%", minWidth: 0 }}>
        <Grid container spacing={1} sx={{ width: "100%" }}>
          {loading
            ? new Array(perPage > 12 ? 12 : perPage)
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
      </Grid>

      <Grid item xs={12}>
        <Divider light />
      </Grid>

      <Grid item xs={12}>
        <ListingPagination
          count={data?.total || aggregates.length}
          page={page}
          rowsPerPage={perPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Grid>
    </Grid>
  )
}

/** Card for a game item with active buy orders — matches V1 AggregateBuyOrderListingBase */
function BuyOrderAggregateCard({ aggregate, index }: {
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
      <Fade
        in
        style={{ transitionDelay: `${50 + 50 * index}ms`, transitionDuration: "500ms" }}
      >
        <Link
          to={`/market/aggregate/${aggregate.item_id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <CardActionArea
            sx={{ borderRadius: (t) => t.spacing((t as ExtendedTheme).borderRadius.topLevel) }}
          >
            <Card
              sx={{
                borderRadius: (t) => t.spacing((t as ExtendedTheme).borderRadius.topLevel),
                height: cardHeight,
                position: "relative",
              }}
            >
              <CardMedia
                component="img"
                loading="lazy"
                image={FALLBACK_IMAGE_URL}
                sx={{
                  width: "100%",
                  objectFit: "cover",
                  height: isDark ? "100%" : 150,
                }}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null
                  currentTarget.src = FALLBACK_IMAGE_URL
                }}
              />
              {isDark && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "100%",
                    background: cardFadeGradient(theme),
                    zIndex: 3,
                  }}
                />
              )}
              <CardContent sx={contentSx}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {aggregate.item_name}
                </Typography>
                <Typography variant="body2" color="primary">
                  {priceDisplay}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {totalQty.toLocaleString(i18n.language)} {t("market.requested", "requested")}
                  {" · "}
                  {aggregate.orders.length} {t("market.buyOrders", "buy orders")}
                </Typography>
              </CardContent>
            </Card>
          </CardActionArea>
        </Link>
      </Fade>
    </ListingWrapper>
  )
}

// Keep the old exports for backward compatibility with tests/other imports
export type BuyOrderV2Row = StandingBuyOrder & { timestamp: number }
export const BuyOrderV2HeadCells = [] as const
