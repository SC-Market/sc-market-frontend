// Route module: the OrgRedirectManage page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("OrgRedirectManage")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
