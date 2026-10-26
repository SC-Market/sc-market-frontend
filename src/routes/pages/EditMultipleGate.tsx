// Route module: the EditMultipleGate page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("EditMultipleGate")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
