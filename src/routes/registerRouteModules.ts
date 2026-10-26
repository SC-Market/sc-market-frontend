/**
 * Hands every route module to React Router before it starts (see
 * routeModules.ts for why). React Router keeps loaded route modules in
 * window.__reactRouterRouteModules (filled by its bootstrap script with the
 * root route) and only import()s a route module that is missing there.
 */
import { routeModuleForId } from "./routeModules"

interface ReactRouterGlobals {
  __reactRouterManifest?: { routes: Record<string, unknown> }
  __reactRouterRouteModules?: Record<string, unknown>
}

export function registerRouteModules(
  globals: ReactRouterGlobals = window as unknown as ReactRouterGlobals,
): void {
  const manifest = globals.__reactRouterManifest
  const loaded = globals.__reactRouterRouteModules
  if (!manifest || !loaded) {
    throw new Error(
      "React Router's route manifest/modules are missing: entry.client must be loaded by <Scripts />",
    )
  }
  const missing: string[] = []
  for (const id of Object.keys(manifest.routes)) {
    if (id === "root" || id in loaded) continue
    const module = routeModuleForId(id)
    if (module) loaded[id] = module
    else missing.push(id)
  }
  if (missing.length > 0) {
    throw new Error(`No bundled module for route(s): ${missing.join(", ")}`)
  }
}
