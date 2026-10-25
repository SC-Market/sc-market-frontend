/**
 * React Router v6 "future" flags: opt-ins to v7 behavior, enabled one at a
 * time ahead of the v7 bump (docs/ssr-migration-design.md §5 Phase 1).
 *
 * Shared by the app's router (src/App.tsx) and the route regression harness
 * (src/router/__tests__/), so the harness exercises exactly the behavior the
 * app ships. Every flag here is the default in v7, where these options no
 * longer exist; this module is deleted with the bump.
 */
import type { createBrowserRouter, RouterProviderProps } from "react-router-dom"

type RouterFuture = NonNullable<
  NonNullable<Parameters<typeof createBrowserRouter>[1]>["future"]
>

/** Pass as `future` to createBrowserRouter / createMemoryRouter. */
export const ROUTER_FUTURE: RouterFuture = {
  v7_relativeSplatPath: true,
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
  v7_partialHydration: true,
  v7_skipActionErrorRevalidation: true,
}

/** Pass as `future` to <RouterProvider>. */
export const ROUTER_PROVIDER_FUTURE: NonNullable<RouterProviderProps["future"]> =
  {
    v7_startTransition: true,
  }
