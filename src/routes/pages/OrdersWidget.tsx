// Route module: the OrdersWidget page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("OrdersWidget", { fallback: null })

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
