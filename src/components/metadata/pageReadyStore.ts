/**
 * The "page ready" signal: whether the current page's primary data has loaded.
 *
 * Root puts it on the main content area (`<main id="main-content">`) as
 * `aria-busy="true|false"` and `data-ready="true|false"`, so browser agents and
 * Playwright can wait on `main[data-ready="true"]` instead of sleeping. See
 * docs/testing-with-mcp.md.
 *
 * How it works:
 * - Each mounted page registers a *source* with its primary loading state
 *   (`<Page loading>`, the layouts' `isLoading`, or `usePageReady(loading)` for
 *   a section deeper in the page, e.g. the market results grid).
 * - The page is *settled* when at least one source is mounted and none is
 *   loading. No source mounted (a lazy chunk or the route skeleton is still
 *   showing, a redirect is in flight) is not settled.
 * - Ready is latched per navigation (location key): once the page settled for
 *   the current location it stays ready, so a background refetch (`isFetching`
 *   with data already shown) can never flip it back to busy. A new navigation
 *   resets it until the page settles again for the new location.
 *
 * Changes are evaluated once per batch (a microtask by default), not per
 * call: when a Suspense fallback is replaced by the content it stood in for,
 * React runs the fallback's cleanup and the content's registration in the
 * same commit, and evaluating between the two would latch "ready" on the
 * page shell alone.
 *
 * This file is plain TypeScript (no React) so the logic is unit-testable.
 */
export class PageReadyStore {
  private sources = new Map<number, boolean>()
  private nextId = 1
  private locationKey: string | null = null
  private latchedKey: string | null = null
  private ready = false
  private listeners = new Set<() => void>()
  private scheduled = false

  /**
   * @param schedule runs the batched evaluation; defaults to queueMicrotask
   *   (after the current commit's effects, before the browser or any test
   *   driver can observe the DOM).
   */
  constructor(
    // A wrapper, not queueMicrotask itself: called as a method of this
    // store, the bare built-in throws "Illegal invocation" in browsers.
    private readonly schedule: (flush: () => void) => void = (flush) =>
      queueMicrotask(flush),
  ) {}

  /** Register a source; returns its id. */
  register(loading: boolean): number {
    const id = this.nextId++
    this.sources.set(id, loading)
    this.recompute()
    return id
  }

  update(id: number, loading: boolean): void {
    if (!this.sources.has(id) || this.sources.get(id) === loading) return
    this.sources.set(id, loading)
    this.recompute()
  }

  unregister(id: number): void {
    if (!this.sources.delete(id)) return
    this.recompute()
  }

  /** Called on every navigation (React Router's `location.key`). */
  setLocationKey(key: string): void {
    if (this.locationKey === key) return
    this.locationKey = key
    this.recompute()
  }

  isReady = (): boolean => this.ready

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** At least one source mounted and none of them loading. */
  private isSettled(): boolean {
    if (this.sources.size === 0) return false
    for (const loading of this.sources.values()) if (loading) return false
    return true
  }

  private recompute(): void {
    if (this.scheduled) return
    this.scheduled = true
    this.schedule(() => this.flush())
  }

  /** Evaluate pending changes now. */
  flush(): void {
    this.scheduled = false
    if (this.locationKey !== null && this.isSettled()) {
      this.latchedKey = this.locationKey
    }
    const ready =
      this.locationKey !== null && this.latchedKey === this.locationKey
    if (ready === this.ready) return
    this.ready = ready
    for (const listener of this.listeners) listener()
  }
}

/**
 * Primary-loading state of an RTK Query result for the page-ready signal.
 *
 * `isLoading` alone is only true for a hook's very first load: when the query
 * arguments change (new search, next listing) the hook keeps showing the old
 * data with `isFetching` true and `isLoading` false. Treat "fetching with no
 * data for the current arguments" as loading too; a background refetch of
 * data that is already shown (`currentData` set) is not loading.
 */
export function isPrimaryLoading(result: {
  isLoading?: boolean
  isFetching?: boolean
  currentData?: unknown
}): boolean {
  return (
    !!result.isLoading ||
    (!!result.isFetching && result.currentData === undefined)
  )
}
