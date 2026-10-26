// Route module: the MiningLocationDetailGate page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("MiningLocationDetailGate")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
