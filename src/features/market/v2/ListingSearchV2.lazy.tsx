import { lazyWithPreload } from "../../../util/lazyWithRetry"

/**
 * The /market search page (MarketV2Routes). Preloaded with the page by
 * MarketRouter, so the first load goes from the route skeleton straight to
 * the page instead of through MarketPageV2's own Suspense fallback.
 */
export const ListingSearchV2 = lazyWithPreload(() =>
  import("./ListingSearchV2").then((m) => ({ default: m.ListingSearchV2 })),
)
