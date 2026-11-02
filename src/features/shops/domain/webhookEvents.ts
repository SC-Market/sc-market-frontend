/**
 * The events a shop webhook can send; each one is sent by the API.
 * Labels and descriptions are translated in ShopSettings
 * (shopsUi.webhooks.actions.*).
 */
export const WEBHOOK_ACTIONS: {
  action_name: string
}[] = [
  { action_name: "order_create" },
  { action_name: "order_assigned" },
  { action_name: "order_status_change" },
  { action_name: "order_review" },
  { action_name: "market_item_bid" },
  { action_name: "public_contract_create" },
]
