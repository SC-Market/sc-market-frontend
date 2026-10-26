/**
 * Stale-chunk race: a route chunk fails to load while the idle-time
 * high-priority prefetch (App.tsx → prefetchHighPriorityRoutes) is in flight.
 *
 * The old global `vite:preloadError` handler called preventDefault() whenever
 * ANY prefetch was in flight. Vite's preload helper then resolved the failed
 * ROUTE import to `undefined`, `(await import(...)).LoginPage` threw a
 * TypeError, and retryDynamicImport's retry → reload path never ran, so a
 * direct load of /login could land on the error page after a deploy.
 *
 * These tests drive the real routePrefetch + retryDynamicImport +
 * assetReloadGuard through a faithful copy of Vite's `__vitePreload` error
 * handling (vite/dist/node/chunks/config.js, handlePreloadError).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

vi.mock("../../router/routeRegistry", () => ({
  routeRegistry: {
    "/market": vi.fn(),
    "/contractors": vi.fn(),
    "/dashboard": vi.fn(),
  } as Record<string, ReturnType<typeof vi.fn>>,
}))

// Run idle callbacks synchronously so the high-priority prefetch starts now.
globalThis.requestIdleCallback = vi.fn((cb: IdleRequestCallback) => {
  cb({ didTimeout: false, timeRemaining: () => 50 })
  return 0
})

import { routeRegistry } from "../../router/routeRegistry"
import {
  clearPrefetchCache,
  prefetchHighPriorityRoutes,
} from "../../router/routePrefetch"
import { retryDynamicImport, MissingModuleError } from "../retryDynamicImport"

/** Same semantics as Vite's __vitePreload: dispatch a cancelable
 *  vite:preloadError; rethrow unless a listener called preventDefault(), in
 *  which case the import resolves to `undefined`. */
function vitePreload<T>(baseModule: () => Promise<T>): Promise<T> {
  return baseModule().catch((err: unknown) => {
    const e = new Event("vite:preloadError", { cancelable: true }) as Event & {
      payload?: unknown
    }
    e.payload = err
    window.dispatchEvent(e)
    if (!e.defaultPrevented) throw err
    return undefined as unknown as T
  })
}

function staleChunkError(name: string) {
  return new TypeError(
    `Failed to fetch dynamically imported module: https://sc-market.space/assets/${name}-deadbeef.js`,
  )
}

const reload = vi.fn()
const originalLocation = window.location

/** The exact shape App.tsx's lazy loaders use. */
async function loadLoginRoute(routeImport: () => Promise<{ LoginPage: unknown }>) {
  return {
    Component: (await retryDynamicImport(routeImport, { baseDelayMs: 1 }))
      .LoginPage,
  }
}

describe("stale route chunk while a prefetch is in flight", () => {
  let releasePrefetch: () => void

  beforeEach(() => {
    sessionStorage.clear()
    clearPrefetchCache()
    reload.mockReset()
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload },
    })

    // Every high-priority prefetch hangs until released, so it is in flight
    // for the whole route load.
    const pending = new Promise<void>((resolve) => {
      releasePrefetch = resolve
    })
    for (const importFn of Object.values(routeRegistry)) {
      vi.mocked(importFn).mockImplementation(() =>
        vitePreload(() => pending.then(() => ({ default: {} }))),
      )
    }
    prefetchHighPriorityRoutes()
    expect(routeRegistry["/market"]).toHaveBeenCalled()
  })

  afterEach(() => {
    releasePrefetch()
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    })
  })

  it("retries the route import instead of resolving it to undefined", async () => {
    const routeImport = vi
      .fn()
      .mockImplementationOnce(() =>
        vitePreload(() => Promise.reject(staleChunkError("LoginPage"))),
      )
      .mockImplementation(() =>
        vitePreload(() => Promise.resolve({ LoginPage: "LoginPageComponent" })),
      )

    const route = await loadLoginRoute(routeImport)

    expect(route.Component).toBe("LoginPageComponent")
    expect(routeImport).toHaveBeenCalledTimes(2)
    expect(reload).not.toHaveBeenCalled()
  })

  it("reloads once retries are exhausted, rejecting with the chunk error (not a TypeError on .LoginPage)", async () => {
    const routeImport = vi.fn(() =>
      vitePreload<{ LoginPage: unknown }>(() =>
        Promise.reject(staleChunkError("LoginPage")),
      ),
    )

    await expect(loadLoginRoute(routeImport)).rejects.toThrow(
      /Failed to fetch dynamically imported module/,
    )
    expect(routeImport).toHaveBeenCalledTimes(6) // 1 + 5 default retries
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it("does not reload past the session guard; the error reaches the error page", async () => {
    const routeImport = vi.fn(() =>
      vitePreload<{ LoginPage: unknown }>(() =>
        Promise.reject(staleChunkError("LoginPage")),
      ),
    )

    // Spend the reload budget (assetReloadGuard: 2 per window).
    await expect(loadLoginRoute(routeImport)).rejects.toThrow()
    await expect(loadLoginRoute(routeImport)).rejects.toThrow()
    expect(reload).toHaveBeenCalledTimes(2)

    await expect(loadLoginRoute(routeImport)).rejects.toThrow(
      /Failed to fetch dynamically imported module/,
    )
    expect(reload).toHaveBeenCalledTimes(2)
  })

  it("never resolves to undefined even if a listener cancels vite:preloadError (the old index.tsx handler)", async () => {
    // The removed handler: `if (isPrefetchInFlight()) event.preventDefault()`.
    // A prefetch is in flight for this whole test, so it always cancelled.
    // Before the fix this failed with "Cannot read properties of undefined
    // (reading 'LoginPage')" after a single attempt and no reload.
    const cancel = (e: Event) => e.preventDefault()
    window.addEventListener("vite:preloadError", cancel)
    try {
      const routeImport = vi.fn(() =>
        vitePreload<{ LoginPage: unknown }>(() =>
          Promise.reject(staleChunkError("LoginPage")),
        ),
      )

      await expect(loadLoginRoute(routeImport)).rejects.toBeInstanceOf(
        MissingModuleError,
      )
      expect(routeImport).toHaveBeenCalledTimes(6) // 1 + 5 default retries
      expect(reload).toHaveBeenCalledTimes(1)
    } finally {
      window.removeEventListener("vite:preloadError", cancel)
    }
  })

  it("still swallows a failed prefetch without reloading", async () => {
    // /market: always in the high-priority set (/dashboard is only warmed for
    // a cached signed-in profile since 1c7ec8b4).
    vi.mocked(routeRegistry["/market"]).mockImplementation(() =>
      vitePreload(() => Promise.reject(staleChunkError("Market"))),
    )
    clearPrefetchCache()
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    prefetchHighPriorityRoutes()
    await vi.waitFor(() =>
      expect(warn).toHaveBeenCalledWith(
        "Failed to prefetch route /market:",
        expect.any(TypeError),
      ),
    )
    expect(reload).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
