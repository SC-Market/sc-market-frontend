import React from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// This file exercises the real profile endpoints against a fake backend.
vi.unmock("../../features/profile/api/profileApi")

import { makeStore } from "../store"
import { browserNetworkEnv } from "../browserNetworkEnv"
import { resetSessionCheck, checkSession } from "../sessionCheck"
import { refreshAuth, resetRefreshBackoff } from "../refreshAuth"
import { userApi } from "../../features/profile/api/profileApi"
import { seedCachedProfile as seedProfileFromCache } from "../../features/profile/seedCachedProfile"
import { useIsAuthenticated, useSession } from "../../hooks/login/useSession"
import { useGetMyShopsQuery } from "../api/v2/market"
import {
  loadProfileCache,
  saveProfileCache,
  clearProfileCache,
} from "../../features/profile/profileCache"
import type { UserProfileState } from "../../hooks/login/UserProfile"

/**
 * End-to-end over the browser NetworkEnv: session check → profile query →
 * the call-site gate auth-only queries (GET /api/v2/shops/mine) use, with
 * fetch answered by a fake backend that records every request.
 */

const profile = { username: "tester", role: "user" } as UserProfileState

type Route = (method: string) => Response | Promise<Response>
let routes: Record<string, Route>
let requests: string[]

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function fakeFetch(input: RequestInfo | URL, init?: RequestInit) {
  const request = input instanceof Request ? input : null
  const url = new URL(request ? request.url : String(input))
  const method = (request?.method ?? init?.method ?? "GET").toUpperCase()
  requests.push(`${method} ${url.pathname}`)
  const route = routes[`${method} ${url.pathname}`]
  return Promise.resolve(
    route ? route(method) : json(404, { error: "Not found" }),
  )
}

/** Mirrors SidebarV2 / CommandPalette: session + gated shops/mine. */
function Probe() {
  const session = useSession()
  const isAuthenticated = useIsAuthenticated()
  const { data: shops } = useGetMyShopsQuery(undefined, {
    skip: !isAuthenticated,
  })
  return (
    <span data-testid="probe">
      {`${session.status}:${session.profile?.username ?? "-"}:${
        shops ? shops.length : "-"
      }`}
    </span>
  )
}

function renderApp(
  seed?: (store: ReturnType<typeof makeStore>) => void,
) {
  const store = makeStore({ networkEnv: browserNetworkEnv })
  // Same boot order as src/index.tsx.
  void browserNetworkEnv.checkSession()
  seed?.(store)
  render(
    <Provider store={store}>
      <Probe />
    </Provider>,
  )
  return store
}

const probe = () => screen.getByTestId("probe").textContent

/** Hold GET /api/auth/session until release() — to observe the pending state. */
function deferSession(body: { authenticated: boolean }) {
  let release!: () => void
  routes["GET /api/auth/session"] = () =>
    new Promise((resolve) => {
      release = () => resolve(json(200, body))
    })
  return () => release()
}

function seedCachedProfile(store: ReturnType<typeof makeStore>) {
  // Same as src/index.tsx.
  saveProfileCache(profile)
  seedProfileFromCache(store)
}

let originalFetch: typeof fetch

