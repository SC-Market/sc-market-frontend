// Route module: the DiscordInstallPage page (count an "Add SC Market to
// Discord" click, then open Discord). Wired up in src/routes.ts.

import { definePage } from "../definePage"

const page = definePage("DiscordInstallPage")

export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
