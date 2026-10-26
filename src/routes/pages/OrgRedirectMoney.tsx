// Route module: the OrgRedirectMoney page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("OrgRedirectMoney")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
