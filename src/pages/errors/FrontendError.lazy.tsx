import { lazyWithRetry } from "../../util/lazyWithRetry"


// Lazy load components
export const FrontendErrorElement = lazyWithRetry(() =>
  import("./FrontendError").then((m) => ({ default: m.FrontendErrorElement })),
)

export const FrontendErrorPage = lazyWithRetry(() =>
  import("./FrontendError").then((m) => ({ default: m.FrontendErrorPage })),
)
