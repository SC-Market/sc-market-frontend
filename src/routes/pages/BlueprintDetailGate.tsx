// Route module: the BlueprintDetailGate page. Wired up in src/routes.ts.

import { definePage } from "../definePage"
import { blueprintLoader } from "../../ssr/loaders"

const page = definePage("BlueprintDetailGate")

// Server-rendered by the SSR Pages Function (docs/ssr-worker.md); the
// clientLoader handles every client navigation (no .data requests).
export const loader = blueprintLoader
export const clientLoader = page.clientLoader
export const shouldRevalidate = page.shouldRevalidate
export default page.Component
