// Route module: the InventoryPage page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("InventoryPage")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
