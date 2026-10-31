// Route module: the WikiCommodityDetail page. Wired up in src/routes.ts.

import { definePage } from "../definePage"
import { commodityLoader } from "../../ssr/loaders"

const page = definePage("WikiCommodityDetail")

// Server-rendered by the SSR Pages Function (docs/ssr-worker.md); the
// clientLoader handles every client navigation (no .data requests).
export const loader = commodityLoader
export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
