/**
 * definePage: the route module for one lazily loaded page.
 *
 * Every page route in src/routes.ts points at a small module that calls
 * definePage("PageName"); src/app/pages.ts maps each name to its chunk
 * (() => import("…/Page")) and export. The route modules themselves are all
 * in the entry bundle (entry.client.tsx registers them with React Router up
 * front), so React Router never fetches a route module over the network;
 * only the page chunk is code-split, and it is always loaded through
 * retryDynamicImport (retry in place, then the rate-limited reload of
 * assetReloadGuard, then the route's error boundary).
 *
 * The import()s live in src/app/pages.ts, not in the route modules: React
 * Router makes every route module a build entry of its own, so chunks
 * imported from a route module can't be told apart from the entry's code,
 * and Rollup split the app shell into ~200 shared chunks. Imported from
 * the client entry's own graph, the pages share its code like before.
 *
 * That keeps the library-mode `lazy` route behaviour:
 * - Client navigation: the route's clientLoader waits for the page chunk, so
 *   the current page stays up until the next one can render, and a chunk
 *   that can't be loaded becomes a route error (RouteErrorFallback shows
 *   "new version available" with a Reload button).
 * - First page load: the clientLoader does not wait. The page renders
 *   through React.lazy, so the app shell renders at once and RouteSuspense
 *   shows the route skeleton while the chunk loads (React Router's SPA mode
 *   only uses the root route's HydrateFallback, which would hide the shell).
 *
 * Never call import() for a page anywhere else in the route table, and
 * never wrap a page in a bare React.lazy: that skips the retry and the
 * reload budget.
 */
