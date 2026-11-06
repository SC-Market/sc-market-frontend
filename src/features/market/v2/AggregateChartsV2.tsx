import { useMemo } from "react"
import { Grid, Typography, useTheme } from "@mui/material"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { Section } from "../../../components/paper/Section"
import { MuiAreaChart, MuiBarChart } from "../../../components/charts/MuiCharts"
import { useTranslation } from "react-i18next"
import { useFormatters } from "../../../util/format"
import { GameItemAggregateV2 } from "./aggregateV2Types"

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
  const theme = useTheme<ExtendedTheme>()
  // Asks in the accent, bids in the buy side's colour
  const depthColors = [theme.palette.primary.main, theme.palette.secondary.main]
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
        colors={depthColors}
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
          colors={depthColors}
          xTickInterval={10}
          xValueFormatter={formatPrice}
        />
      </Grid>
    </Section>
  )
}
