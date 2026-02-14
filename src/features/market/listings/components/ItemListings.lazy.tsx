import { lazy, ComponentType } from "react"

// Re-export utility function from utils
export { completeToSearchResult } from "../utils/listingUtils"

// Create lazy wrapper components
export const ItemListings = lazy(() =>
  import("./ItemListings").then((m) => ({ default: m.ItemListings }))
)

export const DisplayListingsHorizontal = lazy(() =>
  import("./ItemListings").then((m) => ({ default: m.DisplayListingsHorizontal }))
)

export const MyItemListings = lazy(() =>
  import("./ItemListings").then((m) => ({ default: m.MyItemListings }))
)

export const AllItemListings = lazy(() =>
  import("./ItemListings").then((m) => ({ default: m.AllItemListings }))
)

export const BulkListingsRefactor = lazy(() =>
  import("./ItemListings").then((m) => ({ default: m.BulkListingsRefactor }))
)

export const BuyOrders = lazy(() =>
  import("./ItemListings").then((m) => ({ default: m.BuyOrders }))
)
