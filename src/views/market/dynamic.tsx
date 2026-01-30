import { createDynamicImport } from "../../util/dynamicImports"

// Dynamic imports for heavy market components
export const DynamicMarketListingView = createDynamicImport(() =>
  import("./MarketListingView").then((m) => ({ default: m.MarketListingView })),
)

export const DynamicMarketAggregateView = createDynamicImport(() =>
  import("./MarketAggregateView").then((m) => ({
    default: m.MarketAggregateView,
  })),
)

export const DynamicMarketMultipleView = createDynamicImport(() =>
  import("./MarketMultipleView").then((m) => ({
    default: m.MarketMultipleView,
  })),
)

export const DynamicItemListings = createDynamicImport(() =>
  import("./ItemListings").then((m) => ({ default: m.ItemListings })),
)

export const DynamicItemStock = createDynamicImport(() =>
  import("../../features/market/components/ItemStock").then((m) => ({
    default: m.MyItemStock,
  })),
)
