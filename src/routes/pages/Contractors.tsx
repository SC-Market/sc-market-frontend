// Route module: the Contractors page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("Contractors")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
