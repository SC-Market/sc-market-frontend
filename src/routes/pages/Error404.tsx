// Route module: the Error404 page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("Error404")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
