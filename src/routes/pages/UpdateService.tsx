// Route module: the UpdateService page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("UpdateService")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
