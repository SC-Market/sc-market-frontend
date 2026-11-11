// Route module: the AdminAlertEdit page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("AdminAlertEdit")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
