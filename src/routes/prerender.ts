/**
 * `loader` for the route modules of prerendered pages (src/prerender/paths.ts).
 *
 * It does nothing: the page's data comes from its RTK Query hooks during the
 * build-time render (entry.server.tsx). It exists because React Router only
 * hydrates a prerendered page in place when its routes have a server loader;
 * a route with only a clientLoader re-runs it on hydration and renders the
 * root HydrateFallback (empty) over the prerendered HTML. On the client the
 * route's clientLoader (definePage) still handles navigations, so no .data
 * request is ever made.
 */
export function prerenderLoader(): null {
  return null
}
