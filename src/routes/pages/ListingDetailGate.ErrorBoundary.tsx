// Route module: the ListingDetailGate page. Wired up in src/routes.ts.

import { definePage } from "../definePage"
import { shellComponent } from "../shell"

export const ErrorBoundary = shellComponent("RouteErrorFallback")
const page = definePage("ListingDetailGate")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
