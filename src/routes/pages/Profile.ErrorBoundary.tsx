// Route module: the Profile page. Wired up in src/routes.ts.

import { definePage } from "../definePage"
import { userLoader } from "../../ssr/loaders"
import { shellComponent } from "../shell"

export const ErrorBoundary = shellComponent("RouteErrorFallback")
const page = definePage("Profile")

// Server-rendered by the SSR Pages Function (docs/ssr-worker.md); the
// clientLoader handles every client navigation (no .data requests).
export const loader = userLoader
export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
