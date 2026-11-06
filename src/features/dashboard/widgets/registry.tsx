/**
 * Widget registry — maps a widget `type` to its component, metadata, default grid
 * size, and which scope bindings it supports. The customizable dashboard renders
 * only widgets present here; unknown types in a saved config are ignored.
 *
 * Launch widgets (M2) wrap the existing dashboard components unchanged. Each is
 * rendered inside WidgetWrapper, which passes the resolved scope down.
 */

import { Grid } from "@mui/material"
import AssignmentIcon from "@mui/icons-material/AssignmentRounded"
import LocalOfferIcon from "@mui/icons-material/LocalOfferRounded"
import QueryStatsIcon from "@mui/icons-material/QueryStatsRounded"
import ShowChartIcon from "@mui/icons-material/ShowChartRounded"
import StackedLineChartIcon from "@mui/icons-material/StackedLineChartRounded"
import PaidIcon from "@mui/icons-material/PaidRounded"
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckoutRounded"
import NotificationsIcon from "@mui/icons-material/NotificationsRounded"
import InsightsIcon from "@mui/icons-material/InsightsRounded"
import StorefrontIcon from "@mui/icons-material/StorefrontRounded"
import MilitaryTechIcon from "@mui/icons-material/MilitaryTechRounded"
import ChecklistIcon from "@mui/icons-material/ChecklistRounded"
import TimelineIcon from "@mui/icons-material/TimelineRounded"
import ViewCarouselIcon from "@mui/icons-material/ViewCarouselRounded"
import RssFeedIcon from "@mui/icons-material/RssFeedRounded"
import TableChartIcon from "@mui/icons-material/TableChartRounded"
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
import type { WidgetLayout, WidgetScopeKind } from "../types"
import { type WidgetDefinition, DEFAULT_MIN_SIZE } from "./widgetDefinition"
// The widget contract lives in widgetDefinition.ts; importers use this module.
export type {
  WidgetRenderProps,
  WidgetPreviewKind,
  WidgetCategory,
  WidgetDefinition,
} from "./widgetDefinition"
export {
  WIDGET_CATEGORY_ORDER,
  WIDGET_CATEGORY_LABELS,
  widgetTitle,
  widgetDescription,
  DEFAULT_MIN_SIZE,
} from "./widgetDefinition"

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
    icon: QueryStatsIcon,
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
    icon: ShowChartIcon,
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
    icon: PaidIcon,
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
    icon: StackedLineChartIcon,
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
    // The underlying ControlledTable always renders a fixed page (5 rows padded
    // to a constant height) plus title/tabs/pagination chrome — a deterministic
    // ~658px tall. Size the cell to fit that exactly so nothing scrolls:
    // h:7 → 7*80 + 6*16 = 656px. minH keeps a resize from crushing it.
    defaultLayout: { w: 6, h: 7 },
    minSize: { w: 4, h: 5 },
    allowedScopes: SHOP_SCOPES,
    selfChrome: true,
    category: "orders",
    preview: "table",
    icon: AssignmentIcon,
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
    // Same fixed-page ControlledTable as `orders` — a deterministic ~614px tall.
    // Size the cell to fit it exactly so nothing scrolls (h:7 → 656px), matching
    // the `orders` widget so the two line up when placed side by side.
    defaultLayout: { w: 6, h: 7 },
    minSize: { w: 4, h: 5 },
    allowedScopes: SHOP_SCOPES,
    selfChrome: true,
    category: "orders",
    preview: "table",
    icon: LocalOfferIcon,
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
    icon: ShoppingCartCheckoutIcon,
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
    icon: NotificationsIcon,
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
    icon: InsightsIcon,
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
    icon: StorefrontIcon,
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
    icon: MilitaryTechIcon,
    render: ({ t }) => <ReputationWidget t={t} />,
  },
  {
    type: "wishlist",
    titleKey: "dashboard.widgets.wishlist.title",
    titleDefault: "Shopping Lists",
    descriptionKey: "dashboard.widgets.wishlist.description",
    descriptionDefault:
      "Your shopping lists and how close each is to complete.",
    defaultLayout: { w: 3, h: 4 },
    minSize: { w: 2, h: 3 },
    allowedScopes: PERSONAL_ONLY,
    category: "personal",
    preview: "list",
    icon: ChecklistIcon,
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
    icon: TimelineIcon,
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
    icon: ViewCarouselIcon,
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
    icon: RssFeedIcon,
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
    icon: TableChartIcon,
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
  {
    value: "",
    labelKey: "dashboard.activityFeed.all",
    labelDefault: "All activity",
  },
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

export function getWidgetDefinition(
  type: string,
): WidgetDefinition | undefined {
  return REGISTRY.get(type)
}
