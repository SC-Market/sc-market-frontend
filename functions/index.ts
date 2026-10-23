// Edge bridge for the homepage "/" only (see src/bridge/handler.ts and
// public/_routes.json, which includes "/" as an exact path).
import { onRequest as bridge } from "../src/bridge/pagesFunction"

export const onRequest = bridge
