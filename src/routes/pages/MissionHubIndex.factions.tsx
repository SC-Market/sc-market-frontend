// Route module: the MissionHubIndex page for /missions/factions. Wired up in src/routes.ts.

import { definePage } from "../definePage"
import { prerenderLoader } from "../prerender"

const page = definePage("MissionHubIndex", { props: { kind: "factions" } })

// Prerendered (src/prerender/paths.ts): see ../prerender.ts.
export const loader = prerenderLoader
export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
