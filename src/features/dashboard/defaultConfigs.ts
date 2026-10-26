/**
 * Seed layouts for dashboards with nothing saved yet. Also what the dashboard
 * skeleton draws while the real config loads.
 */
import type { DashboardConfig } from "./types"

/** Default layout for a fresh personal dashboard — mirrors the legacy widgets. */
export function defaultPersonalConfig(): DashboardConfig {
  return {
    version: 1,
    widgets: [
      { id: "seed-metrics", type: "order_metrics", scope: { kind: "me" }, layout: { x: 0, y: 0, w: 3, h: 4 } },
      { id: "seed-notifications", type: "notifications", scope: { kind: "me" }, layout: { x: 0, y: 4, w: 3, h: 5 } },
      { id: "seed-offers", type: "offers", scope: { kind: "me" }, layout: { x: 3, y: 0, w: 9, h: 5 } },
      { id: "seed-orders", type: "orders", scope: { kind: "me" }, layout: { x: 3, y: 5, w: 9, h: 5 } },
      { id: "seed-buy-orders", type: "matching_buy_orders", scope: { kind: "me" }, layout: { x: 3, y: 10, w: 9, h: 4 } },
      { id: "seed-count-trend", type: "order_count_trend", scope: { kind: "me" }, layout: { x: 3, y: 14, w: 9, h: 4 } },
    ],
  }
}

/**
 * Default layout for a fresh shared (org/shop) dashboard. Owner-relative scopes
 * resolve to the owner, so `current_context` binds the widgets to this org/shop.
 * Personal-only widgets (matching_buy_orders) are omitted.
 */
export function defaultSharedConfig(): DashboardConfig {
  return {
    version: 1,
    widgets: [
      { id: "seed-metrics", type: "order_metrics", scope: { kind: "current_context" }, layout: { x: 0, y: 0, w: 3, h: 4 } },
      { id: "seed-offers", type: "offers", scope: { kind: "current_context" }, layout: { x: 3, y: 0, w: 9, h: 5 } },
      { id: "seed-orders", type: "orders", scope: { kind: "current_context" }, layout: { x: 3, y: 5, w: 9, h: 5 } },
      { id: "seed-count-trend", type: "order_count_trend", scope: { kind: "current_context" }, layout: { x: 3, y: 10, w: 9, h: 4 } },
    ],
  }
}
