import { lazy } from "react"

// Re-export utility function from util
export { convertAvailability } from "../../util/availability"

// Lazy load the component
export const Availability = lazy(() =>
  import("./Availability").then((m) => ({ default: m.Availability }))
)