import {
  createElement,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"
import { retryDynamicImport } from "../util/retryDynamicImport"

/**
 * Becomes true once the first page has mounted. Until then the router is
 * still running its first (hydration) loaders, which must not wait.
 */
let routerReady = false

/** Called by the root, the app layout and every page once mounted. */
export function markRouterReady(): void {
  routerReady = true
}

/** For tests that mount several routers in one module scope. */
export function resetRouterReadyForTests(): void {
  routerReady = false
}

export interface DefinePageOptions<P> {
  /** Props to render the page with (e.g. `{ org: true }`). */
  props?: P
  /**
   * Suspense fallback while the chunk loads on the first page load. Only
   * for routes outside the app layout (no RouteSuspense above them);
   * pages in the app layout leave it out and get the route skeleton.
   */
  fallback?: ReactNode
}

export interface PageRouteModule {
  Component: ComponentType
  clientLoader: (args?: { request?: Request }) => Promise<null>
  shouldRevalidate: () => boolean
  /** Load the page chunk (cached; a failure is retried on the next call). */
  load: () => Promise<ComponentType<never>>
}

/** One page in src/app/pages.ts: its chunk and the export to render. */
export interface PageEntry<M, P> {
  importPage: () => Promise<M>
  pick: (module: M) => ComponentType<P>
}

export function pageEntry<M, P>(
  importPage: () => Promise<M>,
  pick: (module: M) => ComponentType<P>,
): PageEntry<M, P> {
  return { importPage, pick }
}

type Pages = typeof import("../app/pages").pages
export type PageName = keyof Pages
type PagePropsOf<K extends PageName> = Pages[K] extends {
  pick: (module: never) => ComponentType<infer P>
}
  ? P
  : never

let pages: Pages | null = null

/** Called by entry.client.tsx (and tests that mount the route table). */
export function providePages(registry: Pages): void {
  pages = registry
}

function pageFor(name: PageName): PageEntry<object, object> {
  if (!pages) throw new Error(`Pages are not provided (loading ${name})`)
  // Each entry's module and props types match (see pageEntry()); the route
  // module only needs "a module, and a component from it".
  return pages[name] as unknown as PageEntry<object, object>
}

/**
 * Each page route's clientLoader → its chunk loader (see loadPageOf). Keyed
 * by the clientLoader: React Router wraps a route module's default export.
 */
const pageLoaders = new WeakMap<
  object,
  (pathname: string) => Promise<unknown>
>()

/**
 * Load the page chunk behind a route module (from definePage), or resolve
 * at once for any other module. entry.client.tsx waits for the current
 * page's chunk before hydrating a prerendered page: a page still suspended
 * while hydrating is thrown away and re-rendered from its fallback as soon
 * as anything above it updates.
 */
export function loadPageOf(
  routeModule: unknown,
  pathname: string,
): Promise<unknown> {
  const clientLoader = (routeModule as { clientLoader?: unknown } | undefined)
    ?.clientLoader
  const load =
    typeof clientLoader === "function"
      ? pageLoaders.get(clientLoader)
      : undefined
  return load ? load(pathname) : Promise.resolve()
}

/** The route module for the page `name` in src/app/pages.ts. */
export function definePage<K extends PageName>(
  name: K,
  options: DefinePageOptions<PagePropsOf<K>> = {},
): PageRouteModule {
  return createPageRoute(
    () => pageFor(name).importPage(),
    (module) => pageFor(name).pick(module),
    options as DefinePageOptions<object>,
    name,
  )
}

/** A page route from a chunk loader and the export to render. */
export function createPageRoute<M, P extends object>(
  importPage: () => Promise<M>,
  pick: (module: M) => ComponentType<P>,
  options: DefinePageOptions<P> = {},
  /** The component's name (devtools; route tests label routes by it). */
  name = "Page",
): PageRouteModule {
  let loaded: ComponentType<P> | null = null
  let pending: Promise<ComponentType<P>> | null = null
  // The page module's optional `preloadForPath(pathname)`: the chunks it
  // lazy-loads for that URL (e.g. MarketRouter's tab body), so the page
  // renders without a second skeleton swap.
  let preloadFor: ((pathname: string) => Promise<unknown>) | undefined

  function load(): Promise<ComponentType<P>> {
    if (!pending) {
      pending = retryDynamicImport(importPage).then(
        (module) => {
          loaded = pick(module)
          const preload = (module as { preloadForPath?: unknown })
            .preloadForPath
          if (typeof preload === "function") {
            preloadFor = preload as (pathname: string) => Promise<unknown>
          }
          return loaded
        },
        (error: unknown) => {
          // Let the next navigation try again (a later deploy, a better
          // connection); the reload budget still bounds automatic reloads.
          pending = null
          throw error
        },
      )
    }
    return pending
  }

  let LazyPage: ComponentType<P> | null = null
  function getLazyPage(): ComponentType<P> {
    if (!LazyPage) {
      LazyPage = lazy(async () => ({ default: await load() }))
    }
    return LazyPage
  }

  const hasFallback = "fallback" in options

  function Page() {
    useEffect(() => markRouterReady(), [])
    // Decided once per mount: switching from the lazy component to the
    // loaded one later would remount the page.
    const [Component] = useState<ComponentType<P>>(
      () => loaded ?? getLazyPage(),
    )
    const element = createElement(Component, options.props as P)
    return hasFallback ? (
      <Suspense fallback={options.fallback}>{element}</Suspense>
    ) : (
      element
    )
  }

  /** The page chunk, then what it preloads for `pathname` (never fails). */
  async function loadFor(pathname: string): Promise<void> {
    await load()
    await preloadFor?.(pathname).catch(() => undefined)
  }

  async function clientLoader(args?: { request?: Request }): Promise<null> {
    const pathname = args?.request
      ? new URL(args.request.url).pathname
      : undefined
    if (loaded && (!routerReady || !preloadFor || pathname === undefined)) {
      return null
    }
    const promise = pathname === undefined ? load() : loadFor(pathname)
    if (routerReady) {
      await promise
    } else {
      // First page load: the page suspends on the same promise and its
      // error boundary gets the failure.
      promise.catch(() => {})
    }
    return null
  }

  Object.defineProperty(Page, "name", { value: name })
  pageLoaders.set(clientLoader, loadFor)

  return {
    Component: Page as ComponentType,
    clientLoader,
    // The loader only loads code: nothing to redo on a same-route navigation.
    shouldRevalidate: () => false,
    load: load as () => Promise<ComponentType<never>>,
  }
}
