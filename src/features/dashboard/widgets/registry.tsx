/**
 * Widget registry — maps a widget `type` to its component, metadata, default grid
 * size, and which scope bindings it supports. The customizable dashboard renders
 * only widgets present here; unknown types in a saved config are ignored.
 *
 * Launch widgets (M2) wrap the existing dashboard components unchanged. Each is
 * rendered inside WidgetWrapper, which passes the resolved scope down.
 */

import type { ReactNode } from "react"
import { OrderMetrics } from "../../../views/orders/OrderMetrics"
import { OrdersViewPaginated } from "../../../views/orders/OrderList"
import { DashNotificationArea } from "../../../views/notifications/DashNotificationArea"
import { UserOrderTrend } from "../../../views/orders/OrderTrend"
import { ReceivedOffersArea } from "../../../views/offers/ReceivedOffersArea"
import { MatchingBuyOrdersArea } from "../../../features/market/views/MatchingBuyOrdersArea"
import type { ResolvedScope } from "../useResolveScope"
import type { WidgetLayout, WidgetScopeKind } from "../types"

export interface WidgetRenderProps {
  scope: ResolvedScope
  settings?: Record<string, unknown>
}

export interface WidgetDefinition {
  type: string
  /** Display name in the "add widget" gallery and widget header. */
  title: string
  /** Short description shown in the gallery. */
  description: string
  /** Default grid placement (x/y are assigned when added). */
  defaultLayout: Pick<WidgetLayout, "w" | "h">
  /** Scope bindings this widget supports. */
  allowedScopes: WidgetScopeKind[]
  render: (props: WidgetRenderProps) => ReactNode
}

// Scope binding sets reused across widgets.
const ORDER_SCOPES: WidgetScopeKind[] = [
  "me",
  "current_context",
  "specific_org",
  "specific_shop",
  "all_orgs",
  "all_shops",
]
const PERSONAL_ONLY: WidgetScopeKind[] = ["me"]

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    type: "order_metrics",
    title: "Order Metrics",
    description: "Active/completed order counts and value, plus top customers.",
    defaultLayout: { w: 3, h: 4 },
    allowedScopes: ORDER_SCOPES,
    render: ({ scope }) => (
      <OrderMetrics spectrumId={scope.spectrumId} shopId={scope.shopId} />
    ),
  },
  {
    type: "order_trend",
    title: "Order Trend",
    description: "Daily/weekly/monthly order count and value charts.",
    defaultLayout: { w: 6, h: 4 },
    allowedScopes: ORDER_SCOPES,
    render: ({ scope }) => (
      <UserOrderTrend spectrumId={scope.spectrumId} shopId={scope.shopId} />
    ),
  },
  {
    type: "orders",
    title: "Orders",
    description: "Paginated orders table (assignments, or a shop's orders).",
    defaultLayout: { w: 6, h: 5 },
    allowedScopes: ["me", "current_context", "specific_shop"],
    render: ({ scope }) =>
      scope.shopId ? (
        <OrdersViewPaginated title="Orders" shop_id={scope.shopId} />
      ) : (
        <OrdersViewPaginated title="Assignments" assigned />
      ),
  },
  {
    type: "offers",
    title: "Received Offers",
    description: "Incoming offers you can claim, merge, or respond to.",
    defaultLayout: { w: 6, h: 5 },
    allowedScopes: ["me", "current_context", "specific_shop"],
    render: ({ scope }) => <ReceivedOffersArea unassigned={!!scope.shopId} />,
  },
  {
    type: "matching_buy_orders",
    title: "Matching Buy Orders",
    description: "Open buy orders your inventory can fulfill.",
    defaultLayout: { w: 6, h: 4 },
    allowedScopes: PERSONAL_ONLY,
    render: () => <MatchingBuyOrdersArea />,
  },
  {
    type: "notifications",
    title: "Notifications",
    description: "Your recent activity and notifications.",
    defaultLayout: { w: 3, h: 5 },
    allowedScopes: ["me", "current_context", "specific_shop"],
    render: ({ scope }) => <DashNotificationArea shopId={scope.shopId} />,
  },
]

const REGISTRY = new Map(WIDGET_DEFINITIONS.map((d) => [d.type, d]))

export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return REGISTRY.get(type)
}
