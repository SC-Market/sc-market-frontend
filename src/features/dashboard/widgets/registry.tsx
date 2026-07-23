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
import { UserOrderTrendChart } from "../../../views/orders/OrderTrend"
import { ReceivedOffersArea } from "../../../views/offers/ReceivedOffersArea"
import { MatchingBuyOrdersArea } from "../../../features/market/views/MatchingBuyOrdersArea"
import { SellerAnalyticsV2 } from "../../../features/market/v2/components/SellerAnalyticsV2"
import { MarketOverviewWidget } from "./MarketOverviewWidget"
import { ReputationWidget } from "./ReputationWidget"
import { WishlistWidget } from "./WishlistWidget"
import { PriceHistoryWidget } from "./PriceHistoryWidget"
import { ListingsPreviewWidget } from "./ListingsPreviewWidget"
import { ActivityFeedWidget } from "./ActivityFeedWidget"
import { ListingAnalyticsWidget } from "./ListingAnalyticsWidget"
import type { ResolvedScope } from "../useResolveScope"
import type { DashboardWidget, WidgetLayout, WidgetScopeKind } from "../types"

export interface WidgetRenderProps {
  scope: ResolvedScope
  settings?: DashboardWidget["settings"]
  /** Translator, passed so widget render fns can localize their own labels. */
  t: TFunction
}

/**
 * Schematic shape shown for a widget in the add-widget gallery. Not the real
 * widget — a lightweight approximation of its layout so the user can recognize
 * what they're adding without resolving live data.
 */
export type WidgetPreviewKind =
  | "metrics"
  | "chart"
  | "table"
  | "list"
  | "cards"

/** Grouping used to organize widgets into titled subsections in the gallery. */
export type WidgetCategory = "orders" | "market" | "activity" | "personal"

/** Display order of the gallery's category subsections. */
export const WIDGET_CATEGORY_ORDER: WidgetCategory[] = [
  "orders",
  "market",
  "activity",
  "personal",
]

/** Localized titles for each gallery subsection. */
export const WIDGET_CATEGORY_LABELS: Record<
  WidgetCategory,
  { key: string; default: string }
