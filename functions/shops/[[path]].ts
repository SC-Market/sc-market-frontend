// /shops and /shops/*: server-rendered entity pages (src/ssr/pagesFunction.ts), the
// edge bridge for everything else and as the fallback (src/bridge/handler.ts,
// public/_routes.json).
import { onRequest as ssr } from "../../src/ssr/pagesFunction"

export const onRequest = ssr
