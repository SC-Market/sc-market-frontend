
import type { OrderKind } from "../../features/orders/domain/types"
import { lazyWithRetry } from "../../util/lazyWithRetry"

/** @deprecated Use OrderKind from features/orders/domain/types instead */
export type ContractKindIconKey = OrderKind

// Lazy load components from features
export const ServiceListings = lazyWithRetry(() =>
  import("../../features/services").then((m) => ({
    default: m.ServiceListings,
  })),
)

export const ServiceListingBase = lazyWithRetry(() =>
  import("../../features/services").then((m) => ({
    default: m.ServiceListingBase,
  })),
)
