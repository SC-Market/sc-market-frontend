// Route module: the AdminOrderStats page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("AdminOrderStats")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
