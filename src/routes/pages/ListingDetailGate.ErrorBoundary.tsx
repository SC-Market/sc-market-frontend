// Route module: the ListingDetailGate page. Wired up in src/routes.ts.

import { definePage } from "../definePage"
import { listingLoader } from "../../ssr/loaders"
import { shellComponent } from "../shell"

export const ErrorBoundary = shellComponent("RouteErrorFallback")
const page = definePage("ListingDetailGate")

// Server-rendered by the SSR Pages Function (docs/ssr-worker.md); the
// clientLoader handles every client navigation (no .data requests).
export const loader = listingLoader
export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
