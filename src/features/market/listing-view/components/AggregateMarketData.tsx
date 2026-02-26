import React, { useMemo, useState } from "react"
import { Box, Card, CardContent, Chip, Grid, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useGetOrCreateAggregateQuery,
  useMarketGetAggregateHistoryByIDQuery,
} from "../../api/marketApi"
import { DynamicKlineChart } from "../../../../components/charts/DynamicCharts"
import { MuiAreaChart } from "../../../../components/charts/MuiCharts"
import { TabbedChartLayout } from "../../../../components/charts/TabbedChartLayout"
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
  const [selectedTab, setSelectedTab] = useState(0)

  const { series, supplyDemand, buyMax, sellMax, totalStockAvailable, totalQuantityRequested } = useMemo(() => {
    if (!aggregate) return { series: [[], []], supplyDemand: [[], []], buyMax: 0, sellMax: 0, totalStockAvailable: 0, totalQuantityRequested: 0 }

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
      const index = Math.min(Math.floor(sell.price / interval), bucketCount)
      sellPoints[index].y += 1
    }

    for (const buy of sortedBuy) {
      const index = Math.min(Math.floor((buy.price ?? 0) / interval), bucketCount)
      buyPoints[index].y += 1
    }

    for (let i = 1; i < bucketCount + 1; i++) {
      sellPoints[i].y += sellPoints[i - 1].y
    }

    const sellMax = sellPoints[bucketCount].y

    for (let i = bucketCount; i > 0; i--) {
      buyPoints[i - 1].y += buyPoints[i].y
    }

    const buyMax = buyPoints[0].y

    // Calculate cumulative supply (stock available at or below each price)
    const supplyPoints = new Array(bucketCount + 1)
      .fill(undefined)
      .map((_o, i: number) => ({ x: interval * i, y: 0 }))
    
    for (const sell of sortedSell) {
      const index = Math.min(Math.floor(sell.price / interval), bucketCount)
      for (let i = index; i < bucketCount + 1; i++) {
        supplyPoints[i].y += sell.quantity_available
      }
    }

    // Calculate cumulative demand (quantity requested at or above each price)
    const demandPoints = new Array(bucketCount + 1)
      .fill(undefined)
      .map((_o, i: number) => ({ x: interval * i, y: 0 }))
    
    for (const buy of sortedBuy) {
      const index = Math.min(Math.floor((buy.price ?? 0) / interval), bucketCount)
      for (let i = 0; i <= index; i++) {
        demandPoints[i].y += buy.quantity
      }
    }

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
      supplyDemand: [supplyPoints, demandPoints],
      buyMax,
      sellMax,
      totalStockAvailable,
      totalQuantityRequested,
    }
  }, [aggregate])

  if (!aggregate) return null

  const [sellWall, buyWall] = series
  const [supplyPoints, demandPoints] = supplyDemand

  const tabs = [
    t("AggregateMarketData.priceHistory", "Price History"),
    t("AggregateMarketData.orderDepth", "Order Depth"),
    t("AggregateMarketData.supplyDemand", "Supply & Demand"),
  ]

  return (
    <Grid container spacing={theme.layoutSpacing.layout} sx={{ mt: 2 }}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          {t("AggregateMarketData.marketAnalysis", "Market Analysis")}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TabbedChartLayout
          tabs={tabs}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        >
          {selectedTab === 0 && (
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
                  style={{ width: "100%", height: 400 }}
                />
              )}
            </DynamicKlineChart>
          )}
          {selectedTab === 1 && (
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
              ]}
              height={400}
              xAxisType="category"
            />
          )}
          {selectedTab === 2 && (
            <MuiAreaChart
              series={[
                {
                  name: t("AggregateMarketData.stockAvailable", "Stock Available ≤ Price"),
                  data: supplyPoints.map((d: { x: number; y: number }) => ({ x: d.x.toString(), y: d.y })),
                },
                {
                  name: t("AggregateMarketData.quantityRequested", "Quantity Requested ≥ Price"),
                  data: demandPoints.map((d: { x: number; y: number }) => ({ x: d.x.toString(), y: d.y })),
                },
              ]}
              height={400}
              xAxisType="category"
            />
          )}
        </TabbedChartLayout>
      </Grid>
    </Grid>
  )
}
