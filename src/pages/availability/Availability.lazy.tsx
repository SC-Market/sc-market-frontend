import { lazyWithRetry } from "../../util/lazyWithRetry"


// Re-export utility function from util
export { convertAvailability } from "../../util/availability"

// Lazy load the component
export const Availability = lazyWithRetry(() =>
  import("./Availability").then((m) => ({ default: m.Availability })),
)
