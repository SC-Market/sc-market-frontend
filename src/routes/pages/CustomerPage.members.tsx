// Route module: the CustomerPage page. Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("CustomerPage", { props: { members: true } })

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
