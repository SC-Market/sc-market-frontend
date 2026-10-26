// Route module: the AdminRequisitions page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("AdminRequisitions")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
