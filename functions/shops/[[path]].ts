// Edge bridge for /shops/* (see src/bridge/handler.ts and public/_routes.json).
import { onRequest as bridge } from "../../src/bridge/pagesFunction"

export const onRequest = bridge
