// Route module: the ResourceDetail page. Wired up in src/routes.ts.

import { definePage } from "../definePage"
import { resourceLoader } from "../../ssr/loaders"

const page = definePage("ResourceDetail")

// Server-rendered by the SSR Pages Function (docs/ssr-worker.md); the
// clientLoader handles every client navigation (no .data requests).
export const loader = resourceLoader
export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