> = {
  orders: { key: "dashboard.category.orders", default: "Orders & Fulfillment" },
  market: { key: "dashboard.category.market", default: "Market & Listings" },
  activity: { key: "dashboard.category.activity", default: "Activity" },
  personal: { key: "dashboard.category.personal", default: "Personal" },
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
  /**
   * Minimum grid size (columns × rows) below which the widget's content stops
   * rendering usefully. Applied as react-grid-layout minW/minH on resize.
   * Falls back to DEFAULT_MIN_SIZE when omitted.
   */
  minSize?: Pick<WidgetLayout, "w" | "h">
  /** Scope bindings this widget supports. */
  allowedScopes: WidgetScopeKind[]
  /**
   * When true, the add-widget gallery requires a game item to be picked and
   * stores it as settings.gameItemId / settings.gameItemName.
   */
  requiresItem?: boolean
  /**
   * When true, the add-widget gallery offers a listings source: either a
   * free-text search (settings.query) or a specific game item
   * (settings.gameItemId / settings.gameItemName). Exactly one is stored.
   */
  requiresListingsSource?: boolean
  /**
   * When true, the add-widget gallery offers an optional activity-type filter
   * stored as settings.action (empty = all activity).
   */
  offersActivityFilter?: boolean
  /**
   * When true, the widget's render() already provides its own card + title
   * (a Section or equivalent Paper). WidgetWrapper renders it as-is — no wrapper
   * card and no wrapper header — so there's a single header, not two. Bare
   * widgets (the default) are given a standard Section-styled titled card.
   */
  selfChrome?: boolean
  /** Gallery subsection this widget is grouped under. */
  category: WidgetCategory
  /** Schematic layout shown for this widget in the add-widget gallery. */
  preview: WidgetPreviewKind
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

/** Floor applied to any widget that doesn't declare its own minSize. */
export const DEFAULT_MIN_SIZE: Pick<WidgetLayout, "w" | "h"> = { w: 2, h: 2 }

/**
 * Minimum grid size for a widget type, never larger than its default size so a
 * freshly-added widget is always valid. Unknown types fall back to the default.
 */
export function widgetMinSize(type: string): Pick<WidgetLayout, "w" | "h"> {
  const def = REGISTRY.get(type)
  if (!def) return DEFAULT_MIN_SIZE
  const min = def.minSize ?? DEFAULT_MIN_SIZE
  return {
    w: Math.min(min.w, def.defaultLayout.w),
    h: Math.min(min.h, def.defaultLayout.h),
  }
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
    minSize: { w: 2, h: 3 },
    allowedScopes: METRIC_SCOPES,
    selfChrome: true,
    category: "orders",
    preview: "metrics",
    render: ({ scope }) => (
      <OrderMetrics spectrumId={scope.spectrumId} shopId={scope.shopId} />
    ),
  },
  {
    type: "order_count_trend",
    titleKey: "dashboard.widgets.orderCountTrend.title",
    titleDefault: "Order Count Trend",
    descriptionKey: "dashboard.widgets.orderCountTrend.description",
    descriptionDefault: "Daily order count over time.",
    defaultLayout: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    allowedScopes: METRIC_SCOPES,
    selfChrome: true,
    category: "orders",
    preview: "chart",
    render: ({ scope }) => (
      <UserOrderTrendChart
        metric="count"
        spectrumId={scope.spectrumId}
        shopId={scope.shopId}
      />
    ),
  },
  {
    type: "order_value_trend",
    titleKey: "dashboard.widgets.orderValueTrend.title",
    titleDefault: "Order Value Trend",
    descriptionKey: "dashboard.widgets.orderValueTrend.description",
    descriptionDefault: "Daily order value (aUEC) over time.",
    defaultLayout: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    allowedScopes: METRIC_SCOPES,
    selfChrome: true,
    category: "orders",
    preview: "chart",
    render: ({ scope }) => (
      <UserOrderTrendChart
        metric="value"
        spectrumId={scope.spectrumId}
        shopId={scope.shopId}
      />
    ),
  },
  {
    type: "order_status_trend",
    titleKey: "dashboard.widgets.orderStatusTrend.title",
    titleDefault: "Order Status Trend",
    descriptionKey: "dashboard.widgets.orderStatusTrend.description",
    descriptionDefault: "Daily order count broken down by status.",
    defaultLayout: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    allowedScopes: METRIC_SCOPES,
    selfChrome: true,
    category: "orders",
    preview: "chart",
    render: ({ scope }) => (
      <UserOrderTrendChart
        metric="status"
        spectrumId={scope.spectrumId}
        shopId={scope.shopId}
      />
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
    minSize: { w: 4, h: 3 },
    allowedScopes: SHOP_SCOPES,
    selfChrome: true,
    category: "orders",
    preview: "table",
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
    minSize: { w: 4, h: 3 },
    allowedScopes: SHOP_SCOPES,
    selfChrome: true,
    category: "orders",
    preview: "table",
    render: ({ scope }) => <ReceivedOffersArea unassigned={!!scope.shopId} />,
  },
  {
    type: "matching_buy_orders",
    titleKey: "dashboard.widgets.matchingBuyOrders.title",
    titleDefault: "Matching Buy Orders",
    descriptionKey: "dashboard.widgets.matchingBuyOrders.description",
    descriptionDefault: "Open buy orders your inventory can fulfill.",
    defaultLayout: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    allowedScopes: PERSONAL_ONLY,
    selfChrome: true,
    category: "market",
    preview: "table",
    render: () => <MatchingBuyOrdersArea showEmpty />,
  },
  {
    type: "notifications",
    titleKey: "dashboard.widgets.notifications.title",
    titleDefault: "Notifications",
    descriptionKey: "dashboard.widgets.notifications.description",
    descriptionDefault: "Your recent activity and notifications.",
    defaultLayout: { w: 3, h: 5 },
    minSize: { w: 3, h: 3 },
    allowedScopes: SHOP_SCOPES,
    selfChrome: true,
    category: "activity",
    preview: "list",
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
    minSize: { w: 4, h: 4 },
    allowedScopes: SHOP_SCOPES,
    selfChrome: true,
    category: "market",
    preview: "chart",
    render: ({ scope }) => (
      <Grid container spacing={2}>
        <SellerAnalyticsV2 sellerId={scope.shopId} />
      </Grid>
    ),
  },
  {
    type: "market_overview",
    titleKey: "dashboard.widgets.marketOverview.title",
    titleDefault: "Market Overview",
    descriptionKey: "dashboard.widgets.marketOverview.description",
    descriptionDefault: "Top items across the market by availability.",
    defaultLayout: { w: 6, h: 5 },
    minSize: { w: 4, h: 3 },
    allowedScopes: PERSONAL_ONLY,
    category: "market",
    preview: "list",
    render: ({ settings, t }) => (
      <MarketOverviewWidget settings={settings} t={t} />
    ),
  },
  {
    type: "reputation",
    titleKey: "dashboard.widgets.reputation.title",
    titleDefault: "Reputation",
    descriptionKey: "dashboard.widgets.reputation.description",
    descriptionDefault: "Your seller rating, streak, order volume, and badges.",
    defaultLayout: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    allowedScopes: PERSONAL_ONLY,
    category: "personal",
    preview: "metrics",
    render: ({ t }) => <ReputationWidget t={t} />,
  },
  {
    type: "wishlist",
    titleKey: "dashboard.widgets.wishlist.title",
    titleDefault: "Shopping Lists",
    descriptionKey: "dashboard.widgets.wishlist.description",
    descriptionDefault: "Your shopping lists and how close each is to complete.",
    defaultLayout: { w: 3, h: 4 },
    minSize: { w: 2, h: 3 },
    allowedScopes: PERSONAL_ONLY,
    category: "personal",
    preview: "list",
    render: ({ t }) => <WishlistWidget t={t} />,
  },
  {
    type: "price_history",
    titleKey: "dashboard.widgets.priceHistory.title",
    titleDefault: "Price History",
    descriptionKey: "dashboard.widgets.priceHistory.description",
    descriptionDefault: "Price trend over time for a specific item.",
    defaultLayout: { w: 6, h: 5 },
    minSize: { w: 4, h: 3 },
    allowedScopes: PERSONAL_ONLY,
    requiresItem: true,
    category: "market",
    preview: "chart",
    render: ({ settings, t }) => (
      <PriceHistoryWidget settings={settings} t={t} />
    ),
  },
  {
    type: "listings_preview",
    titleKey: "dashboard.widgets.listingsPreview.title",
    titleDefault: "Listings Preview",
    descriptionKey: "dashboard.widgets.listingsPreview.description",
    descriptionDefault:
      "A few marketplace listings for a search or a specific item.",
    defaultLayout: { w: 6, h: 5 },
    minSize: { w: 3, h: 4 },
    allowedScopes: PERSONAL_ONLY,
    requiresListingsSource: true,
    category: "market",
    preview: "cards",
    render: ({ settings, t }) => (
      <ListingsPreviewWidget settings={settings} t={t} />
    ),
  },
  {
    type: "activity_feed",
    titleKey: "dashboard.widgets.activityFeed.title",
    titleDefault: "Activity Feed",
    descriptionKey: "dashboard.widgets.activityFeed.description",
    descriptionDefault:
      "A timeline of recent activity, optionally filtered to one type.",
    defaultLayout: { w: 4, h: 5 },
    minSize: { w: 3, h: 3 },
    allowedScopes: SHOP_SCOPES,
    offersActivityFilter: true,
    category: "activity",
    preview: "list",
    render: ({ scope, settings, t }) => (
      <ActivityFeedWidget scope={scope} settings={settings} t={t} />
    ),
  },
  {
    type: "listing_analytics",
    titleKey: "dashboard.widgets.listingAnalytics.title",
    titleDefault: "Listing Analytics",
    descriptionKey: "dashboard.widgets.listingAnalytics.description",
    descriptionDefault:
      "Per-listing views, cart adds, orders, sales, and conversion rate.",
    defaultLayout: { w: 6, h: 5 },
    minSize: { w: 4, h: 3 },
    allowedScopes: SHOP_SCOPES,
    category: "market",
    preview: "table",
    render: ({ scope, settings, t }) => (
      <ListingAnalyticsWidget scope={scope} settings={settings} t={t} />
    ),
  },
]

/**
 * Activity-type options offered by the Activity Feed widget's filter. Each maps
 * to a NotificationAction value the notifications API accepts. An empty value
 * (rendered as "All activity" in the gallery) means no server-side filter.
 */
export const ACTIVITY_FILTER_OPTIONS: {
  value: string
  labelKey: string
  labelDefault: string
}[] = [
  { value: "", labelKey: "dashboard.activityFeed.all", labelDefault: "All activity" },
  {
    value: "order_create",
    labelKey: "dashboard.activityFeed.orders",
    labelDefault: "New orders",
  },
  {
    value: "offer_create",
    labelKey: "dashboard.activityFeed.offers",
    labelDefault: "Offers",
  },
  {
    value: "market_item_bid_v2",
    labelKey: "dashboard.activityFeed.bids",
    labelDefault: "Bids",
  },
  {
    value: "order_review",
    labelKey: "dashboard.activityFeed.reviews",
    labelDefault: "Reviews",
  },
]

const REGISTRY = new Map(WIDGET_DEFINITIONS.map((d) => [d.type, d]))

export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return REGISTRY.get(type)
}
