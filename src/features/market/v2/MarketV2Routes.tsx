import React from "react"
import { useLocation, useParams } from "react-router-dom"

// Lazy-loaded V2 components
const ListingSearchV2 = React.lazy(() =>
  import("./ListingSearchV2").then((m) => ({ default: m.ListingSearchV2 })),
)
const ListingDetailV2 = React.lazy(() =>
  import("./ListingDetailV2").then((m) => ({ default: m.ListingDetailV2 })),
)
const MarketAggregateViewV2 = React.lazy(() =>
  import("./MarketAggregateViewV2").then((m) => ({
    default: m.MarketAggregateViewV2,
  })),
)
const MarketMultipleViewV2 = React.lazy(() =>
  import("./MarketMultipleViewV2").then((m) => ({
    default: m.MarketMultipleViewV2,
  })),
)
const CreateListingV2 = React.lazy(() =>
  import("./CreateListingV2").then((m) => ({ default: m.CreateListingV2 })),
)
const MyListingsV2 = React.lazy(() =>
  import("./MyListingsV2").then((m) => ({ default: m.MyListingsV2 })),
)
const StockManagerV2 = React.lazy(() =>
  import("./StockManagerV2").then((m) => ({ default: m.StockManagerV2 })),
)
const BulkStockManagementV2 = React.lazy(() =>
  import("./BulkStockManagementV2").then((m) => ({
    default: m.BulkStockManagementV2,
  })),
)
const MarketCartV2 = React.lazy(() =>
  import("./MarketCartV2").then((m) => ({ default: m.MarketCartV2 })),
)
const EditListingV2 = React.lazy(() =>
  import("./EditListingV2").then((m) => ({ default: m.EditListingV2 })),
)
const BuyOrdersViewV2 = React.lazy(() =>
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
      <StockManagerV2
        listingId={params.listingId || ""}
        itemId=""
      />
    )
  }

  // Manage stock (overview)
  if (pathname === "/market/manage") {
    return <StockManagerV2 listingId="" itemId="" />
  }

  // Bulk stock management
  if (pathname === "/market/manage-stock") {
    return <BulkStockManagementV2 listingId="" itemId="" />
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

  // Bulk listings
  if (pathname === "/bulk") {
    return <ListingSearchV2 />
  }

  // Listing detail (/market/:id) — must be after all /market/xxx paths
  if (pathname.match(/^\/market\/[^/]+$/) && params.id) {
    return <ListingDetailV2 />
  }

  // Default: listing search
  return <ListingSearchV2 />
}
