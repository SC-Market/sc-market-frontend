import React, { useMemo } from "react"
import { Box, Card, CardContent, Chip, Grid, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useGetOrCreateAggregateQuery,
  useMarketGetAggregateHistoryByIDQuery,
} from "../../api/marketApi"
import { DynamicKlineChart } from "../../../../components/charts/DynamicCharts"
import { MuiAreaChart } from "../../../../components/charts/MuiCharts"
import { Section } from "../../../../components/paper/Section"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import TrendingDownIcon from "@mui/icons-material/TrendingDown"
import type { MarketAggregateListing, BuyOrder } from "../../../../datatypes/MarketListing"

interface AggregateMarketDataProps {
  gameItemId: string
  currentPrice: number
}

export function AggregateMarketData({
  gameItemId,
  currentPrice,
}: AggregateMarketDataProps) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { data: aggregate } = useGetOrCreateAggregateQuery(gameItemId)
  const { data: chartData } = useMarketGetAggregateHistoryByIDQuery(gameItemId)

  const priceComparison = useMemo(() => {
    if (!aggregate?.listings.length) return null

    const prices = aggregate.listings.map((l: MarketAggregateListing) => l.price)
    const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length
    const minPrice = Math.min(...prices)
    const maxBuyOrder = aggregate.buy_orders
      .filter((o: BuyOrder) => o.price != null)
      .reduce((max: number, o: BuyOrder) => Math.max(max, o.price!), 0)

    const percentVsAvg = ((currentPrice - avgPrice) / avgPrice) * 100
    const percentVsMin = ((currentPrice - minPrice) / minPrice) * 100

    return {
      avgPrice,
      minPrice,
      maxBuyOrder,
      percentVsAvg,
      percentVsMin,
      isBelowAvg: currentPrice < avgPrice,
      isLowest: currentPrice === minPrice,
    }
  }, [aggregate, currentPrice])

  const { series, buyMax, sellMax, totalStockAvailable, totalQuantityRequested } = useMemo(() => {
    if (!aggregate) return { series: [[], []], buyMax: 0, sellMax: 0, totalStockAvailable: 0, totalQuantityRequested: 0 }

    const bucketCount = 100
    const sellHigh = aggregate.listings.length
      ? aggregate.listings.reduce(
          (high: number, listing: MarketAggregateListing) => (listing.price > high ? listing.price : high),
          aggregate.listings[0].price,
        )
      : 0
    const pricedBuyOrders = aggregate.buy_orders.filter((o: BuyOrder) => o.price != null)
    const buyHigh = pricedBuyOrders.length
      ? pricedBuyOrders.reduce(
          (high: number, listing: BuyOrder) => (listing.price! > high ? listing.price! : high),
          pricedBuyOrders[0].price!,
        )
      : 0
    const high = Math.max(sellHigh, buyHigh) * 1.1
    const interval = high / bucketCount

    const sortedSell = [...aggregate.listings]
      .filter((s: MarketAggregateListing) => s.quantity_available)
      .sort((a: MarketAggregateListing, b: MarketAggregateListing) => a.price - b.price)
    const sortedBuy = [...pricedBuyOrders].sort(
      (a: BuyOrder, b: BuyOrder) => (a.price ?? 0) - (b.price ?? 0),
    )

    const sellPoints = new Array(bucketCount + 1)
      .fill(undefined)
      .map((_o, i: number) => ({ x: interval * i, y: 0 }))
    const buyPoints = new Array(bucketCount + 1)
      .fill(undefined)
      .map((_o, i: number) => ({ x: interval * i, y: 0 }))

    for (const sell of sortedSell) {
      sellPoints[Math.floor(sell.price / interval)].y += 1
    }

    for (const buy of sortedBuy) {
      buyPoints[Math.floor((buy.price ?? 0) / interval)].y += 1
    }

    for (let i = 1; i < bucketCount + 1; i++) {
      sellPoints[i].y += sellPoints[i - 1].y
    }

    const sellMax = sellPoints[bucketCount].y

    for (let i = bucketCount; i > 0; i--) {
      buyPoints[i - 1].y += buyPoints[i].y
    }

    const buyMax = buyPoints[0].y

    const totalStockAvailable = aggregate.listings.reduce(
      (sum: number, listing: MarketAggregateListing) => sum + listing.quantity_available,
      0,
    )
    const totalQuantityRequested = aggregate.buy_orders.reduce(
      (sum: number, order: BuyOrder) => sum + order.quantity,
      0,
    )

    return {
      series: [sellPoints, buyPoints],
      buyMax,
      sellMax,
      totalStockAvailable,
      totalQuantityRequested,
    }
  }, [aggregate])

  if (!aggregate) return null

  const [sellWall, buyWall] = series

  return (
    <Grid container spacing={theme.layoutSpacing.layout} sx={{ mt: 2 }}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t("AggregateMarketData.marketAnalysis", "Market Analysis")}
        </Typography>
      </Grid>

      {priceComparison && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                {t("AggregateMarketData.priceComparison", "Price Comparison")}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  icon={
                    priceComparison.isBelowAvg ? (
                      <TrendingDownIcon />
                    ) : (
                      <TrendingUpIcon />
                    )
                  }
                  label={`${priceComparison.percentVsAvg > 0 ? "+" : ""}${priceComparison.percentVsAvg.toFixed(1)}% vs Avg (${priceComparison.avgPrice.toLocaleString()} aUEC)`}
                  color={priceComparison.isBelowAvg ? "success" : "default"}
                  size="small"
                />
                <Chip
                  label={`Lowest: ${priceComparison.minPrice.toLocaleString()} aUEC`}
                  color={priceComparison.isLowest ? "success" : "default"}
                  size="small"
                />
                {priceComparison.maxBuyOrder > 0 && (
                  <Chip
                    label={`Top Buy Order: ${priceComparison.maxBuyOrder.toLocaleString()} aUEC`}
                    size="small"
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      <Section xs={12}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t("AggregateMarketData.priceHistory", "Price History")}
          </Typography>
          <DynamicKlineChart
            onInit={(kline: typeof import("klinecharts")) => {
              const chart = kline.init(`listing-aggregate-chart-${gameItemId}`)
              if (chart) {
                chart.setPriceVolumePrecision(0, 0)
                chart.applyNewData(Array.isArray(chartData) ? chartData : [])
              }
            }}
            onDispose={(kline: typeof import("klinecharts")) => {
              kline.dispose(`listing-aggregate-chart-${gameItemId}`)
            }}
          >
            {(kline: typeof import("klinecharts"), loading: boolean) => (
              <div
                id={`listing-aggregate-chart-${gameItemId}`}
                style={{ width: "100%", height: 300 }}
              />
            )}
          </DynamicKlineChart>
        </Grid>
      </Section>

      <Section xs={12}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t("AggregateMarketData.marketDepth", "Market Depth")}
          </Typography>
          <MuiAreaChart
            series={[
              {
                name: t("AggregateMarketData.buyOrders", "Buy Orders"),
                data: buyWall.map((d) => ({ x: d.x.toString(), y: d.y })),
              },
              {
                name: t("AggregateMarketData.sellOrders", "Sell Orders"),
                data: sellWall.map((d) => ({ x: d.x.toString(), y: d.y })),
              },
              {
                name: t("AggregateMarketData.stockAvailable", "Stock Available"),
                data: sellWall.map((d) => ({ x: d.x.toString(), y: totalStockAvailable })),
                yAxisKey: "rightAxis",
              },
              {
                name: t("AggregateMarketData.quantityRequested", "Quantity Requested"),
                data: buyWall.map((d) => ({ x: d.x.toString(), y: totalQuantityRequested })),
                yAxisKey: "rightAxis",
              },
            ]}
            height={300}
            xAxisType="category"
            rightYAxis={true}
          />
        </Grid>
      </Section>
    </Grid>
  )
}
