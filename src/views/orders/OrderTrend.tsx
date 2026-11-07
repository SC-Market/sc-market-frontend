import { Section } from "../../components/paper/Section"
import { OrderStub } from "../../features/orders/domain/types"
import { useMemo } from "react"
import { Grid } from "@mui/material"
import { MuiLineChart, MuiAreaChart } from "../../components/charts/MuiCharts"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import type { ContractorOrderData } from "../../features/orders/domain/types"
import {
  useOrgOrderTrend,
  useUserOrderTrend,
} from "../../features/orders/hooks/useOrderTrend"
import { useNow } from "../../util/format"

// Minimal interface for trend data
interface TrendOrder {
  order_id: string
  timestamp: string
  status: string
  cost: number
  title: string
}

function round(n: number, increment: number, offset: number) {
  return Math.ceil((n - offset) / increment) * increment + offset
}

function getTotalInInterval(
  orders: OrderStub[] | TrendOrder[],
  interval: number,
  first: Date,
  now: number,
) {
  const count = Math.ceil((now - first.getTime()) / interval)

  const items = new Map<number, number>()
  for (let i = 0; i < count; i++) {
    items.set(first.getTime() + i * interval, 0)
  }

  orders.forEach((o) => {
    const key = round(+new Date(o.timestamp), interval, first.getTime())
    const current = items.get(key) || 0
    items.set(key, current + 1)
  })

  return Array.from(items.entries())
    .sort((a, b) => +a[0]! - +b[0]!)
    .map((entry) => ({ x: new Date(entry[0]).toISOString(), y: entry[1] }))
}

// New component that works with pre-computed metrics data
export function OrderTrendFromMetrics(props: { data: ContractorOrderData }) {
  const { data } = props
  const { t } = useTranslation()

  if (!data.metrics.trend_data) {
    return <div>{t("ordersUi.trend.noData")}</div>
  }

  const { trend_data } = data.metrics

  // Convert trend data to chart format
  const dailyOrdersData = trend_data.daily_orders.map((item) => ({
    x: item.date,
    y: item.count,
  }))

  const dailyValueData = trend_data.daily_value.map((item) => ({
    x: item.date,
    y: item.value,
  }))

  const statusTrendsData = Object.entries(trend_data.status_trends).map(
    ([status, data]) => ({
      name: orderStatusLabel(t, status),
      data: data.map((item) => ({ x: item.date, y: item.count })),
    }),
  )

  return (
    <>
      <Section xs={12} title={t("orderTrend.order_count_daily")}>
        <Grid item xs={12}>
          <MuiLineChart
            series={[
              {
                name: t("orderTrend.orders_daily"),
                data: dailyOrdersData,
              },
            ]}
            height={400}
          />
        </Grid>
      </Section>

      <Section xs={12} title={t("orderTrend.order_value_daily")}>
        <Grid item xs={12}>
          <MuiLineChart
            series={[
              {
                name: t("ordersUi2.orderTrend.valueAuec"),
                data: dailyValueData,
              },
            ]}
            height={400}
          />
        </Grid>
      </Section>

      <Section xs={12} title={t("orderTrend.status_trends")}>
        <Grid item xs={12}>
          <MuiLineChart series={statusTrendsData} height={400} />
        </Grid>
      </Section>
    </>
  )
}

// Component that works with minimal trend order data
export function OrderTrendFromOrders(props: { orders: TrendOrder[] }) {
  const { orders } = props
  const { t } = useTranslation()
  const now = useNow()

  const first = useMemo(
    () =>
      orders.reduce(
        (c, o) => (c < new Date(o.timestamp) ? c : new Date(o.timestamp)),
        new Date(now),
      ),
    [orders, now],
  )

  const dataDailyTotal = useMemo(
    () => getTotalInInterval(orders, 86400 * 1000, first, now),
    [first, orders, now],
  )

  const dataDailyStatus = useMemo(
    () =>
      ["in-progress", "fulfilled", "cancelled", "not-started"]
        .map((status) => Array.from(orders.filter((o) => o.status === status)))
        .map((os) => getTotalInInterval(os, 86400 * 1000, first, now)),
    [first, orders, now],
  )

  const dataWeeklyTotal = useMemo(
    () => getTotalInInterval(orders, 604800 * 1000, first, now),
    [first, orders, now],
  )

  const dataWeeklyStatus = useMemo(
    () =>
      ["in-progress", "fulfilled", "cancelled", "not-started"]
        .map((status) => Array.from(orders.filter((o) => o.status === status)))
        .map((os) => getTotalInInterval(os, 604800 * 1000, first, now)),
    [first, orders, now],
  )

  const dataMonthlyTotal = useMemo(
    () => getTotalInInterval(orders, 2.628e6 * 1000, first, now),
    [first, orders, now],
  )

  const dataMonthlyStatus = useMemo(
    () =>
      ["in-progress", "fulfilled", "cancelled", "not-started"]
        .map((status) => Array.from(orders.filter((o) => o.status === status)))
        .map((os) => getTotalInInterval(os, 2.628e6 * 1000, first, now)),
    [first, orders, now],
  )

  return (
    <>
      <Section xs={12} title={t("orderTrend.order_count_daily")}>
        <Grid item xs={12}>
          <MuiAreaChart
            series={[
              {
                name: t("orderTrend.orders_daily"),
                data: dataDailyTotal,
              },
              ...dataDailyStatus.map((data, i) => ({
                name: [
                  t("orderTrend.in_progress"),
                  t("orderTrend.fulfilled"),
                  t("orderTrend.cancelled"),
                  t("orderTrend.not_started"),
                ][i]!,
                data,
              })),
            ]}
            height={400}
          />
        </Grid>
      </Section>

      <Section xs={12} title={t("orderTrend.order_count_weekly")}>
        <Grid item xs={12}>
          <MuiAreaChart
            series={[
              {
                name: t("orderTrend.orders_weekly"),
                data: dataWeeklyTotal,
              },
              ...dataWeeklyStatus.map((data, i) => ({
                name: [
                  t("orderTrend.in_progress"),
                  t("orderTrend.fulfilled"),
                  t("orderTrend.cancelled"),
                  t("orderTrend.not_started"),
                ][i]!,
                data,
              })),
            ]}
            height={400}
          />
        </Grid>
      </Section>

      <Section xs={12} title={t("orderTrend.order_count_monthly")}>
        <Grid item xs={12}>
          <MuiAreaChart
            series={[
              {
                name: t("orderTrend.orders_monthly"),
                data: dataMonthlyTotal,
              },
              ...dataMonthlyStatus.map((data, i) => ({
                name: [
                  t("orderTrend.in_progress"),
                  t("orderTrend.fulfilled"),
                  t("orderTrend.cancelled"),
                  t("orderTrend.not_started"),
                ][i]!,
                data,
              })),
            ]}
            height={400}
          />
        </Grid>
      </Section>
    </>
  )
}

