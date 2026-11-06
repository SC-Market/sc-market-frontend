import React, { MouseEventHandler, useCallback, useMemo, useState } from "react"
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  Stack,
  TableCell,
  tableCellClasses,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { AddShoppingCartRounded, VisibilityRounded } from "@mui/icons-material"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useCookies } from "react-cookie"
import { FRONTEND_URL } from "../../../util/constants"
import { Cart } from "../../../datatypes/Cart"
import { Link, useNavigate, useParams } from "react-router-dom"
import { MARKET_PATHS, PATHS } from "../../../routes/paths"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { MarketAggregateContentSkeleton } from "../../../components/skeletons/MarketListingDetailSkeleton"
import { ListingNameAndRating } from "../../../components/rating/ListingRating"
import { SeoHead } from "../../../seo/SeoHead"
import { buildAggregateHead } from "../../../seo/entityHeads"
import { headDescription } from "../../../seo/pageHead"
import { Section } from "../../../components/paper/Section"
import { MuiAreaChart, MuiBarChart } from "../../../components/charts/MuiCharts"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { FulfillBuyOrderDialog } from "./components/FulfillBuyOrderDialog"
import { MarketAggregateViewV2Admin } from "./MarketAggregateViewV2Admin"
import {
  useGetListingsQuery,
  useGetQualityDistributionQuery,
  useGetPriceHistoryQuery,
  useSearchBuyOrdersQuery,
  type StandingBuyOrder,
} from "../../../store/api/v2/market"
import { remainingQuantity } from "../domain/buyOrders"
import { useFormatters } from "../../../util/format"
import { useCancelBuyOrder } from "../hooks/useBuyOrderActions"

/**
 * MarketAggregateViewV2 Component
 *
 * Task: 11.5 Implement MarketAggregateViewV2 component
 * Requirements: 41.1-41.12
 *
 * Displays aggregate view of all listings for a game item with quality tier breakdown.
 * Maintains visual parity with V1 MarketAggregateView while adding V2-specific features:
 * - Quality distribution chart
 * - Price comparison table by quality tier
 * - Quality tier filter
 * - Seller ratings and badges
 * - Add to Cart for each listing with variant selection
 *
 * Visual Parity Requirements:
 * - Reuse image paper styling (minHeight: 400, borderRadius)
 * - Reuse Card layout for item details
 * - Reuse PaginatedTable for listings
 * - Reuse HeaderTitle for sections
 * - Reuse Section for charts
 * - Maintain identical typography and spacing
 *
 * V2 Enhancements:
 * - Display quality distribution histogram
 * - Show price ranges by quality tier
 * - Filter listings by quality tier
 * - Display variant information in listings
 * - Support variant selection in Add to Cart
 */

// Localized headCells for sell orders table

// Localized headCells for buy orders table

/** Row shape for aggregate listings table */
export interface AggregateListingV2Row {
  listing_id: string
  shop_id: string
  shop_slug: string
  shop_name: string
  shop_rating: number
  price_min: number
  price_max: number
  quantity_available: number
  quality_tier_min: number | null
  quality_tier_max: number | null
  variant_count: number
}

/** Row shape for buy orders table */
/** Buy order row type — uses generated StandingBuyOrder + computed total */
type BuyOrderV2Row = StandingBuyOrder & { total?: number | null }

/** Game item aggregate data */
export interface GameItemAggregateV2 {
  game_item: {
    id: string
    name: string
    type: string
    description: string
    image_url: string
  }
  quality_distribution: Array<{
    quality_tier: number
    listing_count: number
    total_quantity: number
    min_price: number
    avg_price: number
    max_price: number
    shop_count: number
  }>
  listings: AggregateListingV2Row[]
  buy_orders: BuyOrderV2Row[]
  price_history: Array<{
    timestamp: string
    quality_tier: number | null
    avg_price: number
    min_price: number
    max_price: number
    volume: number
  }>
}

