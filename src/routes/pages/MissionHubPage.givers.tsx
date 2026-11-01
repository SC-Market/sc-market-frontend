// Route module: the MissionHubPage page for /missions/givers/:slug. Wired up in src/routes.ts.

import { definePage } from "../definePage"
import { prerenderLoader } from "../prerender"

const page = definePage("MissionHubPage", { props: { kind: "givers" } })

// Prerendered (src/prerender/paths.ts): see ../prerender.ts.
export const loader = prerenderLoader
export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