export function OrgOrderTrend(props: {
  spectrumId: string | undefined
  shopId?: string
}) {
  const { orderData } = useOrgOrderTrend(props.spectrumId, props.shopId)

  if (orderData?.metrics?.trend_data) {
    return <OrderTrendFromMetrics data={orderData} />
  }
  return <OrderTrendFromOrders orders={orderData?.recent_orders || []} />
}

export function UserOrderTrend(props: {
  spectrumId: string | undefined
  shopId?: string
}) {
  const { orderData } = useUserOrderTrend(props.spectrumId, props.shopId)

  if (orderData?.metrics?.trend_data) {
    return <OrderTrendFromMetrics data={orderData} />
  }
  return <OrderTrendFromOrders orders={orderData?.recent_orders || []} />
}

/** Which single trend chart to render. */
export type OrderTrendMetric = "count" | "value" | "status"

/** orderTrend.* label keys for the API's order status values. */
const STATUS_LABEL_KEYS: Record<string, string> = {
  "in-progress": "orderTrend.in_progress",
  fulfilled: "orderTrend.fulfilled",
  cancelled: "orderTrend.cancelled",
  "not-started": "orderTrend.not_started",
}

/** Chart legend label for an order status; unknown statuses show as-is. */
function orderStatusLabel(t: TFunction, status: string): string {
  const key = STATUS_LABEL_KEYS[status]
  return key ? t(key) : status
}

const STATUS_ORDER = [
  "in-progress",
  "fulfilled",
  "cancelled",
  "not-started",
] as const

/**
 * A single trend chart (count, value, or status) for a scope. Each is its own
 * dashboard widget. Prefers the metrics `trend_data` path and falls back to
 * computing from `recent_orders`; the value chart has no fallback series.
 */
function OrderTrendChart(props: {
  metric: OrderTrendMetric
  orderData: ContractorOrderData | undefined
}) {
  const { metric, orderData } = props
  const { t } = useTranslation()
  const now = useNow()

  const recent = orderData?.recent_orders
  const first = useMemo(
    () =>
      (recent ?? []).reduce(
        (c, o) => (c < new Date(o.timestamp) ? c : new Date(o.timestamp)),
        new Date(now),
      ),
    [recent, now],
  )

  const trend = orderData?.metrics?.trend_data

  const { title, series } = useMemo(() => {
    if (metric === "count") {
      const data = trend
        ? trend.daily_orders.map((d) => ({ x: d.date, y: d.count }))
        : getTotalInInterval(recent ?? [], 86400 * 1000, first, now)
      return {
        title: t("orderTrend.order_count_daily"),
        series: [{ name: t("orderTrend.orders_daily"), data }],
      }
    }
    if (metric === "value") {
      // Value has no recent_orders fallback series; render empty when absent.
      const data = trend
        ? trend.daily_value.map((d) => ({ x: d.date, y: d.value }))
        : []
      return {
        title: t("orderTrend.order_value_daily"),
        series: [{ name: t("ordersUi2.orderTrend.valueAuec"), data }],
      }
    }
    // status
    if (trend) {
      return {
        title: t("orderTrend.status_trends"),
        series: STATUS_ORDER.map((status) => ({
          name: orderStatusLabel(t, status),
          data: trend.status_trends[status].map((d) => ({
            x: d.date,
            y: d.count,
          })),
        })),
      }
    }
    return {
      title: t("orderTrend.status_trends"),
      series: STATUS_ORDER.map((status) => ({
        name: orderStatusLabel(t, status),
        data: getTotalInInterval(
          (recent ?? []).filter((o) => o.status === status),
          86400 * 1000,
          first,
          now,
        ),
      })),
    }
  }, [metric, trend, recent, first, now, t])

  return (
    <Section xs={12} title={title}>
      <Grid item xs={12}>
        <MuiLineChart series={series} height={400} />
      </Grid>
    </Section>
  )
}

export function UserOrderTrendChart(props: {
  metric: OrderTrendMetric
  spectrumId: string | undefined
  shopId?: string
}) {
  const { orderData } = useUserOrderTrend(props.spectrumId, props.shopId)
  return <OrderTrendChart metric={props.metric} orderData={orderData} />
}

export function OrgOrderTrendChart(props: {
  metric: OrderTrendMetric
  spectrumId: string | undefined
  shopId?: string
}) {
  const { orderData } = useOrgOrderTrend(props.spectrumId, props.shopId)
  return <OrderTrendChart metric={props.metric} orderData={orderData} />
}
