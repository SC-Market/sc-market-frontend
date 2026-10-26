/**
 * The route table (src/routes.ts) as data-router RouteObjects, for tests that
 * mount it in a memory router (createMemoryRouter).
 *
 * Built the way React Router's framework mode builds its client routes from
 * the same modules (entry.client.tsx registers them all up front): each
 * route gets its module's Component, ErrorBoundary, clientLoader (as the
 * loader) and shouldRevalidate. Layouts are given as `element` so route
 * tests can label them by component (LoggedInRoute, OrgAdminRoute…). As in
 * SPA mode, nothing renders until the first loaders finish (React Router
 * only uses the root route's HydrateFallback there, and ours is empty).
 */
import { createElement } from "react"
import type { RouteObject } from "react-router-dom"
import type { RouteConfigEntry } from "@react-router/dev/routes"
import routeConfig from "../routes"
import { routeModuleForId } from "../routes/routeModules"
import { provideShell } from "../routes/shell"
import { shell } from "../app/shell"
import { providePages } from "../routes/definePage"
import { pages } from "../app/pages"

// What src/entry.client.tsx does before any route renders.
provideShell(shell)
providePages(pages)

function EmptyHydrateFallback() {
  return null
}

function toRouteObject(
  entry: RouteConfigEntry,
  topLevel: boolean,
): RouteObject {
  const id = entry.id ?? entry.file
  const module = routeModuleForId(id)
  if (!module) throw new Error(`No route module for ${id}`)
  const children = entry.children?.map((child) => toRouteObject(child, false))
  const common = {
    id,
    path: entry.path,
    caseSensitive: entry.caseSensitive,
    errorElement: module.ErrorBoundary
      ? createElement(module.ErrorBoundary)
      : undefined,
    ...(topLevel ? { HydrateFallback: EmptyHydrateFallback } : {}),
  }
  const view =
    children && !module.clientLoader && module.default
      ? { element: createElement(module.default) }
      : {
          Component: module.default,
          loader: module.clientLoader,
          shouldRevalidate: module.shouldRevalidate,
        }
  if (entry.index) return { ...common, ...view, index: true }
  return { ...common, ...view, children }
}

export const routes: RouteObject[] = routeConfig.map((entry) =>
  toRouteObject(entry, true),
)
