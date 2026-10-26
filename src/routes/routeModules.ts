/**
 * Every route module in src/routes.ts, bundled into the entry and handed to
 * React Router before it starts (entry.client.tsx), so React Router never
 * loads a route module over the network.
 *
 * Why: React Router's own route-module loader reloads the page on ANY
 * failed import, with no limit and no retry (react-router's
 * loadRouteModule). The route modules are tiny (see definePage.tsx); the
 * pages they render stay code-split and load through retryDynamicImport,
 * which retries, reloads at most twice per two minutes (assetReloadGuard)
 * and then shows the error in place.
 */
import type { ComponentType } from "react"

/** The exports a route module in this app may have. */
export interface AppRouteModule {
  default?: ComponentType
  ErrorBoundary?: ComponentType
  clientLoader?: () => Promise<unknown>
  shouldRevalidate?: () => boolean
}

const modules = import.meta.glob<AppRouteModule>(
  ["./layouts/*.tsx", "./pages/*.tsx", "./elements/*.tsx"],
  { eager: true },
)

/**
 * The module for a route id from src/routes.ts: the id is the file under
 * src/ without its extension, plus "~N" when several routes share a file.
 */
export function routeModuleForId(id: string): AppRouteModule | undefined {
  const file = id.replace(/~\d+$/, "")
  if (!file.startsWith("routes/")) return undefined
  return modules[`./${file.slice("routes/".length)}.tsx`]
}

/** Glob keys, for the route table test (every file is used by a route). */
export const routeModuleFiles: string[] = Object.keys(modules)
