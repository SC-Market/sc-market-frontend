// Route module: the CreatePublicContractPage page. Wired up in src/routes.ts.

import { definePage } from "../definePage"
import { shellComponent } from "../shell"

export const ErrorBoundary = shellComponent("RouteErrorFallback")
const page = definePage("CreatePublicContractPage")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
