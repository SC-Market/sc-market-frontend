// @vitest-environment node
import { describe, it, expect, vi } from "vitest"
import { createApiFetch } from "../apiFetch"

class MemoryCache {
  entries = new Map<string, Response>()
  async match(request: Request) {
    return this.entries.get(request.url)?.clone()
  }
  async put(request: Request, response: Response) {
    this.entries.set(request.url, response)
  }
}

function setup(responder: (url: string, init?: RequestInit) => Response) {
  const calls: Array<{ url: string; init?: RequestInit }> = []
  const pending: Promise<unknown>[] = []
  const cache = new MemoryCache()
  const api = createApiFetch({
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), init })
      return responder(String(input), init)
    }) as typeof fetch,
    cache: cache as unknown as Cache,
    waitUntil: (p) => pending.push(p),
    timeoutMs: 1000,
    ttlSeconds: 60,
  })
  return { api, calls, cache, settle: () => Promise.all(pending) }
}

const URL_A = "https://api.example/api/v2/listings/a"

describe("createApiFetch", () => {
  it("sends a clean anonymous GET, whatever the caller passes", async () => {
    const { api, calls } = setup(() => Response.json({ ok: true }))
    const response = await api.fetch(
      new Request(URL_A, {
        headers: { Cookie: "session=secret", Authorization: "Bearer x" },
      }),
    )
    expect(await response.json()).toEqual({ ok: true })
    expect(calls).toHaveLength(1)
    const headers = new Headers(calls[0].init?.headers)
    expect([...headers.keys()]).toEqual(["accept"])
    expect(calls[0].init?.credentials).toBeUndefined()
  })

  it("refuses anything but GET", async () => {
    const { api, calls } = setup(() => Response.json({}))
    await expect(api.fetch(URL_A, { method: "POST" })).rejects.toThrow(/POST/)
    expect(calls).toHaveLength(0)
  })

  it("answers repeated URLs once per render, and from the edge cache after", async () => {
    const first = setup(() => Response.json({ n: 1 }))
    await first.api.fetch(URL_A)
    await first.api.fetch(URL_A)
    expect(first.calls).toHaveLength(1)
    await first.settle()

    // A second render sharing the same cache: no upstream call.
    const pending: Promise<unknown>[] = []
    const upstream = vi.fn()
    const second = createApiFetch({
      fetch: upstream as unknown as typeof fetch,
      cache: first.cache as unknown as Cache,
      waitUntil: (p) => pending.push(p),
      timeoutMs: 1000,
      ttlSeconds: 60,
    })
    const response = await second.fetch(URL_A)
    expect(await response.json()).toEqual({ n: 1 })
    expect(upstream).not.toHaveBeenCalled()
  })

  it("never reads the bridge's entries for the same URL", async () => {
    const { api, cache, calls } = setup(
      () => new Response("{}", { status: 404 }),
    )
    // The bridge's format: the API URL as the key, its own status header.
    cache.entries.set(
      URL_A,
      new Response("{}", { headers: { "x-bridge-upstream-status": "404" } }),
    )
    expect((await api.fetch(URL_A)).status).toBe(404)
    expect(calls).toHaveLength(1)
  })

  it("keeps 404s (cached) and the status", async () => {
    const { api, cache, settle } = setup(
      () => new Response("{}", { status: 404 }),
    )
    expect((await api.fetch(URL_A)).status).toBe(404)
    await settle()
    expect(cache.entries.size).toBe(1)
  })

  it("does not cache server errors", async () => {
    const { api, cache, settle } = setup(
      () => new Response("", { status: 503 }),
    )
    expect((await api.fetch(URL_A)).status).toBe(503)
    await settle()
    expect(cache.entries.size).toBe(0)
  })

  it("after freeze(), never answers and records the URL", async () => {
    const { api, calls } = setup(() => Response.json({}))
    api.freeze()
    let settled = false
    void api.fetch(URL_A).then(() => (settled = true))
    await new Promise((r) => setTimeout(r, 10))
    expect(settled).toBe(false)
    expect(calls).toHaveLength(0)
    expect(api.unprefetched).toEqual([URL_A])
  })
})
