import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  checkSession,
  markSessionAnonymous,
  pendingSessionCheck,
  resetSessionCheck,
  sessionCheckResult,
} from "../sessionCheck"

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

let fetchMock: ReturnType<typeof vi.fn>
let originalFetch: typeof fetch

beforeEach(() => {
  resetSessionCheck()
  originalFetch = globalThis.fetch
  fetchMock = vi.fn()
  globalThis.fetch = fetchMock as unknown as typeof fetch
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe("checkSession", () => {
  it("GETs /api/auth/session with credentials and no caching", async () => {
    fetchMock.mockResolvedValue(json(200, { authenticated: true }))
    await expect(checkSession()).resolves.toBe("authenticated")
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/\/api\/auth\/session$/)
    expect(init).toMatchObject({ credentials: "include", cache: "no-store" })
  })

  it.each([
    ["200 authenticated:false", json(200, { authenticated: false }), "anonymous"],
    ["404 (backend without the endpoint)", json(404, { error: "Not found" }), "unsupported"],
    ["429", json(429, {}), "unsupported"],
    ["503", json(503, {}), "unsupported"],
    ["200 without a boolean", json(200, { authenticated: "yes" }), "unsupported"],
    ["200 non-JSON", new Response("<html>", { status: 200 }), "unsupported"],
  ])("%s → %s", async (_label, response, expected) => {
    fetchMock.mockResolvedValue(response)
    await expect(checkSession()).resolves.toBe(expected)
  })

  it("network error → unsupported", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"))
    await expect(checkSession()).resolves.toBe("unsupported")
  })

  it("is single-flight and cached for the page", async () => {
    fetchMock.mockResolvedValue(json(200, { authenticated: true }))
    const a = checkSession()
    const b = checkSession()
    expect(pendingSessionCheck()).not.toBeNull()
    await Promise.all([a, b])
    await checkSession()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(pendingSessionCheck()).toBeNull()
    expect(sessionCheckResult()).toBe("authenticated")
  })

  it("a logout during the request wins over its stale answer", async () => {
    let resolve!: (r: Response) => void
    fetchMock.mockReturnValue(new Promise<Response>((r) => (resolve = r)))
    const pending = checkSession()
    markSessionAnonymous()
    resolve(json(200, { authenticated: true }))
    await expect(pending).resolves.toBe("anonymous")
    expect(sessionCheckResult()).toBe("anonymous")
  })
})
