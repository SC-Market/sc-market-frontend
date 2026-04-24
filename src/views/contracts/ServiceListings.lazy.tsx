import { lazy } from "react"
import type { OrderKind } from "../../features/orders/domain/types"

/** @deprecated Use OrderKind from features/orders/domain/types instead */
export type ContractKindIconKey = OrderKind

// Lazy load components from features
export const ServiceListings = lazy(() =>
  import("../../features/services").then((m) => ({
    default: m.ServiceListings,
  })),
)

export const ServiceListingBase = lazy(() =>
  import("../../features/services").then((m) => ({
    default: m.ServiceListingBase,
  })),
)
