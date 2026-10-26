// Edge bridge for /guides and /guides/* (see src/bridge/handler.ts and public/_routes.json).
import { onRequest as bridge } from "../../src/bridge/pagesFunction"

export const onRequest = bridge
