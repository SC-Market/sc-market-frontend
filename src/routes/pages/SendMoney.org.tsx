// Route module: the SendMoney page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("SendMoney", { props: { org: true } })

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
