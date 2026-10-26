// Route module: the ImportFleet page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("ImportFleet")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
