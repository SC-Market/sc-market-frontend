// Route module: the StillSellingPage page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("StillSellingPage")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
