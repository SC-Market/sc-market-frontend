// Route module: the BlueprintDetailGate page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("BlueprintDetailGate")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
