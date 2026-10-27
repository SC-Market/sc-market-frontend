/**
 * "@reduxjs/toolkit/query/react" for the build-time render (entry.server):
 * the same module, except that the generated hooks start their queries during
 * render instead of in an effect (RTK Query's documented two-pass SSR mode,
 * `unstable__sideEffectsInRender`). entry.server renders once to start the
 * queries a page asks for, waits for them, and renders again with the data.
 *
 * Swapped in for server builds only (scripts/vite/ssrRtkHooksPlugin.ts); the
 * browser bundle keeps RTK Query's normal hooks.
 */
import {
  buildCreateApi,
  coreModule,
  reactHooksModule,
} from "@reduxjs/toolkit/query/react"

export * from "@reduxjs/toolkit/query/react"

export const createApi = buildCreateApi(
  coreModule(),
  reactHooksModule({ unstable__sideEffectsInRender: true }),
)
