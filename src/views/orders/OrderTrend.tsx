import { Section } from "../../components/paper/Section"
import { OrderStub } from "../../features/orders/domain/types"
import React, { useMemo } from "react"
import { Grid, List, ListItem, Typography } from "@mui/material"
import { MuiLineChart, MuiAreaChart } from "../../components/charts/MuiCharts"
import { useTranslation } from "react-i18next"
import type { ContractorOrderData } from "../../features/orders/domain/types"
import {
  useOrgOrderTrend,
  useUserOrderTrend,
} from "../../features/orders/hooks/useOrderTrend"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Link } from "react-router-dom"
import { ORG_PATHS, USER_PATHS } from "../../routes/paths"

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
) {
  const count = Math.ceil((new Date().getTime() - first.getTime()) / interval)

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
    return <div>No trend data available</div>
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
      name: status,
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
                name: "Value (aUEC)",
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

  const first = useMemo(
    () =>
      orders.reduce(
        (c, o) => (c < new Date(o.timestamp) ? c : new Date(o.timestamp)),
        new Date(),
      ),
    [orders],
  )

  const dataDailyTotal = useMemo(
    () => getTotalInInterval(orders, 86400 * 1000, first),
    [first, orders],
  )

  const dataDailyStatus = useMemo(
    () =>
      ["in-progress", "fulfilled", "cancelled", "not-started"]
        .map((status) => Array.from(orders.filter((o) => o.status === status)))
        .map((os) => getTotalInInterval(os, 86400 * 1000, first)),
    [first, orders],
  )

  const dataWeeklyTotal = useMemo(
    () => getTotalInInterval(orders, 604800 * 1000, first),
    [first, orders],
  )

  const dataWeeklyStatus = useMemo(
    () =>
      ["in-progress", "fulfilled", "cancelled", "not-started"]
        .map((status) => Array.from(orders.filter((o) => o.status === status)))
        .map((os) => getTotalInInterval(os, 604800 * 1000, first)),
    [first, orders],
  )

  const dataMonthlyTotal = useMemo(
    () => getTotalInInterval(orders, 2.628e6 * 1000, first),
    [first, orders],
  )

  const dataMonthlyStatus = useMemo(
    () =>
      ["in-progress", "fulfilled", "cancelled", "not-started"]
        .map((status) => Array.from(orders.filter((o) => o.status === status)))
        .map((os) => getTotalInInterval(os, 2.628e6 * 1000, first)),
    [first, orders],
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

export function OrgOrderTrend(props: { spectrumId: string | undefined; shopId?: string }) {
  const { orderData } = useOrgOrderTrend(props.spectrumId, props.shopId)

  if (orderData?.metrics?.trend_data) {
    return <OrderTrendFromMetrics data={orderData} />
  }
  return <OrderTrendFromOrders orders={orderData?.recent_orders || []} />
}

export function UserOrderTrend(props: { spectrumId: string | undefined; shopId?: string }) {
  const { orderData } = useUserOrderTrend(props.spectrumId, props.shopId)

  if (orderData?.metrics?.trend_data) {
    return <OrderTrendFromMetrics data={orderData} />
  }
  return <OrderTrendFromOrders orders={orderData?.recent_orders || []} />
}

/** Which single trend chart to render. */
export type OrderTrendMetric = "count" | "value" | "status"

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

  const recent = orderData?.recent_orders
  const first = useMemo(
    () =>
      (recent ?? []).reduce(
        (c, o) => (c < new Date(o.timestamp) ? c : new Date(o.timestamp)),
        new Date(),
      ),
    [recent],
  )

  const trend = orderData?.metrics?.trend_data

  const { title, series } = useMemo(() => {
    if (metric === "count") {
      const data = trend
        ? trend.daily_orders.map((d) => ({ x: d.date, y: d.count }))
        : getTotalInInterval(recent ?? [], 86400 * 1000, first)
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
        series: [{ name: "Value (aUEC)", data }],
      }
    }
    // status
    if (trend) {
      return {
        title: t("orderTrend.status_trends"),
        series: STATUS_ORDER.map((status) => ({
          name: status,
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
        name: status,
        data: getTotalInInterval(
          (recent ?? []).filter((o) => o.status === status),
          86400 * 1000,
          first,
        ),
      })),
    }
  }, [metric, trend, recent, first, t])

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

export function TopContractors(props: { orders: OrderStub[] }) {
  const { orders } = props
  const topTen = useMemo(() => {
    const orderCounts = orders.reduce((old, order) => {
      if (!order.contractor) {
        return old
      }
      const oldVal = old.get(order.contractor.name)
      if (oldVal !== undefined) {
        return old.set(order.contractor.name, [
          oldVal[0] + (order.status === "fulfilled" ? 1 : 0),
          oldVal[1] + 1,
        ])
      } else {
        return old.set(order.contractor.name, [
          order.status === "fulfilled" ? 1 : 0,
          1,
        ])
      }
    }, new Map<string, [number, number]>())

    return Array.from(orderCounts, ([name, value]) => ({ name, value })).sort(
      (a, b) => b.value[0] - a.value[0],
    )
    // .slice(0, 10)
  }, [orders])

  return (
    <Section title={"Top Contractors"} xs={12} lg={3}>
      <ol>
        {topTen.map((c) => (
          <li key={c.name}>
            <UnderlineLink
              color={"text.secondary"}
              to={ORG_PATHS.profile(c.name)}
              component={Link}
            >
              {c.name}
            </UnderlineLink>
            : {c.value[0]}/{c.value[1]}
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function TopUsers(props: { orders: OrderStub[] }) {
  const { orders } = props
  const topTen = useMemo(() => {
    const orderCounts = orders.reduce((old, order) => {
      if (!order.assigned_to || order.contractor) {
        return old
      }
      const oldVal = old.get(order.assigned_to.username)
      if (oldVal !== undefined) {
        return old.set(order.assigned_to.username, [
          oldVal[0] + (order.status === "fulfilled" ? 1 : 0),
          oldVal[1] + 1,
        ])
      } else {
        return old.set(order.assigned_to.username, [
          order.status === "fulfilled" ? 1 : 0,
          1,
        ])
      }
    }, new Map<string, [number, number]>())

    return Array.from(orderCounts, ([name, value]) => ({ name, value })).sort(
      (a, b) => b.value[0] - a.value[0],
    )
    // .slice(0, 10)
  }, [orders])

  return (
    <Section title={"Top Users"} xs={12} lg={3}>
      <List sx={{ maxHeight: 400, overflowY: "scroll" }}>
        {topTen.map((c, i) => (
          <ListItem key={c.name}>
            {i + 1}.&nbsp;
            <UnderlineLink
              color={"text.secondary"}
              to={USER_PATHS.profile(c.name)}
              component={Link}
            >
              {c.name}
            </UnderlineLink>
            : {c.value[0]}/{c.value[1]}
          </ListItem>
        ))}
      </List>
    </Section>
  )
}

export function TopUsersThisWeek(props: { orders: OrderStub[] }) {
  const { orders } = props
  const topTen = useMemo(() => {
    const orderCounts = orders
      .filter((o) => +o.timestamp > Date.now() - 604800000)
      .reduce((old, order) => {
        if (!order.assigned_to || order.contractor) {
          return old
        }
        const oldVal = old.get(order.assigned_to.username)
        if (oldVal !== undefined) {
          return old.set(order.assigned_to.username, [
            oldVal[0] + (order.status === "fulfilled" ? 1 : 0),
            oldVal[1] + 1,
          ])
        } else {
          return old.set(order.assigned_to.username, [
            order.status === "fulfilled" ? 1 : 0,
            1,
          ])
        }
      }, new Map<string, [number, number]>())

    return Array.from(orderCounts, ([name, value]) => ({ name, value })).sort(
      (a, b) => b.value[0] - a.value[0],
    )
    // .slice(0, 10)
  }, [orders])

  return (
    <Section title={"Top Users (Weekly)"} xs={12} lg={3}>
      <List sx={{ maxHeight: 400, overflowY: "scroll" }}>
        {topTen.map((c, i) => (
          <ListItem key={c.name}>
            {i + 1}.&nbsp;
            <UnderlineLink
              color={"text.secondary"}
              to={USER_PATHS.profile(c.name)}
              component={Link}
            >
              {c.name}
            </UnderlineLink>
            : {c.value[0]}/{c.value[1]}
          </ListItem>
        ))}
      </List>
    </Section>
  )
}

export function TopUsersThisMonth(props: { orders: OrderStub[] }) {
  const { orders } = props
  const topTen = useMemo(() => {
    const orderCounts = orders
      .filter((o) => +o.timestamp > Date.now() - 2.628e9)
      .reduce((old, order) => {
        if (!order.assigned_to || order.contractor) {
          return old
        }
        const oldVal = old.get(order.assigned_to.username)
        if (oldVal !== undefined) {
          return old.set(order.assigned_to.username, [
            oldVal[0] + (order.status === "fulfilled" ? 1 : 0),
            oldVal[1] + 1,
          ])
        } else {
          return old.set(order.assigned_to.username, [
            order.status === "fulfilled" ? 1 : 0,
            1,
          ])
        }
      }, new Map<string, [number, number]>())

    return Array.from(orderCounts, ([name, value]) => ({ name, value })).sort(
      (a, b) => b.value[0] - a.value[0],
    )
    // .slice(0, 10)
  }, [orders])

  return (
    <Section title={"Top Users (Monthly)"} xs={12} lg={3}>
      <List sx={{ maxHeight: 400, overflowY: "scroll" }}>
        {topTen.map((c, i) => (
          <ListItem key={i}>
            {i + 1}.&nbsp;
            <UnderlineLink
              color={"text.secondary"}
              to={USER_PATHS.profile(c.name)}
              component={Link}
            >
              {c.name}
            </UnderlineLink>
            : {c.value[0]}/{c.value[1]}
          </ListItem>
        ))}
      </List>
    </Section>
  )
}
