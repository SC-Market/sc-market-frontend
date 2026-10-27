import React, { useState } from "react"
import { useLocation, useParams } from "react-router-dom"
import { RouteSkeletonFallback } from "../router/RouteSuspense"
import { lazyWithRetry } from "../../util/lazyWithRetry"
import { marketPageKind } from "./v2/marketPageKind"
import { ServiceMarketView } from "../../views/services/ServiceMarketView.lazy"
import { ServiceListings } from "../../views/contracts/ServiceListings.lazy"
import { ListingSearchV2 } from "../../features/market/v2/ListingSearchV2.lazy"

/**
 * The chunks below MarketPageV2 that a page needs for its first render.
 * Loaded in parallel with MarketPageV2's own chunk (not one after the
 * other), and the page renders once they are all in: otherwise each chunk
 * arriving swapped one skeleton for the next (route skeleton, then
 * MarketPageV2's body fallback, then the list's fallback), three skeletons
 * in a row on /market/services.
 */
type MarketBody = "services" | "search" | "other"

function marketBody(pathname: string): MarketBody {
  if (marketPageKind(pathname) === "services") return "services"
  if (pathname === "/market" || pathname.startsWith("/market/category/")) {
    return "search"
  }
  // /buyorders (BuyOrdersViewV2 or BuyOrdersRedesign, by feature flag) and
  // /bulk: loaded when they render.
  return "other"
}

const BODY_CHUNKS: Record<MarketBody, () => Promise<unknown>[]> = {
  services: () => [ServiceMarketView.preload(), ServiceListings.preload()],
  search: () => [ListingSearchV2.preload()],
  other: () => [],
}

const marketPages = new Map<MarketBody, React.ComponentType>()

/** MarketPageV2, loaded together with the chunks of `body`. */
function marketPageFor(body: MarketBody): React.ComponentType {
  let page = marketPages.get(body)
  if (!page) {
    page = lazyWithRetry(() =>
      Promise.all([
        import("./v2/MarketPageV2"),
        // A body chunk that fails here is loaded again when it renders, under
        // its own Suspense and error boundary: it must not fail the page.
        ...BODY_CHUNKS[body]().map((chunk) => chunk.catch(() => undefined)),
      ]).then(([module]) => ({ default: module.MarketPageV2 })),
    )
    marketPages.set(body, page)
  }
  return page
}

// V2 standalone pages
const ListingDetailV2 = lazyWithRetry(() => import("../../features/market/v2/ListingDetailV2").then(m => ({ default: m.ListingDetailV2 })))
const CreateListingV2 = lazyWithRetry(() => import("../../features/market/v2/CreateListingV2").then(m => ({ default: m.CreateListingV2 })))
const EditListingV2 = lazyWithRetry(() => import("../../features/market/v2/EditListingV2").then(m => ({ default: m.EditListingV2 })))
const MyListingsV2 = lazyWithRetry(() => import("../../features/market/v2/MyListingsV2").then(m => ({ default: m.MyListingsV2 })))
const MarketCartV2 = lazyWithRetry(() => import("../../features/market/v2/MarketCartV2").then(m => ({ default: m.MarketCartV2 })))
const StockManagerV2 = lazyWithRetry(() => import("../../features/market/v2/StockManagerV2").then(m => ({ default: m.StockManagerV2 })))
const BulkStockManagementV2 = lazyWithRetry(() => import("../../features/market/v2/BulkStockManagementV2").then(m => ({ default: m.BulkStockManagementV2 })))
const MarketAggregateViewV2 = lazyWithRetry(() => import("../../features/market/v2/MarketAggregateViewV2").then(m => ({ default: m.MarketAggregateViewV2 })))
const MarketMultipleViewV2 = lazyWithRetry(() => import("../../features/market/v2/MarketMultipleViewV2").then(m => ({ default: m.MarketMultipleViewV2 })))
const CreateBuyOrderPageV2 = lazyWithRetry(() => import("../../features/market/v2/CreateBuyOrderPageV2").then(m => ({ default: m.CreateBuyOrderPageV2 })))

/**
 * While a market page's chunk loads, show that page's route skeleton (the
 * same one the route Suspense and HydrateFallback use), not a spinner.
 */
const MarketLoadingFallback = RouteSkeletonFallback

/**
 * MarketRouter – renders V2 market tabbed page.
 */
export function MarketRouter() {
  const { pathname } = useLocation()
  // Once per mount: switching the component later would remount the page.
  const [MarketPageV2] = useState(() => marketPageFor(marketBody(pathname)))
  return (
    <React.Suspense fallback={<MarketLoadingFallback />}>
      <MarketPageV2 />
    </React.Suspense>
  )
}

// Pre-built gates for the route modules (src/routes/pages) — all render V2 directly
export const ListingDetailGate = () => {
  const { id } = useParams<{ id: string }>()
  return <React.Suspense fallback={<MarketLoadingFallback />}><ListingDetailV2 key={id} /></React.Suspense>
}
export const AggregateDetailGate = () => <React.Suspense fallback={<MarketLoadingFallback />}><MarketAggregateViewV2 /></React.Suspense>
export const MultipleDetailGate = () => <React.Suspense fallback={<MarketLoadingFallback />}><MarketMultipleViewV2 /></React.Suspense>
export const CreateListingGate = () => <React.Suspense fallback={<MarketLoadingFallback />}><CreateListingV2 /></React.Suspense>
export const MyListingsGate = () => <React.Suspense fallback={<MarketLoadingFallback />}><MyListingsV2 /></React.Suspense>
export const MarketCartGate = () => <React.Suspense fallback={<MarketLoadingFallback />}><MarketCartV2 /></React.Suspense>
export const EditListingGate = () => <React.Suspense fallback={<MarketLoadingFallback />}><EditListingV2 /></React.Suspense>
export const EditMultipleGate = () => <React.Suspense fallback={<MarketLoadingFallback />}><EditListingV2 /></React.Suspense>
export const CreateBuyOrderGate = () => <React.Suspense fallback={<MarketLoadingFallback />}><CreateBuyOrderPageV2 /></React.Suspense>
export const ManageStockGate = () => <React.Suspense fallback={<MarketLoadingFallback />}><StockManagerV2 /></React.Suspense>
export const ManageStockLotsGate = () => <React.Suspense fallback={<MarketLoadingFallback />}><BulkStockManagementV2 /></React.Suspense>
