import React from "react"
import { Box, Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import CountUp from "react-countup"
import { MetricSection } from "../../views/orders/OrderMetrics"
import { useGetMarketStatsQuery } from "../../features/market/api/marketApi"
import { OrderStatisticsSkeleton } from "./OrderStatistics.skeleton"

export function OrderStatistics() {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useGetMarketStatsQuery()
  const { total_orders, total_order_value, week_orders, week_order_value } =
    stats || {
      total_orders: 0,
      total_order_value: 0,
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
      <MetricSection
        title={t("landing.totalOrders")}
        body={<CountUp end={total_orders} separator="," duration={2} />}
      />
      <MetricSection
        title={t("landing.totalOrderValue")}
        body={
          <Box display={"flex"}>
            <CountUp end={total_order_value} separator="," duration={2} />
            &nbsp;aUEC
          </Box>
        }
      />
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
