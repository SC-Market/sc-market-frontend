// Route module: the AdminAttributeDefinitions page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("AdminAttributeDefinitions")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
