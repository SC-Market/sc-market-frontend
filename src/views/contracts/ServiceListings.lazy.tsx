import { lazy } from "react"
import type { orderIcons } from "../../datatypes/Order"

// Re-export type
export type ContractKindIconKey = keyof typeof orderIcons

// Lazy load components from features
export const ServiceListings = lazy(() =>
  import("../../features/services").then((m) => ({ default: m.ServiceListings }))
)

export const ServiceListingBase = lazy(() =>
  import("../../features/services").then((m) => ({ default: m.ServiceListingBase }))
)
