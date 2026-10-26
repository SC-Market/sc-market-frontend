/** The events a shop webhook can send; each one is sent by the API. */
export const WEBHOOK_ACTIONS: {
  label: string
  description: string
  action_name: string
}[] = [
  {
    label: "Order Created",
    description: "A new order or offer for this shop",
    action_name: "order_create",
  },
  {
    label: "Order Assigned",
    description: "An order is assigned to or claimed by a member",
    action_name: "order_assigned",
  },
  {
    label: "Order Status Change",
    description:
      "An order moves to in progress, fulfilled, cancelled or not started",
    action_name: "order_status_change",
  },
  {
    label: "Order Review",
    description: "A review is left on one of this shop's orders",
    action_name: "order_review",
  },
  {
    label: "Market Bid",
    description: "A new bid on one of this shop's auctions",
    action_name: "market_item_bid",
  },
  {
    label: "New public contracts (site-wide)",
    description: "Every new public contract posted on SC Market, by anyone",
    action_name: "public_contract_create",
  },
]
