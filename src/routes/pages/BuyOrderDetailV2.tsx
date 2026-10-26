// Route module: the BuyOrderDetailV2 page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("BuyOrderDetailV2")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
