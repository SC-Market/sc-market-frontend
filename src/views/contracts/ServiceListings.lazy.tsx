import type { OrderKind } from "../../features/orders/domain/types"
import { lazyWithPreload, lazyWithRetry } from "../../util/lazyWithRetry"

/** @deprecated Use OrderKind from features/orders/domain/types instead */
export type ContractKindIconKey = OrderKind

// Lazy load components from features. ServiceListings is preloaded with the
// /market/services page (MarketRouter), so it renders without a fallback.
export const ServiceListings = lazyWithPreload(() =>
  import("../../features/services").then((m) => ({
    default: m.ServiceListings,
  })),
)

export const ServiceListingBase = lazyWithRetry(() =>
  import("../../features/services").then((m) => ({
    default: m.ServiceListingBase,
  })),
)