export function MarketAggregateViewV2() {
  const { t } = useTranslation()
  const { id: gameItemId } = useParams<{ id: string }>()

  const {
    data: listingsData,
    isLoading: listingsLoading,
    error: listingsError,
  } = useGetListingsQuery({ id: gameItemId! }, { skip: !gameItemId })
  const { data: qualityData } = useGetQualityDistributionQuery(
    { gameItemId: gameItemId! },
    { skip: !gameItemId },
  )
  const { data: priceData } = useGetPriceHistoryQuery(
    { gameItemId: gameItemId! },
    { skip: !gameItemId },
  )
  const { data: buyOrdersData } = useSearchBuyOrdersQuery(
    { gameItemId: gameItemId! },
    { skip: !gameItemId },
  )

  const isLoading = listingsLoading
  const error = listingsError

  const complete: GameItemAggregateV2 = useMemo(
    () => ({
      game_item: listingsData?.game_item
        ? {
            ...listingsData.game_item,
            description: "",
            image_url: listingsData.game_item.image_url || "",
          }
        : {
            id: gameItemId || "",
            name: "",
            type: "",
            description: "",
            image_url: "",
          },
      quality_distribution: (qualityData?.distribution || []).map((d) => ({
        quality_tier: d.quality_tier,
        listing_count: d.listing_count,
        total_quantity: d.quantity_available,
        min_price: d.min_price,
        avg_price: d.avg_price,
        max_price: d.max_price,
        shop_count: d.shop_count,
      })),
      listings: (listingsData?.listings || []).map(
        (l): AggregateListingV2Row => ({
          listing_id: l.listing_id,
          shop_id: l.shop_id,
          shop_slug: l.shop_slug,
          shop_name: l.shop_name,
          shop_rating: l.shop_rating,
          price_min: l.price,
          price_max: l.price,
          quantity_available: l.quantity_available,
          quality_tier_min: l.quality_tier ?? null,
          quality_tier_max: l.quality_tier ?? null,
          variant_count: 1,
        }),
      ),
      buy_orders: buyOrdersData?.buy_orders || [],
      price_history: (priceData?.data || []).map((p) => ({
        timestamp: p.timestamp,
        quality_tier: p.quality_tier ?? null,
        avg_price: p.avg_price,
        min_price: p.min_price,
        max_price: p.max_price,
        volume: p.volume,
      })),
    }),
    [listingsData, qualityData, priceData, buyOrdersData, gameItemId],
  )

  const { game_item } = complete
  // The bridge's head (title, description): the layout uses the same, so
  // the page doesn't change them after hydrating.
  const head = game_item.name
    ? buildAggregateHead(game_item, complete.listings.length, FRONTEND_URL)
    : null

  return (
    <StandardPageLayout
      title={head?.title ?? t("marketV2.marketItem")}
      description={head ? headDescription(head) : undefined}
      headerTitle={game_item.name}
      breadcrumbs={[
        {
          label: t("sidebar.market_short", "Market"),
          href: MARKET_PATHS.search,
        },
        ...(game_item.type && game_item.type !== "Other"
          ? [
              {
                label: game_item.type,
                href: `/market?type=${encodeURIComponent(game_item.type)}`,
              },
            ]
          : []),
        { label: game_item.name || "Item" },
      ]}
      isLoading={isLoading}
      skeleton={<MarketAggregateContentSkeleton />}
      error={error}
      sidebarOpen={true}
      maxWidth="xl"
    >
      {head && <SeoHead head={head} />}
      <MarketAggregateViewV2Admin
        complete={complete}
        gameItemId={gameItemId!}
      />
    </StandardPageLayout>
  )
}

/**
 * PriceComparisonTable - Shows price ranges by quality tier
 *
 * Requirements: 41.5
 */
