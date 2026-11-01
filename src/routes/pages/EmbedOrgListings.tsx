// Route module: the EmbedOrgListings page (a read-only embed widget, outside the app
// layout). Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("EmbedOrgListings", { fallback: null })

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
