import { lazyWithPreload } from "../../util/lazyWithRetry"

/**
 * The /market/services body (MarketPageV2). Preloaded with the page by
 * MarketRouter, so the first load goes from the route skeleton straight to
 * the page instead of through MarketPageV2's own Suspense fallback.
 */
export const ServiceMarketView = lazyWithPreload(() =>
  import("./ServiceMarketView").then((m) => ({
    default: m.ServiceMarketView,
  })),
)
