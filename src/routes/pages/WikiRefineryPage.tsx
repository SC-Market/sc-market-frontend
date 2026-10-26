// Route module: the WikiRefineryPage page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("WikiRefineryPage")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
