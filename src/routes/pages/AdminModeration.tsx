// Route module: the AdminModeration page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("AdminModeration")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
