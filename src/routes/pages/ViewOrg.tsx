// Route module: the ViewOrg page. Wired up in src/routes.ts.

import { definePage } from "../definePage"
import { orgLoader } from "../../ssr/loaders"

const page = definePage("ViewOrg")

// Server-rendered by the SSR Pages Function (docs/ssr-worker.md); the
// clientLoader handles every client navigation (no .data requests).
export const loader = orgLoader
export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
