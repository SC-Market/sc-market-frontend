// Route module: the CreateBuyOrderGate page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("CreateBuyOrderGate")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
