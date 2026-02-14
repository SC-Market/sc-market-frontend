import { lazy } from "react"

// Lazy load components
export const FrontendErrorElement = lazy(() =>
  import("./FrontendError").then((m) => ({ default: m.FrontendErrorElement }))
)

export const FrontendErrorPage = lazy(() =>
  import("./FrontendError").then((m) => ({ default: m.FrontendErrorPage }))
)
