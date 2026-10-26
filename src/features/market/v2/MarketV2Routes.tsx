import React from "react"
import { useLocation, useParams } from "react-router-dom"
import { useFeatureFlag } from "../../../hooks/market/useFeatureFlag"
import { lazyWithRetry } from "../../../util/lazyWithRetry"

// Lazy-loaded V2 components
const ListingSearchV2 = lazyWithRetry(() =>
  import("./ListingSearchV2").then((m) => ({ default: m.ListingSearchV2 })),
)
// Phase 0 redesign (behind the `market_v2_redesign` flag) — see MARKET_V2_RESEARCH.md §7
const ListingDetailRedesign = lazyWithRetry(() =>
  import("./redesign/ListingDetailRedesign").then((m) => ({
    default: m.ListingDetailRedesign,
  })),
)
const SellFormRedesign = lazyWithRetry(() =>
  import("./redesign/SellFormRedesign").then((m) => ({
    default: m.SellFormRedesign,
  })),
)
const ManageMarketRedesign = lazyWithRetry(() =>
  import("./redesign/ManageMarketRedesign").then((m) => ({
    default: m.ManageMarketRedesign,
  })),
)
const BuyOrdersRedesign = lazyWithRetry(() =>
  import("./redesign/BuyOrdersRedesign").then((m) => ({
    default: m.BuyOrdersRedesign,
  })),
)
const ListingDetailV2 = lazyWithRetry(() =>
  import("./ListingDetailV2").then((m) => ({ default: m.ListingDetailV2 })),
)
const MarketAggregateViewV2 = lazyWithRetry(() =>
  import("./MarketAggregateViewV2").then((m) => ({
    default: m.MarketAggregateViewV2,
  })),
)
const MarketMultipleViewV2 = lazyWithRetry(() =>
  import("./MarketMultipleViewV2").then((m) => ({
    default: m.MarketMultipleViewV2,
  })),
)
const CreateListingV2 = lazyWithRetry(() =>
  import("./CreateListingV2").then((m) => ({ default: m.CreateListingV2 })),
)
const MyListingsV2 = lazyWithRetry(() =>
  import("./MyListingsV2").then((m) => ({ default: m.MyListingsV2 })),
)
const StockManagerV2 = lazyWithRetry(() =>
  import("./StockManagerV2").then((m) => ({ default: m.StockManagerV2 })),
)
const BulkStockManagementV2 = lazyWithRetry(() =>
  import("./BulkStockManagementV2").then((m) => ({
    default: m.BulkStockManagementV2,
  })),
)
const BulkItemsPageV2 = lazyWithRetry(() =>
  import("./BulkItemsPageV2").then((m) => ({
    default: m.BulkItemsPageV2,
  })),
)
const MarketCartV2 = lazyWithRetry(() =>
  import("./MarketCartV2").then((m) => ({ default: m.MarketCartV2 })),
)
const EditListingV2 = lazyWithRetry(() =>
  import("./EditListingV2").then((m) => ({ default: m.EditListingV2 })),
)
const BuyOrdersViewV2 = lazyWithRetry(() =>
  import("./BuyOrdersViewV2").then((m) => ({ default: m.BuyOrdersViewV2 })),
)

/**
 * MarketV2Routes - Routes all V2 market paths to the correct component.
 *
 * Uses pathname matching to determine which V2 component to render.
 * All routes flow through MarketRouter → MarketPageV2 → MarketV2Routes.
 */
export function MarketV2Routes() {
  const { pathname } = useLocation()
  const params = useParams()
  const { flags } = useFeatureFlag()

  // Phase 0 redesign: the main search/browse grid now self-adapts inside
  // ListingSearchV2 via the market_v2_redesign flag (grouped fungible items +
  // real ListingCardV2), so /market and /market/category/* always render the
  // real search page. No standalone search route.

  // Phase 0 redesign: route the remaining market surfaces to their redesign
  // components when the flag is on. Everything below (flag off) is untouched.
  if (flags.market_v2_redesign) {
    // Sell wizard — create mode only (one adaptive form, §8.5).
    if (pathname.startsWith("/market/create")) {
      return <SellFormRedesign />
    }
    // Edit is NOT handled by SellFormRedesign: the update contract is a diff
    // against existing variant/lot IDs (variant_prices/lot_updates), which the
    // create-shaped form can't express — routing edit here would silently
    // create a duplicate listing. EditListingV2 already does update correctly
    // with full variant parity, so edit falls through to it below (flag on or
    // off). Revisit once the Sell form gains a real update path (§8.6).

    // Manage Market — one page for listings + stock (§8.4)
    if (
      pathname === "/market/manage" ||
      pathname === "/market/manage-stock" ||
      pathname === "/market/me" ||
      pathname.startsWith("/market/stock/")
    ) {
      return <ManageMarketRedesign />
    }

    // Buy orders (demand side)
    if (pathname === "/buyorders") {
      return <BuyOrdersRedesign />
    }

    // Listing detail (/market/:id) — after all other /market/xxx paths
    if (pathname.match(/^\/market\/[^/]+$/) && params.id) {
      return <ListingDetailRedesign />
    }
  }

  // Edit routes
  if (pathname.startsWith("/market_edit/")) {
    return <EditListingV2 />
  }
  if (pathname.match(/^\/market\/multiple\/[^/]+\/edit$/)) {
    return <EditListingV2 />
  }

  // Aggregate detail
  if (pathname.startsWith("/market/aggregate/")) {
    return <MarketAggregateViewV2 />
  }

  // Multiple detail
  if (
    pathname.startsWith("/market/multiple/") &&
    !pathname.endsWith("/edit")
  ) {
    return <MarketMultipleViewV2 />
  }

  // Create listing
  if (pathname.startsWith("/market/create")) {
    return <CreateListingV2 />
  }

  // My listings
  if (pathname === "/market/me") {
    return <MyListingsV2 />
  }

  // Stock management for specific listing
  if (pathname.startsWith("/market/stock/")) {
    return (
      <StockManagerV2 />
    )
  }

  // Manage stock (overview)
  if (pathname === "/market/manage") {
    return <StockManagerV2 />
  }

  // Bulk stock management
  if (pathname === "/market/manage-stock") {
    return <BulkStockManagementV2 />
  }

  // Cart
  if (pathname === "/market/cart") {
    return <MarketCartV2 />
  }

  // Services (filtered search)
  // Category (filtered search)
  if (pathname.startsWith("/market/category/")) {
    return <ListingSearchV2 />
  }

  // Buy orders list
  if (pathname === "/buyorders") {
    return <BuyOrdersViewV2 />
  }

  // Bulk listings — game-item-level aggregates
  if (pathname === "/bulk") {
    return <BulkItemsPageV2 />
  }

  // Listing detail (/market/:id) — must be after all /market/xxx paths
  if (pathname.match(/^\/market\/[^/]+$/) && params.id) {
    return <ListingDetailV2 />
  }

  // Default: listing search
  return <ListingSearchV2 />
}
