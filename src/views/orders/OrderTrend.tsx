import { Section } from "../../components/paper/Section"
import { OrderStub } from "../../datatypes/Order"
import React, { useMemo } from "react"
import { Grid, List, ListItem, Typography } from "@mui/material"
import { DynamicApexChart } from "../../components/charts/DynamicCharts"
import { useTranslation } from "react-i18next"
import {
  useGetContractorOrderDataQuery,
  useGetUserOrderDataQuery,
  ContractorOrderData,
} from "../../store/orders"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Link } from "react-router-dom"

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
      <Section xs={12}>
        <Grid item xs={12}>
          <Typography
            variant={"subtitle1"}
            color={"text.primary"}
            fontWeight={"bold"}
          >
            {t("orderTrend.order_count_daily")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <DynamicApexChart
            type="line"
            series={[
              {
                name: t("orderTrend.orders_daily"),
                data: dailyOrdersData,
              },
            ]}
            options={{
              chart: {
                type: "line",
                toolbar: { show: false },
              },
              xaxis: {
                type: "datetime",
              },
              yaxis: {
                title: { text: t("orderTrend.orders_daily") },
              },
              stroke: { curve: "smooth" },
            }}
          />
        </Grid>
      </Section>

      <Section xs={12}>
        <Grid item xs={12}>
          <Typography
            variant={"subtitle1"}
            color={"text.primary"}
            fontWeight={"bold"}
          >
            {t("orderTrend.order_value_daily")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <DynamicApexChart
            type="line"
            series={[
              {
                name: "Value (aUEC)",
                data: dailyValueData,
              },
            ]}
            options={{
              chart: {
                type: "line",
                toolbar: { show: false },
              },
              xaxis: {
                type: "datetime",
              },
              yaxis: {
                title: { text: "Value (aUEC)" },
              },
              stroke: { curve: "smooth" },
            }}
          />
        </Grid>
      </Section>

      <Section xs={12}>
        <Grid item xs={12}>
          <Typography
            variant={"subtitle1"}
            color={"text.primary"}
            fontWeight={"bold"}
          >
            {t("orderTrend.status_trends")}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <DynamicApexChart
            type="line"
            series={statusTrendsData}
            options={{
              chart: {
                type: "line",
                toolbar: { show: false },
              },
              xaxis: {
                type: "datetime",
              },
              yaxis: {
                title: { text: "Order Count" },
              },
              stroke: { curve: "smooth" },
            }}
          />
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
          {/* @ts-ignore */}
          <DynamicApexChart
            width={"100%"}
            height={400}
            type={"area"}
            options={{
              xaxis: {
                type: "datetime",
                labels: {
                  format: "yy/MM/dd",
                },
              },
              yaxis: {
                forceNiceScale: true,
                min: 0,
              },
              dataLabels: {
                enabled: false,
              },
              stroke: {
                curve: "smooth",
              },
              fill: {
                type: "gradient",
                gradient: {
                  shadeIntensity: 1,
                  inverseColors: false,
                  opacityFrom: 0.45,
                  opacityTo: 0.05,
                  stops: [20, 100, 100, 100],
                },
              },
              tooltip: {
                x: {
                  format: "yy/MM/dd",
                },
              },
            }}
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
                ][i],
                data,
              })),
            ]}
          />
        </Grid>
      </Section>

      <Section xs={12} title={t("orderTrend.order_count_weekly")}>
        <Grid item xs={12}>
          {/* @ts-ignore */}
          <DynamicApexChart
            width={"100%"}
            height={400}
            type={"area"}
            options={{
              xaxis: {
                type: "datetime",
                labels: {
                  format: "yy/MM/dd",
                },
              },
              yaxis: {
                forceNiceScale: true,
                min: 0,
              },
              dataLabels: {
                enabled: false,
              },
              stroke: {
                curve: "smooth",
              },
              fill: {
                type: "gradient",
                gradient: {
                  shadeIntensity: 1,
                  inverseColors: false,
                  opacityFrom: 0.45,
                  opacityTo: 0.05,
                  stops: [20, 100, 100, 100],
                },
              },
              tooltip: {
                x: {
                  format: "yy/MM/dd",
                },
              },
            }}
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
                ][i],
                data,
              })),
            ]}
          />
        </Grid>
      </Section>

      <Section xs={12} title={t("orderTrend.order_count_monthly")}>
        <Grid item xs={12}>
          {/* @ts-ignore */}
          <DynamicApexChart
            width={"100%"}
            height={400}
            type={"area"}
            options={{
              xaxis: {
                type: "datetime",
                labels: {
                  format: "MM/yy",
                },
              },
              yaxis: {
                forceNiceScale: true,
                min: 0,
              },
              dataLabels: {
                enabled: false,
              },
              stroke: {
                curve: "smooth",
              },
              fill: {
                type: "gradient",
                gradient: {
                  shadeIntensity: 1,
                  inverseColors: false,
                  opacityFrom: 0.45,
                  opacityTo: 0.05,
                  stops: [20, 100, 100, 100],
                },
              },
              tooltip: {
                x: {
                  format: "MM/yy",
                },
              },
            }}
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
                ][i],
                data,
              })),
            ]}
          />
        </Grid>
      </Section>
    </>
  )
}

export function OrgOrderTrend() {
  const [contractor] = useCurrentOrg()
  const { data: orderData } = useGetContractorOrderDataQuery(
    {
      spectrum_id: contractor?.spectrum_id!,
      include_trends: true,
      assigned_only: false,
    },
    {
      skip: !contractor?.spectrum_id,
    },
  )

  // Use metrics trend data if available, otherwise fall back to recent orders
  if (orderData?.metrics?.trend_data) {
    return <OrderTrendFromMetrics data={orderData} />
  }

  // Fallback to original implementation with recent orders
  return <OrderTrendFromOrders orders={orderData?.recent_orders || []} />
}

export function UserOrderTrend() {
  const [contractor] = useCurrentOrg()

  // Use contractor data if user is in an organization
  const { data: contractorOrderData } = useGetContractorOrderDataQuery(
    {
      spectrum_id: contractor?.spectrum_id!,
      include_trends: true,
      assigned_only: true,
    },
    {
      skip: !contractor?.spectrum_id,
    },
  )

  // Use user data if user is not in an organization
  const { data: userOrderData } = useGetUserOrderDataQuery(
    {
      include_trends: true,
    },
    {
      skip: !!contractor?.spectrum_id,
    },
  )

  // Use the appropriate data source
  const orderData = contractorOrderData || userOrderData

  // Use metrics trend data if available, otherwise fall back to recent orders
  if (orderData?.metrics?.trend_data) {
    return <OrderTrendFromMetrics data={orderData} />
  }

  // Fallback to original implementation with recent orders
  return <OrderTrendFromOrders orders={orderData?.recent_orders || []} />
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
              to={`/contractor/${c.name}`}
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
              to={`/user/${c.name}`}
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
              to={`/user/${c.name}`}
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
              to={`/user/${c.name}`}
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
