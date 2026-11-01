// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import headersFile from "../../../public/_headers?raw"
import {
  API_TIMEOUT_MS,
  handleBridgeRequest,
  HOME_LINK_HEADER,
  HSTS_HEADER,
  SHELL_PATH,
  type BridgeRuntime,
} from "../handler"
import type { HtmlRewriterLike } from "../render"
import * as f from "./fixtures"

const SHELL = `<!doctype html><html><head><title>SC Market</title></head><body><div id="root"></div></body></html>`
const API = "https://api.example"

/**
 * Stand-in for HTMLRewriter (a Workers-only global): records the selectors
 * it was set up with and marks the body, so tests can tell a rewritten shell
 * from an untouched one. The real rewriting is exercised via wrangler.
 */
class FakeRewriter implements HtmlRewriterLike {
  static selectors: string[] = []
  on(selector: string): HtmlRewriterLike {
    FakeRewriter.selectors.push(selector)
    return this
  }
  transform(response: Response): Response {
    return new Response(`REWRITTEN ${FakeRewriter.selectors.join(",")}`, response)
  }
}

class MemoryCache {
  entries = new Map<string, Response>()
  async match(request: Request) {
    return this.entries.get(request.url)?.clone()
  }
  async put(request: Request, response: Response) {
    this.entries.set(request.url, response)
  }
}

type Upstream = (url: string, init?: RequestInit) => Promise<Response>

function setup(upstream: Upstream, env: Record<string, string | undefined> = {}) {
  const fetchSpy = vi.fn(upstream)
  const cache = new MemoryCache()
  const pending: Promise<unknown>[] = []
  const next = vi.fn(async () => new Response("NEXT", { status: 200 }))
  const assets = vi.fn(async (_input: Request | URL | string) => new Response(SHELL, { headers: { "Content-Type": "text/html; charset=utf-8" } }))
  const runtime: BridgeRuntime = {
    HTMLRewriter: FakeRewriter,
    cache: cache as unknown as Cache,
    fetch: fetchSpy as unknown as typeof fetch,
  }
  const run = async (path: string, init: RequestInit = {}, origin = "https://sc-market.space") => {
    const response = await handleBridgeRequest(
      {
        request: new Request(`${origin}${path}`, init),
        env: { ASSETS: { fetch: assets }, VITE_BACKEND_URL: API, ...env },
        next,
        waitUntil: (p) => pending.push(p),
      },
      runtime,
    )
    await Promise.all(pending)
    return response
  }
  return { run, fetchSpy, next, assets, cache }
}

const json = (body: unknown, status = 200) =>
  async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })

beforeEach(() => {
  FakeRewriter.selectors = []
})

