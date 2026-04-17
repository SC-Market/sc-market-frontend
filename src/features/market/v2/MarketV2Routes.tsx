import React from "react"

// Main V2 listing search component
const ListingSearchV2 = React.lazy(() =>
  import("./ListingSearchV2").then((m) => ({ default: m.ListingSearchV2 })),
)

/**
 * MarketV2Routes - Route definitions for Market V2
 *
 * This component defines routes for the V2 market system that are handled
 * through the MarketRouter feature flag switching.
 * 
 * NOTE: Currently, only the base /market route goes through MarketRouter.
 * Other routes like /market/create, /market/cart are hardcoded in App.tsx
 * to V1 components. This means V2 currently only handles the main listing
 * search view. Full V2 routing requires updating App.tsx to route all
 * market paths through MarketRouter.
 * 
 * For now, this renders the main listing search (ListingSearchV2) which
 * provides the core V2 experience with quality tier filtering.
 */
export function MarketV2Routes() {
  // For now, just render the main listing search
  // This is what users see when they visit /market with V2 enabled
  return <ListingSearchV2 />
}
