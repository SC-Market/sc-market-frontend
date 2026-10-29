// Route module: the BlueprintBrowser page. Wired up in src/routes.ts.

import { definePage } from "../definePage"
import { prerenderLoader } from "../prerender"

const page = definePage("BlueprintBrowser")

// Prerendered (src/prerender/paths.ts): see ../prerender.ts.
export const loader = prerenderLoader
export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
