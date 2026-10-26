import React from "react"
import { Box, Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import CountUp from "react-countup"
import { MetricSection } from "../../views/orders/OrderMetrics"
import { useGetMarketStatsQuery } from "../../features/market/api/marketApi"
import { OrderStatisticsSkeleton } from "./OrderStatistics.skeleton"
import { usePageReady } from "../metadata/PageReady"

export function OrderStatistics() {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useGetMarketStatsQuery()
  usePageReady(isLoading)
  // The all-time totals are in the hero (LandingHero); this row is the week.
  const { week_orders, week_order_value } = stats || {
    week_orders: 0,
    week_order_value: 0,
  }

  const theme = useTheme<ExtendedTheme>()

  if (isLoading) {
    return <OrderStatisticsSkeleton />
  }

  return (
    <Grid
      container
      spacing={theme.layoutSpacing.layout}
      justifyContent={"center"}
    >
      {+week_orders > 0 && (
        <>
          <MetricSection
            title={t("landing.ordersThisWeek")}
            body={
              <Box display={"flex"}>
                <CountUp end={week_orders} separator="," duration={2} />
              </Box>
            }
          />
          <MetricSection
            title={t("landing.valueOfOrdersThisWeek")}
            body={
              <Box display={"flex"}>
                <CountUp end={week_order_value} separator="," duration={2} />
                &nbsp;aUEC
              </Box>
            }
          />
        </>
      )}
    </Grid>
  )
}
