/**
 * React bindings for the page-ready signal (see pageReadyStore.ts and
 * docs/testing-with-mcp.md).
 *
 * - <PageReadyProvider> (in Root) owns the store and feeds it the location key.
 * - usePageReadyAttributes() gives Root the attributes for <main>.
 * - usePageReady(loading) registers one loading source for the current page.
 *   <Page loading> and the page layouts' `isLoading` call it for you; use it
 *   directly only for a primary section that loads separately from the page
 *   shell (e.g. a results grid under a static header).
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { useLocation } from "react-router-dom"
import { PageReadyStore } from "./pageReadyStore"

// Layout effects so a page's loading state reaches the store in the same
// commit that renders it: nothing (an agent's poll, a paint) sees a stale
// "ready" in between. Plain effects where there is no DOM (server render).
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect

const PageReadyContext = createContext<PageReadyStore | null>(null)

export function PageReadyProvider(props: { children: React.ReactNode }) {
  const [store] = useState(() => new PageReadyStore())
  const location = useLocation()
  // Runs after the new page's own effects (parents' effects run after their
  // children's), so the page has already reported its loading state for the
  // new location when the key changes.
  useIsomorphicLayoutEffect(() => {
    store.setLocationKey(location.key)
  }, [store, location.key])
  return (
    <PageReadyContext.Provider value={store}>
      {props.children}
    </PageReadyContext.Provider>
  )
}

const serverSnapshot = () => false

/** `aria-busy` / `data-ready` for the main content area. */
export function usePageReadyAttributes(): {
  "aria-busy": "true" | "false"
  "data-ready": "true" | "false"
} {
  const store = useContext(PageReadyContext)
  const ready = useSyncExternalStore(
    store?.subscribe ?? noopSubscribe,
    store?.isReady ?? serverSnapshot,
    serverSnapshot,
  )
  return {
    "aria-busy": ready ? "false" : "true",
    "data-ready": ready ? "true" : "false",
  }
}

function noopSubscribe() {
  return () => {}
}

/**
 * Register one page-ready source. `loading` is the page's primary data state:
 * pass `isPrimaryLoading(queryResult)` (or the query's `isLoading` when the
 * arguments never change while mounted). No-op outside a PageReadyProvider.
 */
export function usePageReady(loading: boolean): void {
  const store = useContext(PageReadyContext)
  const idRef = useRef<number | null>(null)

  // Register once per mount with the loading state of the mounting render;
  // later changes go through update() below.
  useIsomorphicLayoutEffect(() => {
    if (!store) return
    const id = store.register(loading)
    idRef.current = id
    return () => {
      store.unregister(id)
      idRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store])

  useIsomorphicLayoutEffect(() => {
    if (store && idRef.current !== null) store.update(idRef.current, loading)
  }, [store, loading])
}

/**
 * Marks the page busy while mounted. Put it in the Suspense fallback of a
 * page's primary lazy section, next to the skeleton:
 *
 *   <Suspense fallback={<><PageBusy /><ResultsSkeleton /></>}>
 *
 * (RouteSkeletonFallback already does this for whole-page boundaries.)
 */
export function PageBusy(): null {
  usePageReady(true)
  return null
}