describe("handleBridgeRequest", () => {
  it("passes white-label org domains through untouched, on every route", async () => {
    for (const path of ["/", "/market/71012eb4--pristine-medal", "/wiki/ships"]) {
      const { run, fetchSpy, next, assets } = setup(json(f.listing()))
      const res = await run(path, {}, "https://shop.example-org.com")
      expect(await res.text()).toBe("NEXT")
      expect(next).toHaveBeenCalledOnce()
      expect(fetchSpy).not.toHaveBeenCalled()
      expect(assets).not.toHaveBeenCalled()
    }
  })

  it("renders a known entity with the shell's caching + CORS headers", async () => {
    const { run, fetchSpy, assets } = setup(json(f.listing()))
    const res = await run("/market/71012eb4--pristine-medal")

    expect(res.status).toBe(200)
    expect(await res.text()).toContain("REWRITTEN")
    expect(FakeRewriter.selectors).toEqual(expect.arrayContaining(["title", "div#root", "head"]))
    expect(res.headers.get("Cache-Control")).toBe("no-cache")
    expect(res.headers.get("Content-Type")).toBe("text/html; charset=utf-8")
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://api.sc-market.space")
    expect(res.headers.get("X-SCM-Bridge")).toBe("page")
    expect(fetchSpy).toHaveBeenCalledWith(`${API}/api/v2/listings/71012eb4--pristine-medal`, expect.anything())
    // The SPA shell, by its pretty path (/ is the prerendered homepage).
    const shellRequest = assets.mock.calls[0][0] as Request
    expect(new URL(shellRequest.url).pathname).toBe(SHELL_PATH)
  })

  it("never forwards the visitor's cookies or headers to the API", async () => {
    const { run, fetchSpy } = setup(json(f.listing()))
    await run("/market/abc--x", {
      headers: { Cookie: "scmarket.sid=secret", Authorization: "Bearer t", "X-Forwarded-For": "1.2.3.4" },
    })
    const init = fetchSpy.mock.calls[0][1] as RequestInit
    expect(init.headers).toEqual({ Accept: "application/json" })
    expect(init).not.toHaveProperty("credentials")
  })

  it("v2 404 → 404 shell with noindex, no summary", async () => {
    const { run } = setup(json({ error: { code: "NOT_FOUND" } }, 404))
    const res = await run("/market/00000000--bogus")
    expect(res.status).toBe(404)
    expect(res.headers.get("X-SCM-Bridge")).toBe("notFound")
    expect(FakeRewriter.selectors).toContain("head")
    expect(FakeRewriter.selectors).not.toContain("div#root")
  })

  it.each([
    ["/contractor/ZZBOGUSZZ", { error: { code: "VALIDATION_ERROR", message: "Invalid contractor" } }],
    ["/user/zzbogususerzz", { error: "Invalid user" }],
  ])("v1 400 (%s) → 404", async (path, body) => {
    const { run } = setup(json(body, 400))
    expect((await run(path)).status).toBe(404)
  })

  it("v2 400 is an error, not 'unknown': fail open", async () => {
    const { run } = setup(json({ error: "bad" }, 400))
    const res = await run("/wiki/items/x")
    expect(res.status).toBe(200)
    expect(await res.text()).toBe(SHELL)
  })

  it.each([
    ["5xx", json({ error: "boom" }, 500)],
    ["network error", async () => { throw new TypeError("fetch failed") }],
    ["invalid JSON", async () => new Response("<html>", { status: 200 })],
    ["unexpected shape", json({ nothing: true })],
  ] as [string, Upstream][])("%s → unmodified shell, 200", async (_name, upstream) => {
    const { run } = setup(upstream)
    const res = await run("/market/abc--x")
    expect(res.status).toBe(200)
    expect(res.headers.get("X-SCM-Bridge")).toBe("passthrough")
    expect(await res.text()).toBe(SHELL)
  })

  describe("timeout", () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it(`aborts the API call after ${API_TIMEOUT_MS} ms and serves the shell`, async () => {
      const hang: Upstream = (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")))
        })
      const { run } = setup(hang)
      const pending = run("/wiki/ships/x")
      await vi.advanceTimersByTimeAsync(API_TIMEOUT_MS)
      const res = await pending
      expect(res.status).toBe(200)
      expect(await res.text()).toBe(SHELL)
    })
  })

  it("fails open when the API origin isn't configured", async () => {
    const { run, fetchSpy } = setup(json(f.listing()), { VITE_BACKEND_URL: undefined })
    const res = await run("/market/abc--x")
    expect(await res.text()).toBe(SHELL)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("edge-caches API JSON (and unknown answers) per URL", async () => {
    const { run, fetchSpy } = setup(json(f.ship))
    await run("/wiki/ships/57e51d27--crusader-intrepid")
    const firstRun = fetchSpy.mock.calls.length
    await run("/wiki/ships/57e51d27--crusader-intrepid")
    // The ship plus its related lookups (listings, other ships), each once.
    expect(firstRun).toBe(3)
    expect(fetchSpy).toHaveBeenCalledTimes(firstRun)

    const missing = setup(json({}, 404))
    expect((await missing.run("/wiki/ships/nope")).status).toBe(404)
    expect((await missing.run("/wiki/ships/nope")).status).toBe(404)
    expect(missing.fetchSpy).toHaveBeenCalledTimes(1)
  })

  it("does not cache errors", async () => {
    const { run, fetchSpy } = setup(json({}, 503))
    await run("/wiki/ships/x")
    await run("/wiki/ships/x")
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })

  it.each(["/market/cart", "/market/multiple/abc--x/edit", "/shops/create", "/wiki/refinery", "/favicon.ico", "/login"])(
    "leaves %s to Pages (next)",
    async (path) => {
      const { run, next, fetchSpy } = setup(json(f.listing()))
      expect(await (await run(path)).text()).toBe("NEXT")
      expect(next).toHaveBeenCalled()
      expect(fetchSpy).not.toHaveBeenCalled()
    },
  )

  it("leaves non-GET requests to Pages", async () => {
    const { run, next } = setup(json(f.listing()))
    await run("/market/abc--x", { method: "POST", body: "x" })
    expect(next).toHaveBeenCalled()
  })

  it("answers HEAD without a body", async () => {
    const { run } = setup(json(f.listing()))
    const res = await run("/market/71012eb4--pristine-medal", { method: "HEAD" })
    expect(res.status).toBe(200)
    expect(res.body).toBeNull()
  })

  it("301s a trailing slash to the bare path, keeping the query", async () => {
    const { run, fetchSpy } = setup(json(f.listing()))
    const res = await run("/market/71012eb4--pristine-medal/?utm_source=x")
    expect(res.status).toBe(301)
    expect(res.headers.get("Location")).toBe("https://sc-market.space/market/71012eb4--pristine-medal?utm_source=x")
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it.each(["/market/71012eb4-aaaa-bbbb-cccc-000000000000", "/market/71012eb4--old-title"])(
    "301s %s (bare UUID, stale slug) to the canonical slug",
    async (path) => {
      const { run } = setup(json(f.listing()))
      const res = await run(path)
      expect(res.status).toBe(301)
      expect(res.headers.get("Location")).toBe("https://sc-market.space/market/71012eb4--pristine-medal")
    },
  )

  it.each([
    ["sold", 404],
    ["expired", 404],
    ["inactive", 404],
    ["cancelled", 410],
  ])("a %s listing is a %i with noindex, never a soft 404", async (status, code) => {
    const gone = f.listing()
    gone.listing.status = status as typeof gone.listing.status
    const { run } = setup(json(gone))
    const res = await run("/market/71012eb4--pristine-medal")
    expect(res.status).toBe(code)
    expect(res.headers.get("X-SCM-Bridge")).toBe("notFound")
    expect(FakeRewriter.selectors).not.toContain("div#root")
  })

  it.each(["/user/JackedCitizen/market", "/user/JackedCitizen/services", "/shops/hades-svk-shop/bogus", "/contractor/NARCO/xyz"])(
    "an unknown profile tab (%s) is a 404",
    async (path) => {
      const body = path.startsWith("/user") ? f.user() : path.startsWith("/shops") ? f.shop() : f.contractor()
      const { run } = setup(json(body))
      expect((await run(path)).status).toBe(404)
    },
  )

  it("a search/filter query on a bridged page is noindex (canonical stays clean)", async () => {
    const { run } = setup(json({ listings: [], total: 0, page: 1, page_size: 48 }))
    const res = await run("/market?text=gold&sort_by=price")
    expect(res.status).toBe(200)
    expect(res.headers.get("X-SCM-Bridge")).toBe("page")
  })

  it("serves ?page=N of a live hub from that API page; past the end is a 404", async () => {
    const { run, fetchSpy } = setup(json({ listings: [{ listing_id: "l1", title: "L1", shop_name: "S", price_min: 5 }], total: 200, page: 3, page_size: 48 }))
    const res = await run("/market?page=3")
    expect(res.status).toBe(200)
    expect(fetchSpy.mock.calls[0][0]).toBe(`${API}/api/v2/listings/search?page=3&page_size=48&quantity_min=1`)
    expect((await run("/market?page=9")).status).toBe(404)
  })

  it("fetches the org's shop alongside the org, ignoring its failure", async () => {
    const { run, fetchSpy } = setup(async (url) =>
      url.includes("/shops/by-owner") ? new Response("", { status: 500 }) : json(f.contractor())(),
    )
    const res = await run("/contractor/NARCO")
    expect(res.headers.get("X-SCM-Bridge")).toBe("page")
    expect(fetchSpy.mock.calls.map((c) => c[0])).toEqual([
      `${API}/api/contractors/NARCO`,
      `${API}/api/v2/shops/by-owner?spectrum_id=NARCO`,
      // The same org on SC Orgs (by spectrum ID), for a link to it.
      "https://api.sc-orgs.space/api/v1/orgs/NARCO",
    ])
  })
})

describe("handleBridgeRequest: prerendered pages, static pages and hubs", () => {
  it.each([
    "/",
    "/wiki",
    "/wiki/items",
    "/wiki/locations",
    "/mining",
    "/blueprints",
    "/missions",
    "/guides",
    "/guides/buying/buy-an-item",
    "/about",
  ])(
    "passes prerendered %s through to its static file, untouched",
    async (path) => {
      const { run, fetchSpy, next, assets } = setup(json(f.wikiItems(3)))
      const res = await run(path)
      expect(await res.text()).toBe("NEXT")
      expect(next).toHaveBeenCalledOnce()
      expect(fetchSpy).not.toHaveBeenCalled()
      expect(assets).not.toHaveBeenCalled()
    },
  )

  it("prerendered hub with ?page=N: that page's head and links over the static file", async () => {
    const { run, fetchSpy, next } = setup(json({ ships: [{ id: "57e51d27-0000", name: "Intrepid" }], total: 216, page: 2, page_size: 24 }))
    next.mockResolvedValueOnce(new Response(SHELL, { headers: { "Content-Type": "text/html" } }))
    const res = await run("/wiki/ships?page=2")
    expect(res.status).toBe(200)
    expect(res.headers.get("X-SCM-Bridge")).toBe("page")
    expect(fetchSpy.mock.calls[0][0]).toBe(`${API}/api/v2/game-data/wiki/ships?page=2&page_size=24`)
    expect(FakeRewriter.selectors).toEqual(expect.arrayContaining(["title", "div#root"]))
  })

  it("prerendered hub with a filter query: the static file plus noindex, no API call", async () => {
    const { run, fetchSpy, next } = setup(json({}))
    next.mockResolvedValueOnce(new Response(SHELL, { headers: { "Content-Type": "text/html" } }))
    const res = await run("/wiki/items?type=Armor")
    expect(res.status).toBe(200)
    expect(res.headers.get("X-SCM-Bridge")).toBe("noindex")
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(FakeRewriter.selectors).toContain("head")
    expect(FakeRewriter.selectors).not.toContain("div#root")
  })

  describe("mission hub pages (prerendered per hub at build time)", () => {
    const PRERENDERED = `<!doctype html><html><head><title>Headhunters Missions</title></head><body><div id="root" data-prerendered><h1>Headhunters missions</h1></div></body></html>`
    const hub = {
      kind: "givers", slug: "new-giver", name: "New Giver", version_id: "v", mission_count: 3,
      legal_count: 3, illegal_count: 0, blueprint_mission_count: 0,
      givers: [], factions: [], types: [], systems: [], missions: [], page: 1, page_size: 100,
    }
    const html = (body: string) => new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } })

    it("serves the prerendered file as is, no API call", async () => {
      const { run, fetchSpy, next } = setup(json(hub))
      next.mockResolvedValueOnce(html(PRERENDERED))
      const res = await run("/missions/givers/headhunters")
      expect(res.status).toBe(200)
      expect(await res.text()).toBe(PRERENDERED)
      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it("a hub the build didn't prerender (the SPA fallback): the bridge's page from the API", async () => {
      const { run, fetchSpy, next } = setup(async (url) =>
        url.includes("/versions/active") ? json({})() : json(hub)(),
      )
      next.mockResolvedValueOnce(html(SHELL))
      const res = await run("/missions/givers/new-giver")
      expect(res.status).toBe(200)
      expect(res.headers.get("X-SCM-Bridge")).toBe("page")
      expect(fetchSpy.mock.calls.map((c) => c[0])).toContain(
        `${API}/api/v2/game-data/missions/hubs/givers/new-giver?page=1&page_size=100`,
      )
      expect(FakeRewriter.selectors).toEqual(expect.arrayContaining(["title", "div#root"]))
    })

    it("an unknown hub: 404 with noindex, not the shell with a 200", async () => {
      const { run, next } = setup(json({ error: "not found" }, 404))
      next.mockResolvedValueOnce(html(SHELL))
      const res = await run("/missions/types/no-such-type")
      expect(res.status).toBe(404)
      expect(res.headers.get("X-SCM-Bridge")).toBe("notFound")
      expect(FakeRewriter.selectors).toContain("head")
    })

    it("an API failure serves the shell as is (fail open)", async () => {
      const { run, next } = setup(json({}, 500))
      next.mockResolvedValueOnce(html(SHELL))
      const res = await run("/missions/systems/pyro")
      expect(res.status).toBe(200)
      expect(await res.text()).toBe(SHELL)
    })
  })

  it("keeps the homepage's Link header in public/_headers (a static file now)", () => {
    expect(headersFile).toContain(`/\n  Link: ${HOME_LINK_HEADER}`)
  })

  it("sends HSTS on the main site, matching public/_headers", async () => {
    const { run } = setup(json(f.listing()))
    const res = await run("/market/71012eb4--pristine-medal")
    expect(res.headers.get("Strict-Transport-Security")).toBe(HSTS_HEADER)
    expect(HSTS_HEADER).not.toMatch(/includeSubDomains|preload/)
    expect(headersFile).toContain(
      `https://sc-market.space/*\n  Strict-Transport-Security: ${HSTS_HEADER}`,
    )
    expect(headersFile).toContain(
      `https://www.sc-market.space/*\n  Strict-Transport-Security: ${HSTS_HEADER}`,
    )
    // Not as a catch-all rule, which would also hit white-label domains.
    const catchAll = headersFile.split(/\n\n/).find((b) => b.startsWith("/*"))
    expect(catchAll).not.toContain("Strict-Transport-Security")
  })

  it("does not send HSTS on plain-http dev hosts", async () => {
    const { run } = setup(json(f.listing()))
    const res = await run(
      "/market/71012eb4--pristine-medal",
      {},
      "http://localhost",
    )
    expect(res.headers.get("Strict-Transport-Security")).toBeNull()
  })

  it("never sets Link on bridged pages", async () => {
    const { run } = setup(json(f.listing()))
    expect(
      (await run("/market/71012eb4--pristine-medal")).headers.get("Link"),
    ).toBeNull()
  })

  it("fetches one bounded list per hub", async () => {
    const { run, fetchSpy } = setup(json({ items: [], total: 0 }))
    await run("/recruiting")
    expect(fetchSpy.mock.calls.map((c) => c[0])).toEqual([
      `${API}/api/recruiting/posts?index=0&pageSize=50&sorting=activity`,
    ])
  })

  it.each([404, 400, 500])("a hub list %i fails open (never a 404 page)", async (status) => {
    const { run } = setup(json({}, status))
    const res = await run("/recruiting")
    expect(res.status).toBe(200)
    expect(res.headers.get("X-SCM-Bridge")).toBe("passthrough")
    expect(await res.text()).toBe(SHELL)
  })

  it.each(["/market/aggregate/00000000--bogus", "/market/multiple/00000000--bogus", "/wiki/manufacturers/zzbogus"])(
    "unknown %s → 404 + noindex",
    async (path) => {
      const { run } = setup(json({ error: "not found" }, 404))
      const res = await run(path)
      expect(res.status).toBe(404)
      expect(res.headers.get("X-SCM-Bridge")).toBe("notFound")
    },
  )

  it("renders an aggregate listing page", async () => {
    const { run, fetchSpy } = setup(json(f.aggregate()))
    const res = await run("/market/aggregate/1954c364--medal")
    expect(res.headers.get("X-SCM-Bridge")).toBe("page")
    expect(fetchSpy.mock.calls[0][0]).toBe(`${API}/api/v2/game-items/1954c364--medal/listings`)
  })
})
