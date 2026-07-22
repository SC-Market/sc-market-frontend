/**
 * Widget registry — maps a widget `type` to its component, metadata, default grid
 * size, and which scope bindings it supports. The customizable dashboard renders
 * only widgets present here; unknown types in a saved config are ignored.
 *
 * Launch widgets (M2) wrap the existing dashboard components unchanged. Each is
 * rendered inside WidgetWrapper, which passes the resolved scope down.
 */

import type { ReactNode } from "react"
import type { TFunction } from "i18next"
import { Grid } from "@mui/material"
import { OrderMetrics } from "../../../views/orders/OrderMetrics"
import { OrdersViewPaginated } from "../../../views/orders/OrderList"
import { DashNotificationArea } from "../../../views/notifications/DashNotificationArea"
import { UserOrderTrend } from "../../../views/orders/OrderTrend"
import { ReceivedOffersArea } from "../../../views/offers/ReceivedOffersArea"
import { MatchingBuyOrdersArea } from "../../../features/market/views/MatchingBuyOrdersArea"
import { SellerAnalyticsV2 } from "../../../features/market/v2/components/SellerAnalyticsV2"
import type { ResolvedScope } from "../useResolveScope"
import type { WidgetLayout, WidgetScopeKind } from "../types"

export interface WidgetRenderProps {
  scope: ResolvedScope
  settings?: Record<string, unknown>
  /** Translator, passed so widget render fns can localize their own labels. */
  t: TFunction
}

export interface WidgetDefinition {
  type: string
  /** i18n key for the display name (gallery + widget header). */
  titleKey: string
  /** English fallback for the title. */
  titleDefault: string
  /** i18n key for the short description shown in the gallery. */
  descriptionKey: string
  /** English fallback for the description. */
  descriptionDefault: string
  /** Default grid placement (x/y are assigned when added). */
  defaultLayout: Pick<WidgetLayout, "w" | "h">
  /** Scope bindings this widget supports. */
  allowedScopes: WidgetScopeKind[]
  render: (props: WidgetRenderProps) => ReactNode
}

/** Localized title for a widget definition. */
export function widgetTitle(def: WidgetDefinition, t: TFunction): string {
  return t(def.titleKey, def.titleDefault)
}

/** Localized description for a widget definition. */
export function widgetDescription(def: WidgetDefinition, t: TFunction): string {
  return t(def.descriptionKey, def.descriptionDefault)
}

// Scope binding sets reused across widgets.
// Metrics/trend widgets accept both an org (spectrumId) and a shop (shopId), so
// they support the full set including both aggregate kinds.
const METRIC_SCOPES: WidgetScopeKind[] = [
  "me",
  "current_context",
  "specific_org",
  "specific_shop",
  "all_orgs",
  "all_shops",
]
// Shop-oriented widgets only vary meaningfully by shop, so they allow all_shops
// (fan out per shop) but not all_orgs (which would duplicate identical output).
const SHOP_SCOPES: WidgetScopeKind[] = [
  "me",
  "current_context",
  "specific_shop",
  "all_shops",
]
const PERSONAL_ONLY: WidgetScopeKind[] = ["me"]

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    type: "order_metrics",
    titleKey: "dashboard.widgets.orderMetrics.title",
    titleDefault: "Order Metrics",
    descriptionKey: "dashboard.widgets.orderMetrics.description",
    descriptionDefault:
      "Active/completed order counts and value, plus top customers.",
    defaultLayout: { w: 3, h: 4 },
    allowedScopes: METRIC_SCOPES,
    render: ({ scope }) => (
      <OrderMetrics spectrumId={scope.spectrumId} shopId={scope.shopId} />
    ),
  },
  {
    type: "order_trend",
    titleKey: "dashboard.widgets.orderTrend.title",
    titleDefault: "Order Trend",
    descriptionKey: "dashboard.widgets.orderTrend.description",
    descriptionDefault: "Daily/weekly/monthly order count and value charts.",
    defaultLayout: { w: 6, h: 4 },
    allowedScopes: METRIC_SCOPES,
    render: ({ scope }) => (
      <UserOrderTrend spectrumId={scope.spectrumId} shopId={scope.shopId} />
    ),
  },
  {
    type: "orders",
    titleKey: "dashboard.widgets.orders.title",
    titleDefault: "Orders",
    descriptionKey: "dashboard.widgets.orders.description",
    descriptionDefault:
      "Paginated orders table (assignments, or a shop's orders).",
    defaultLayout: { w: 6, h: 5 },
    allowedScopes: SHOP_SCOPES,
    render: ({ scope, t }) =>
      scope.shopId ? (
        <OrdersViewPaginated
          title={t("dashboard.widgets.orders.title", "Orders")}
          shop_id={scope.shopId}
        />
      ) : (
        <OrdersViewPaginated
          title={t("dashboard.widgets.orders.assignments", "Assignments")}
          assigned
        />
      ),
  },
  {
    type: "offers",
    titleKey: "dashboard.widgets.offers.title",
    titleDefault: "Received Offers",
    descriptionKey: "dashboard.widgets.offers.description",
    descriptionDefault: "Incoming offers you can claim, merge, or respond to.",
    defaultLayout: { w: 6, h: 5 },
    allowedScopes: SHOP_SCOPES,
    render: ({ scope }) => <ReceivedOffersArea unassigned={!!scope.shopId} />,
  },
  {
    type: "matching_buy_orders",
    titleKey: "dashboard.widgets.matchingBuyOrders.title",
    titleDefault: "Matching Buy Orders",
    descriptionKey: "dashboard.widgets.matchingBuyOrders.description",
    descriptionDefault: "Open buy orders your inventory can fulfill.",
    defaultLayout: { w: 6, h: 4 },
    allowedScopes: PERSONAL_ONLY,
    render: () => <MatchingBuyOrdersArea />,
  },
  {
    type: "notifications",
    titleKey: "dashboard.widgets.notifications.title",
    titleDefault: "Notifications",
    descriptionKey: "dashboard.widgets.notifications.description",
    descriptionDefault: "Your recent activity and notifications.",
    defaultLayout: { w: 3, h: 5 },
    allowedScopes: SHOP_SCOPES,
    render: ({ scope }) => <DashNotificationArea shopId={scope.shopId} />,
  },
  {
    type: "seller_analytics",
    titleKey: "dashboard.widgets.sellerAnalytics.title",
    titleDefault: "Seller Analytics",
    descriptionKey: "dashboard.widgets.sellerAnalytics.description",
    descriptionDefault:
      "Sales volume, price, and inventory broken down by quality tier.",
    defaultLayout: { w: 6, h: 6 },
    allowedScopes: SHOP_SCOPES,
    render: ({ scope }) => (
      <Grid container spacing={2}>
        <SellerAnalyticsV2 sellerId={scope.shopId} />
      </Grid>
    ),
  },
]

const REGISTRY = new Map(WIDGET_DEFINITIONS.map((d) => [d.type, d]))

export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return REGISTRY.get(type)
}
