// /mining/*: server-rendered game-data detail pages (src/ssr/pagesFunction.ts),
// the edge bridge for everything else and as the fallback
// (src/bridge/handler.ts, public/_routes.json; the prerendered hubs never
// invoke a Function).
import { onRequest as ssr } from "../../src/ssr/pagesFunction"

export const onRequest = ssr
