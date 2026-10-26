import React from "react"
import { useParams } from "react-router-dom"
import { RouteSkeletonFallback } from "../router/RouteSuspense"
import { lazyWithRetry } from "../../util/lazyWithRetry"

const MarketPageV2 = lazyWithRetry(() =>
  import("./v2/MarketPageV2").then((module) => ({
    default: module.MarketPageV2,
  })),
)

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