beforeEach(() => {
  resetSessionCheck()
  resetRefreshBackoff()
  clearProfileCache()
  requests = []
  routes = {}
  originalFetch = globalThis.fetch
  globalThis.fetch = vi.fn(fakeFetch) as typeof fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe("anonymous visitor", () => {
  beforeEach(() => {
    routes["GET /api/auth/session"] = () => json(200, { authenticated: false })
  })

  it("never requests the profile, shops/mine or a refresh", async () => {
    renderApp()
    await waitFor(() => expect(probe()).toBe("anonymous:-:-"))
    // Let any stray follow-up request surface.
    await act(() => new Promise((r) => setTimeout(r, 20)))
    expect(requests).toEqual(["GET /api/auth/session"])
  })

  it("401 retry and the proactive refresh timer skip the refresh request", async () => {
    await checkSession()
    await expect(refreshAuth()).resolves.toBe(false)
    expect(requests).toEqual(["GET /api/auth/session"])
  })

  it("a stale cached profile flips to anonymous without any auth-only request", async () => {
    const release = deferSession({ authenticated: false })
    renderApp(seedCachedProfile)
    // Cached profile renders while the check is in flight; shops/mine waits.
    await waitFor(() => expect(probe()).toBe("authenticated:tester:-"))
    release()
    await waitFor(() => expect(probe()).toBe("anonymous:-:-"))
    await act(() => new Promise((r) => setTimeout(r, 20)))
    expect(requests).toEqual(["GET /api/auth/session"])
    expect(loadProfileCache()).toBeNull()
  })
})

describe("logged-in user", () => {
  beforeEach(() => {
    routes["GET /api/auth/session"] = () => json(200, { authenticated: true })
    routes["GET /api/profile"] = () => json(200, profile)
    routes["GET /api/v2/shops/mine"] = () => json(200, [])
  })

  it("requests the profile and shops/mine after the session check", async () => {
    renderApp()
    await waitFor(() => expect(probe()).toBe("authenticated:tester:0"))
    expect(requests[0]).toBe("GET /api/auth/session")
    expect(requests).toContain("GET /api/profile")
    expect(requests).toContain("GET /api/v2/shops/mine")
    expect(requests).not.toContain("POST /api/auth/refresh")
  })

  it("cached profile renders without a logged-out flash; the session check confirms it", async () => {
    const release = deferSession({ authenticated: true })
    const seen: string[] = []
    const observer = new MutationObserver(() => seen.push(probe() ?? ""))
    renderApp(seedCachedProfile)
    observer.observe(document.body, { subtree: true, characterData: true, childList: true })
    await waitFor(() => expect(probe()).toBe("authenticated:tester:-"))
    // Nothing auth-only went out before the check answered.
    expect(requests).toEqual(["GET /api/auth/session"])
    release()
    await waitFor(() => expect(probe()).toBe("authenticated:tester:0"))
    observer.disconnect()
    expect(seen.some((t) => t.startsWith("anonymous"))).toBe(false)
    expect(requests).toContain("GET /api/profile")
  })

  // Regression: index.tsx invalidated the seeded entry on a setTimeout(0).
  // createRoot renders asynchronously, so that usually ran before anything
  // subscribed, and RTK Query removes an invalidated entry with no
  // subscribers: every signed-in page first rendered the signed-out sidebar.
  it("the seeded profile survives until the app's first (asynchronous) render", async () => {
    const release = deferSession({ authenticated: true })
    const store = makeStore({ networkEnv: browserNetworkEnv })
    void browserNetworkEnv.checkSession()
    seedCachedProfile(store)
    await new Promise((r) => setTimeout(r, 20))
    render(
      <Provider store={store}>
        <Probe />
      </Provider>,
    )
    expect(probe()).toBe("authenticated:tester:-")
    release()
    await waitFor(() => expect(probe()).toBe("authenticated:tester:0"))
    expect(requests).toContain("GET /api/profile")
  })

  it("expired access token: the session check's rotation stands in for the refresh", async () => {
    // The backend rotated from the refresh cookie inside GET /api/auth/session.
    // A request that raced it with the old cookie 401s; refreshAuth waits for
    // the check and retries instead of rotating a second time.
    let release!: () => void
    routes["GET /api/auth/session"] = () =>
      new Promise((resolve) => {
        release = () => resolve(json(200, { authenticated: true }))
      })
    const session = checkSession()
    const refreshed = refreshAuth()
    release()
    await expect(session).resolves.toBe("authenticated")
    await expect(refreshed).resolves.toBe(true)
    expect(requests).toEqual(["GET /api/auth/session"])
  })

  it("401 → refresh → retry still works after the check (e.g. 15 min later)", async () => {
    let profileCalls = 0
    routes["GET /api/profile"] = () =>
      ++profileCalls === 1 ? json(401, {}) : json(200, profile)
    routes["POST /api/auth/refresh"] = () => json(200, { success: true })
    renderApp()
    await waitFor(() => expect(probe()).toBe("authenticated:tester:0"))
    expect(requests).toContain("POST /api/auth/refresh")
    expect(profileCalls).toBe(2)
  })

  it("logout flips to anonymous and stops auth-only requests", async () => {
    routes["POST /logout"] = () => json(200, { success: true, message: "ok" })
    const store = renderApp()
    await waitFor(() => expect(probe()).toBe("authenticated:tester:0"))
    requests = []
    await act(async () => {
      await store.dispatch(userApi.endpoints.logout.initiate())
    })
    // (The shops/mine *cache* lives in the V2 slice, which logout has never
    // reset — only the session status and requests matter here.)
    await waitFor(() => expect(probe()).toMatch(/^anonymous:-:/))
    await act(() => new Promise((r) => setTimeout(r, 20)))
    expect(requests).toEqual(["POST /logout"])
  })

  it("a rejected refresh ends the session for later 401s", async () => {
    routes["POST /api/auth/refresh"] = () => json(401, { error: "Invalid" })
    await checkSession()
    await expect(refreshAuth()).resolves.toBe(false)
    resetRefreshBackoff()
    await expect(refreshAuth()).resolves.toBe(false)
    expect(
      requests.filter((r) => r === "POST /api/auth/refresh"),
    ).toHaveLength(1)
  })
})

describe("backend without /api/auth/session (deploy-order fallback)", () => {
  it("anonymous: probes exactly as before (profile 401 → refresh)", async () => {
    routes["GET /api/profile"] = () => json(401, {})
    routes["POST /api/auth/refresh"] = () => json(401, {})
    renderApp()
    await waitFor(() => expect(probe()).toBe("anonymous:-:-"))
    expect(requests).toEqual([
      "GET /api/auth/session",
      "GET /api/profile",
      "POST /api/auth/refresh",
    ])
  })

  it("logged in: profile and shops/mine load", async () => {
    routes["GET /api/profile"] = () => json(200, profile)
    routes["GET /api/v2/shops/mine"] = () => json(200, [])
    renderApp()
    await waitFor(() => expect(probe()).toBe("authenticated:tester:0"))
  })
})
