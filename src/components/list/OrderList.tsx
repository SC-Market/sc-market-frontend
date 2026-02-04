import {
  Avatar,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from "@mui/material"
import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import { Order } from "../../datatypes/Order"

export function OrderListItem(props: { order: Order }) {
  const { order } = props
  // Use customer_minimal data from the order instead of making a separate API call
  const customer = (order as Order & { customer_minimal?: unknown })
    .customer_minimal

  return (
    <ListItemButton component={Link} to={`/contract/${order.order_id}`}>
      <ListItemAvatar>
        <Avatar
          variant={"rounded"}
          src={customer?.avatar}
          alt={`Avatar of ${customer?.username}`}
        />
      </ListItemAvatar>
      <ListItemText>{order.title}</ListItemText>
    </ListItemButton>
  )
}

export function OrderList(props: { title?: string | null; orders: Order[] }) {
  const orders = useMemo(() => props.orders.filter((o) => o), [props.orders])

  return (
    <List
      subheader={
        props.title ? <ListSubheader>{props.title}</ListSubheader> : undefined
      }
      sx={{ width: "100%" }}
    >
      {orders.map((o, i) => (
        <OrderListItem order={o} key={i} />
      ))}
    </List>
  )
}
