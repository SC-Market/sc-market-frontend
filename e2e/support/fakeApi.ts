/**
 * The e2e suite's backend: every request the app makes to its API is answered
 * here, in the test process. Nothing reaches a real server.
 *
 * The e2e build (npm run e2e:build) points VITE_BACKEND_URL at the app's own
 * origin, so API calls are same-origin (no CORS) and are intercepted by
 * Playwright before they leave the browser. Requests to any other origin are
 * aborted (analytics, CDN images, fonts), so a test can never call production.
 *
 * Endpoints: the market fixtures below, the session check, then the route
 * regression harness's fake API (profile, fixture org, fixture shop) and a 404
 * for everything else, like the harness.
 */
import type { BrowserContext, Route } from "@playwright/test"
import {
  createFakeApi,
  type SessionKind,
} from "../../src/router/__tests__/regression/fixtures"
import { FakeCart, listingDetail, searchListings } from "./marketFixtures"

export const APP_ORIGIN = "http://localhost:4173"

/** Paths on the app origin that belong to the API, not the static build. */
const API_PREFIXES = ["/api/", "/auth/", "/socket.io/"]

export interface FakeApi {
  session: SessionKind
  cart: FakeCart
  /** Every API request, in order ("GET /api/v2/listings/search?..."). */
  requests: string[]
  /** Requests that fell through to the 404 (useful when a page misbehaves). */
  unhandled: string[]
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  })
}

export async function installFakeApi(
  context: BrowserContext,
  session: SessionKind,
): Promise<FakeApi> {
  const harness = createFakeApi(session)
  const api: FakeApi = {
    session,
    cart: new FakeCart(),
    requests: [],
    unhandled: [],
  }
  const loggedIn = session !== "anonymous"

  await context.route("**/*", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.origin !== APP_ORIGIN) return route.abort("blockedbyclient")
    if (!API_PREFIXES.some((p) => url.pathname.startsWith(p)))
      return route.continue()

    const method = request.method()
    const path = url.pathname
    api.requests.push(`${method} ${path}${url.search}`)

    if (path === "/api/auth/session")
      return json(route, { authenticated: loggedIn })
    if (path === "/api/auth/refresh")
      return json(route, { error: { code: "UNAUTHORIZED" } }, 401)
    if (path.startsWith("/socket.io/")) return route.abort("connectionrefused")

    if (method === "GET" && path === "/api/v2/listings/search")
      return json(route, searchListings(url.searchParams))
    // Listing ids arrive as UUIDs or short slugs ("11111111--laser-rifle").
    const detail = /^\/api\/v2\/listings\/([0-9a-f]{8}(?:-[\w-]*)?)$/.exec(path)
    if (method === "POST" && /^\/api\/v2\/listings\/[\w-]+\/views$/.test(path))
      return route.fulfill({ status: 204 })
    if (method === "GET" && detail) {
      const body = listingDetail(detail[1])
      return body
        ? json(route, body)
        : json(route, { error: { code: "NOT_FOUND" } }, 404)
    }

    if (path === "/api/v2/cart" && method === "GET") {
      if (!loggedIn)
        return json(route, { error: { code: "UNAUTHORIZED" } }, 401)
      return json(route, api.cart.view())
    }
    if (path === "/api/v2/cart/add" && method === "POST" && loggedIn) {
      const added = api.cart.add(request.postDataJSON())
      return added
        ? json(route, added)
        : json(route, { error: { code: "NOT_FOUND" } }, 404)
    }
    const cartItem = /^\/api\/v2\/cart\/([\w-]+)$/.exec(path)
    if (cartItem && method === "DELETE" && loggedIn) {
      return api.cart.remove(cartItem[1])
        ? json(route, { message: "Removed" })
        : json(route, { error: { code: "NOT_FOUND" } }, 404)
    }

    // The route regression harness's endpoints (profile, org, shop), then 404.
    const response = await harness.fetchImpl(
      new Request(url.toString(), { method }),
    )
    if (response.status === 404) api.unhandled.push(`${method} ${path}`)
    return route.fulfill({
      status: response.status,
      contentType: "application/json",
      body: await response.text(),
    })
  })
  return api
}
