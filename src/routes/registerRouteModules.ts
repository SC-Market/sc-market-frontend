/**
 * Hands every route module to React Router before it starts (see
 * routeModules.ts for why). React Router keeps loaded route modules in
 * window.__reactRouterRouteModules (filled by its bootstrap script with the
 * root route) and only import()s a route module that is missing there.
 */
import { matchRoutes, type RouteObject } from "react-router-dom"
import { routeModuleForId } from "./routeModules"
import { loadPageOf } from "./definePage"

interface ManifestRoute {
  id: string
  parentId?: string
  path?: string
  index?: boolean
  caseSensitive?: boolean
}

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

/**
 * Load the page chunks of the routes matching `pathname` (all settled:
 * a failed chunk is the page's own error to show once it renders).
 * entry.client.tsx waits for this before hydrating a prerendered page.
 */
export async function loadMatchedPages(
  pathname: string,
  globals: ReactRouterGlobals = window as unknown as ReactRouterGlobals,
): Promise<void> {
  const manifest = globals.__reactRouterManifest
  const modules = globals.__reactRouterRouteModules
  if (!manifest || !modules) return
  const byParent = new Map<string | undefined, ManifestRoute[]>()
  for (const route of Object.values(manifest.routes) as ManifestRoute[]) {
    const siblings = byParent.get(route.parentId) ?? []
    siblings.push(route)
    byParent.set(route.parentId, siblings)
  }
  const tree = (parentId: string | undefined): RouteObject[] =>
    (byParent.get(parentId) ?? []).map((route) =>
      route.index
        ? { id: route.id, path: route.path, index: true }
        : {
            id: route.id,
            path: route.path,
            caseSensitive: route.caseSensitive,
            children: tree(route.id),
          },
    )
  const matches = matchRoutes(tree(undefined), pathname) ?? []
  await Promise.allSettled(
    matches.map(({ route }) =>
      loadPageOf(route.id ? modules[route.id] : undefined),
    ),
  )
}