export function PriceComparisonTable({
  distribution,
}: {
  distribution: Array<{
    quality_tier: number
    listing_count: number
    total_quantity: number
    min_price: number
    avg_price: number
    max_price: number
    shop_count: number
  }>
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  if (distribution.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        {t("market.noPriceData", "No price data available")}
      </Typography>
    )
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.qualityTier", "Quality Tier")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.sellers", "Sellers")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.minPrice", "Min Price")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.avgPrice", "Avg Price")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.maxPrice", "Max Price")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.totalQuantity", "Total Qty")}
              </Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          {distribution.map((item) => (
            <tr key={item.quality_tier}>
              <td style={{ padding: theme.spacing(1) }}>
                <QualityBadge tier={item.quality_tier} size="small" />
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">{item.shop_count}</Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2" color="primary">
                  {fmt.number(item.min_price)} aUEC
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">
                  {fmt.number(item.avg_price)} aUEC
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">
                  {fmt.number(item.max_price)} aUEC
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">
                  {fmt.number(item.total_quantity)}
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  )
}

/**
 * AggregateRowV2 - Individual listing row with variant selection
 *
 * Requirements: 41.6, 41.7, 41.9, 41.10
 */
export function AggregateRowV2(props: {
  row: AggregateListingV2Row & { rating: number }
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const { row: listing, index } = props
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId] = useState<string | null>(null)
  const issueAlert = useAlertHook()
  const [cookies, setCookie] = useCookies(["market_cart"])
  const [justAddedToCart, setJustAddedToCart] = useState(false)

  const addToCart = useCallback(async () => {
    if (listing.variant_count > 1 && !selectedVariantId) {
      issueAlert({
        message: t("market.selectVariant", "Please select a variant"),
        severity: "warning",
      })
      return
    }

    const cart: Cart = cookies.market_cart || []
    let found = false

    for (const seller of cart) {
      if (seller.shop_id && seller.shop_id === listing.shop_id) {
        seller.items.push({
          listing_id: listing.listing_id,
          aggregate_id: listing.listing_id, // TODO: Get actual aggregate_id
          quantity,
          type: "aggregate_composite",
          variant_id: selectedVariantId || undefined,
        })
        found = true
        break
      }
    }

    if (!found) {
      cart.push({
        shop_id: listing.shop_id,
        items: [
          {
            listing_id: listing.listing_id,
            aggregate_id: listing.listing_id, // TODO: Get actual aggregate_id
            quantity,
            type: "aggregate_composite",
            variant_id: selectedVariantId || undefined,
          },
        ],
      })
    }

    setCookie("market_cart", cart, {
      path: "/",
      sameSite: "strict",
      maxAge: 2592000, // 30 days in seconds
    })
    issueAlert({
      message: t("MarketAggregateView.addedToCart"),
      severity: "success",
    })
    setJustAddedToCart(true)
  }, [
    cookies.market_cart,
    listing,
    quantity,
    selectedVariantId,
    setCookie,
    t,
    issueAlert,
  ])

  return (
    <TableRow
      hover
      role="checkbox"
      tabIndex={-1}
      key={index}
      sx={{
        textDecoration: "none",
        color: "inherit",
        borderBottom: "none",
        border: "none",
        [`& .${tableCellClasses.root}`]: {},
      }}
    >
      {/* Seller Name and Rating */}
      <TableCell align={"left"}>
        <Box
          sx={{
            alignItems: "center",
            display: "inline-flex",
          }}
        >
          <ListingNameAndRating
            shop={{
              name: listing.shop_name,
              slug: listing.shop_slug,
              rating: listing.shop_rating,
            }}
          />
        </Box>
      </TableCell>

      {/* Quality Tier */}
      <TableCell align={"left"}>
        {listing.quality_tier_min && listing.quality_tier_max ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <QualityBadge tier={listing.quality_tier_min} size="small" />
            {listing.quality_tier_min !== listing.quality_tier_max && (
              <>
                <Typography variant="caption">-</Typography>
                <QualityBadge tier={listing.quality_tier_max} size="small" />
              </>
            )}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {t("market.unspecified", "Unspecified")}
          </Typography>
        )}
      </TableCell>

      {/* Price */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <Box>
          <Typography variant={"subtitle2"} color={"primary"}>
            {fmt.number(listing.price_min)} aUEC
          </Typography>
          {listing.price_min !== listing.price_max && (
            <Typography variant="caption" color="text.secondary">
              - {fmt.number(listing.price_max)} aUEC
            </Typography>
          )}
        </Box>
      </TableCell>

      {/* Quantity Input */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <Stack direction="column" spacing={1} alignItems="flex-end">
          {/* Quantity Input */}
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            onValueChange={async (values) => {
              setQuantity(values.floatValue || 0)
              setJustAddedToCart(false)
            }}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  {t("MarketAggregateView.ofAvailable", {
                    count: listing.quantity_available,
                  })}
                </InputAdornment>
              ),
              inputMode: "numeric",
            }}
            size="small"
            label={t("MarketAggregateView.quantityToBuy")}
            value={quantity}
            color={"secondary"}
          />
        </Stack>
      </TableCell>

      {/* Add to Cart Button */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        {justAddedToCart ? (
          <Button
            component={Link}
            to={MARKET_PATHS.cart}
            variant={"contained"}
            color={"secondary"}
            size={"large"}
          >
            <VisibilityRounded />
          </Button>
        ) : (
          <Button
            variant={"contained"}
            color={"primary"}
            size={"large"}
            onClick={addToCart}
            disabled={listing.variant_count > 1 && !selectedVariantId}
            aria-label={t("MarketAggregateView.addToCart")}
          >
            <AddShoppingCartRounded />
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

/**
 * BuyOrderRowV2 - Individual buy order row with quality tier requirements
 *
 * Requirements: 41.6, 41.7, 41.9
 */
export function BuyOrderRowV2(props: {
  row: BuyOrderV2Row & { total: number | null }
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const { row: buy_order, index } = props
  const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false)
  const remaining = remainingQuantity(buy_order)
  const navigate = useNavigate()
  const { data: profile } = useGetUserProfileQuery()
  const isOwnBuyOrder = !!profile && buy_order.buyer_name === profile.username

  const { cancel: cancelBuyOrder, isLoading: cancelIsLoading } =
    useCancelBuyOrder(t("marketV2.cancelFailed"))

  const callback = useCallback(() => {
    if (!profile) {
      navigate(PATHS.login)
      return false
    }
    setFulfillDialogOpen(true)
    return false
  }, [profile, navigate])

  const cancelCallback = useCallback(async () => {
    void cancelBuyOrder(buy_order.buy_order_id)
    return false
  }, [buy_order, cancelBuyOrder])

  // Format price display
  const priceDisplay = useMemo(() => {
    if (buy_order.negotiable) {
      return buy_order.price_per_unit >= 1
        ? t("buyorder.negotiableSuggested", "Negotiable (~{{price}} aUEC)", {
            price: fmt.number(buy_order.price_per_unit),
          })
        : t("buyorder.status.negotiable", "Negotiable")
    }
    return `${fmt.number(buy_order.price_per_unit)} aUEC`
  }, [buy_order, t, fmt])

  return (
    <TableRow
      hover
      role="checkbox"
      tabIndex={-1}
      key={index}
      sx={{
        textDecoration: "none",
        color: "inherit",
        borderBottom: "none",
        border: "none",
        [`& .${tableCellClasses.root}`]: {},
      }}
    >
      {/* Buyer Name and Rating */}
      <TableCell align={"left"}>
        <Box
          sx={{
            alignItems: "center",
            display: "inline-flex",
          }}
        >
          <ListingNameAndRating
            user={{
              username: buy_order.buyer_name,
              display_name: buy_order.buyer_name,
              avatar: "",
              rating: {
                avg_rating: 0,
                rating_count: 0,
                total_rating: 0,
                streak: 0,
                total_orders: 0,
              },
            }}
          />
        </Box>
      </TableCell>

      {/* Quality Tier Requirements */}
      <TableCell align={"left"}>
        {buy_order.quality_tier_min && buy_order.quality_tier_max ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <QualityBadge tier={buy_order.quality_tier_min} size="small" />
            {buy_order.quality_tier_min !== buy_order.quality_tier_max && (
              <>
                <Typography variant="caption">-</Typography>
                <QualityBadge tier={buy_order.quality_tier_max} size="small" />
              </>
            )}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {t("market.anyQuality", "Any Quality")}
          </Typography>
        )}
      </TableCell>

      {/* Price */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <Typography variant={"subtitle2"} color={"primary"}>
          {priceDisplay}
        </Typography>
      </TableCell>

      {/* Quantity */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <Typography variant={"subtitle2"} color={"primary"}>
          {buy_order.quantity_fulfilled
            ? `${fmt.number(remaining)}/${fmt.number(buy_order.quantity)}`
            : fmt.number(buy_order.quantity)}
        </Typography>
      </TableCell>

      {/* Total */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <Typography variant={"subtitle2"} color={"primary"}>
          {buy_order.total != null
            ? `${buy_order.negotiable ? "~" : ""}${fmt.number(buy_order.total)} aUEC`
            : t("buyorder.status.negotiable", "Negotiable")}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        {!isOwnBuyOrder && (
          <Button
            variant={"contained"}
            color={"primary"}
            size={"large"}
            onClick={callback}
          >
            {t("MarketAggregateView.fulfill")}
          </Button>
        )}
        {isOwnBuyOrder && (
          <Button
            variant={"contained"}
            color={"error"}
            size={"large"}
            onClick={cancelCallback}
            sx={{
              marginLeft: 1,
            }}
            disabled={cancelIsLoading}
          >
            {t("MarketAggregateView.cancel")}
          </Button>
        )}
      </TableCell>

      {fulfillDialogOpen && (
        <FulfillBuyOrderDialog
          buyOrder={buy_order}
          open={fulfillDialogOpen}
          onClose={() => setFulfillDialogOpen(false)}
        />
      )}
    </TableRow>
  )
}

/**
 * AggregateChartV2 - Price history chart with quality tier support
 *
 * Requirements: 41.4
 */
export function AggregateChartV2(props: {
  aggregate: GameItemAggregateV2
  qualityTier?: number | null
}) {
  const { aggregate, qualityTier } = props
  const { t } = useTranslation()

  const rawHistory = aggregate.price_history

  // Filter to selected quality tier when set
  const chartData = useMemo(() => {
    if (qualityTier == null) return rawHistory
    return rawHistory.filter((d) => d.quality_tier === qualityTier)
  }, [rawHistory, qualityTier])

  // Transform price history data for chart
  const chartSeries = useMemo(() => {
    if (!chartData || chartData.length === 0) return []

    // Group by quality tier
    const tierMap = new Map<
      number | null,
      Array<{ timestamp: string; avg_price: number }>
    >()

    chartData.forEach((item) => {
      const tier = item.quality_tier
      if (!tierMap.has(tier)) {
        tierMap.set(tier, [])
      }
      tierMap.get(tier)!.push({
        timestamp: item.timestamp,
        avg_price: item.avg_price,
      })
    })

    // Convert to chart series format
    const series: Array<{
      name: string
      data: Array<{ x: string; y: number }>
    }> = []

    tierMap.forEach((data, tier) => {
      series.push({
        name:
          tier === null
            ? t("market.allTiers", "All Tiers")
            : t("market.tierN", "Tier {{tier}}", { tier }),
        data: data.map((d) => ({
          x: d.timestamp,
          y: d.avg_price,
        })),
      })
    })

    return series
  }, [chartData, t])

  return (
    <Section xs={12}>
      <Grid item xs={12}>
        {chartSeries.length > 0 ? (
          <MuiAreaChart series={chartSeries} height={400} xAxisType="time" />
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            {t("market.noPriceHistory", "No price history available")}
          </Typography>
        )}
      </Grid>
    </Section>
  )
}

/**
 * AggregateBuySellWallV2 - Buy/Sell wall charts with quality tier filtering
 *
 * Requirements: 41.4
 */
export function AggregateBuySellWallV2(props: {
  aggregate: GameItemAggregateV2
  compact?: boolean
  qualityTier?: number | null
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const { aggregate: rawAggregate, compact, qualityTier } = props

  // Pre-filter listings/buy_orders to selected quality tier
  const aggregate = useMemo(() => {
    if (qualityTier == null) return rawAggregate
    return {
      ...rawAggregate,
      listings: rawAggregate.listings.filter(
        (l) =>
          l.quality_tier_min != null &&
          l.quality_tier_max != null &&
          l.quality_tier_min <= qualityTier &&
          l.quality_tier_max >= qualityTier,
      ),
      buy_orders: rawAggregate.buy_orders.filter(
        (o) =>
          o.quality_tier_min != null &&
          o.quality_tier_max != null &&
          o.quality_tier_min <= qualityTier &&
          o.quality_tier_max >= qualityTier,
      ),
    }
  }, [rawAggregate, qualityTier])

  // Compact mode: non-cumulative density histogram (20 buckets, short bar chart)
  const { compactSellBars, compactBuyBars } = useMemo(() => {
    if (!compact)
      return {
        compactSellBars: [] as { x: string; y: number }[],
        compactBuyBars: [] as { x: string; y: number }[],
      }
    const BUCKETS = 20
    const activeSells = aggregate.listings.filter(
      (l) => l.quantity_available > 0,
    )
    const pricedBuys = aggregate.buy_orders.filter((o) => o.price_per_unit > 0)
    if (!activeSells.length && !pricedBuys.length)
      return {
        compactSellBars: [] as { x: string; y: number }[],
        compactBuyBars: [] as { x: string; y: number }[],
      }

    const allPrices = [
      ...activeSells.map((l) => l.price_min),
      ...pricedBuys.map((o) => o.price_per_unit),
    ]
    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices) * 1.05
    const interval = (maxPrice - minPrice) / BUCKETS
    if (interval === 0)
      return {
        compactSellBars: [] as { x: string; y: number }[],
        compactBuyBars: [] as { x: string; y: number }[],
      }

    const sellBuckets = new Array(BUCKETS).fill(0)
    const buyBuckets = new Array(BUCKETS).fill(0)
    activeSells.forEach((l) => {
      const idx = Math.min(
        Math.floor((l.price_min - minPrice) / interval),
        BUCKETS - 1,
      )
      if (idx >= 0) sellBuckets[idx] += l.quantity_available
    })
    pricedBuys.forEach((o) => {
      const idx = Math.min(
        Math.floor((o.price_per_unit - minPrice) / interval),
        BUCKETS - 1,
      )
      if (idx >= 0) buyBuckets[idx] += o.quantity
    })

    // Label each bucket by its midpoint price
    const fmt = (n: number) => {
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
      if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
      return Math.round(n).toString()
    }
    const labels = Array.from({ length: BUCKETS }, (_, i) =>
      fmt(minPrice + interval * (i + 0.5)),
    )
    return {
      compactSellBars: labels.map((x, i) => ({ x, y: sellBuckets[i] })),
      compactBuyBars: labels.map((x, i) => ({ x, y: buyBuckets[i] })),
    }
  }, [compact, aggregate])

  // Full mode: cumulative supply/demand (skip in compact)
  const { supplyPoints, demandPoints } = useMemo(() => {
    if (compact)
      return {
        supplyPoints: [] as { x: number; y: number }[],
        demandPoints: [] as { x: number; y: number }[],
      }
    const bucketCount = 100
    const sellHigh = aggregate.listings.length
      ? aggregate.listings.reduce(
          (high, listing) =>
            listing.price_max > high ? listing.price_max : high,
          aggregate.listings[0].price_max,
        )
      : 0
    const pricedBuyOrders = aggregate.buy_orders.filter(
      (o) => o.price_per_unit != null,
    )
    const buyHigh = pricedBuyOrders.length
      ? pricedBuyOrders.reduce(
          (high, listing) =>
            listing.price_per_unit > high ? listing.price_per_unit : high,
          pricedBuyOrders[0].price_per_unit!,
        )
      : 0
    const high = Math.max(sellHigh, buyHigh) * 1.1
    const interval = high / bucketCount

    if (interval === 0) {
      return {
        supplyPoints: [] as { x: number; y: number }[],
        demandPoints: [] as { x: number; y: number }[],
      }
    }

    const sortedSell = [...aggregate.listings]
      .filter((s) => s.quantity_available)
      .sort((a, b) => a.price_min - b.price_min)
    const sortedBuy = [...pricedBuyOrders].sort(
      (a, b) => (a.price_per_unit ?? 0) - (b.price_per_unit ?? 0),
    )

    // Cumulative supply: stock available at or below each price bucket
    const supplyPoints = new Array(bucketCount + 1)
      .fill(undefined)
      .map((_, i) => ({ x: interval * i, y: 0 }))
    for (const sell of sortedSell) {
      const index = Math.min(Math.floor(sell.price_min / interval), bucketCount)
      for (let i = index; i < bucketCount + 1; i++) {
        supplyPoints[i].y += sell.quantity_available
      }
    }

    // Cumulative demand: quantity requested at or above each price bucket
    const demandPoints = new Array(bucketCount + 1)
      .fill(undefined)
      .map((_, i) => ({ x: interval * i, y: 0 }))
    for (const buy of sortedBuy) {
      const index = Math.min(
        Math.floor((buy.price_per_unit ?? 0) / interval),
        bucketCount,
      )
      for (let i = 0; i <= index; i++) {
        demandPoints[i].y += buy.quantity
      }
    }

    return { supplyPoints, demandPoints }
  }, [compact, aggregate])

  // Compact early return (all hooks have been called above)
  if (compact) {
    if (!compactSellBars.length && !compactBuyBars.length) return null
    return (
      <MuiBarChart
        series={[
          { name: t("marketUi2.aggregate.askSupply"), data: compactSellBars },
          { name: t("marketUi2.aggregate.bidDemand"), data: compactBuyBars },
        ]}
        height={200}
        xAxisType="category"
        colors={["#22c55e", "#f59e0b"]}
      />
    )
  }

  // Price bucket values in the locale's short form ("1.2K", "1,2 Tsd.").
  const formatPrice = (v: Date | number | string) => fmt.compact(Number(v))

  return (
    <Section xs={12} disablePadding>
      <Grid item xs={12}>
        <MuiAreaChart
          series={[
            {
              name: t(
                "MarketAggregateView.stockAvailable",
                "Supply (stock ≤ price)",
              ),
              data: supplyPoints.map((d: { x: number; y: number }) => ({
                x: d.x.toString(),
                y: d.y,
              })),
            },
            {
              name: t(
                "MarketAggregateView.quantityRequested",
                "Demand (wanted ≥ price)",
              ),
              data: demandPoints.map((d: { x: number; y: number }) => ({
                x: d.x.toString(),
                y: d.y,
              })),
            },
          ]}
          height={400}
          xAxisType="category"
          colors={["#22c55e", "#f59e0b"]}
          xTickInterval={10}
          xValueFormatter={formatPrice}
        />
      </Grid>
    </Section>
  )
}
