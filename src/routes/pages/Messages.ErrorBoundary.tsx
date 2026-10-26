// Route module: the Messages page. Wired up in src/routes.ts.

import { definePage } from "../definePage"
import { shellComponent } from "../shell"

export const ErrorBoundary = shellComponent("RouteErrorFallback")
const page = definePage("Messages")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
