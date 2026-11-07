import { Section } from "../../components/paper/Section"
import { OrderStub } from "../../features/orders/domain/types"
import { useMemo } from "react"
import { List, ListItem } from "@mui/material"
import { useTranslation } from "react-i18next"
import { UnderlineLink } from "../../components/typography/UnderlineLink"
import { Link } from "react-router-dom"
import { ORG_PATHS, USER_PATHS } from "../../routes/paths"

export function TopContractors(props: { orders: OrderStub[] }) {
  const { orders } = props
  const { t } = useTranslation()
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
    <Section title={t("ordersUi.trend.topContractors")} xs={12} lg={3}>
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
  const { t } = useTranslation()
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
    <Section title={t("ordersUi.analytics.topUsers")} xs={12} lg={3}>
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
  const { t } = useTranslation()
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
    <Section title={t("ordersUi.trend.topUsersWeekly")} xs={12} lg={3}>
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
  const { t } = useTranslation()
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
    <Section title={t("ordersUi.trend.topUsersMonthly")} xs={12} lg={3}>
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
