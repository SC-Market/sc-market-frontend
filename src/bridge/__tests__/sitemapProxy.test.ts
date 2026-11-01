// @vitest-environment node
import { describe, it, expect, vi } from "vitest"
import { handleSitemapRequest } from "../sitemapProxy"
import robotsTxt from "../../../public/robots.txt?raw"

const API = "https://api.sc-market.space"
const INDEX = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${API}/sitemap-static-0.xml</loc></sitemap><sitemap><loc>${API}/sitemap-market-0.xml</loc></sitemap></sitemapindex>`

class MemoryCache {
  entries = new Map<string, Response>()
  async match(request: Request) {
    return this.entries.get(request.url)?.clone()
  }
  async put(request: Request, response: Response) {
    this.entries.set(request.url, response)
  }
}

function setup(upstream: (url: string) => Promise<Response>) {
  const fetchSpy = vi.fn(upstream)
  const cache = new MemoryCache()
  const pending: Promise<unknown>[] = []
  const next = vi.fn(async () => new Response("NEXT"))
  const run = async (path: string, origin = "https://sc-market.space") => {
    const res = await handleSitemapRequest(
      {
        request: new Request(`${origin}${path}`),
        env: { ASSETS: { fetch: async () => new Response("") }, VITE_BACKEND_URL: API },
        next,
        waitUntil: (p) => pending.push(p),
      },
      { cache: cache as unknown as Cache, fetch: fetchSpy as unknown as typeof fetch },
    )
    await Promise.all(pending)
    return res
  }
  return { run, fetchSpy, next }
}

describe("main-host sitemap proxy", () => {
  it("serves the index with its sections on the main host, edge-cached", async () => {
    const { run, fetchSpy } = setup(async () => new Response(INDEX, { status: 200 }))
    const res = await run("/sitemap.xml")
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")).toBe("application/xml; charset=utf-8")
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=3600")
    const body = await res.text()
    expect(body).toContain("<loc>https://sc-market.space/sitemap-market-0.xml</loc>")
    expect(body).not.toContain(API)
    await run("/sitemap.xml")
    expect(fetchSpy).toHaveBeenCalledOnce()
    expect(fetchSpy.mock.calls[0][0]).toBe(`${API}/sitemap.xml`)
  })

  it("proxies a section as is", async () => {
    const section = `<?xml version="1.0"?><urlset><url><loc>https://sc-market.space/market/x</loc></url></urlset>`
    const { run, fetchSpy } = setup(async () => new Response(section))
    const res = await run("/sitemap-market-0.xml")
    expect(await res.text()).toBe(section)
    expect(fetchSpy.mock.calls[0][0]).toBe(`${API}/sitemap-market-0.xml`)
  })

  it("proxies hyphenated section names (missions-hubs)", async () => {
    const section = `<?xml version="1.0"?><urlset><url><loc>https://sc-market.space/missions/givers</loc></url></urlset>`
    const { run, fetchSpy, next } = setup(async () => new Response(section))
    const res = await run("/sitemap-missions-hubs-0.xml")
    expect(await res.text()).toBe(section)
    expect(fetchSpy.mock.calls[0][0]).toBe(`${API}/sitemap-missions-hubs-0.xml`)
    await run("/sitemap--0.xml")
    await run("/sitemap-missions--0.xml")
    expect(next).toHaveBeenCalledTimes(2)
  })

  it("an unknown section is a 404; an API failure a 503 with Retry-After, not cached", async () => {
    expect((await setup(async () => new Response("{}", { status: 404 })).run("/sitemap-nope-0.xml")).status).toBe(404)
    const failing = setup(async () => new Response("oops", { status: 500 }))
    const res = await failing.run("/sitemap.xml")
    expect(res.status).toBe(503)
    expect(res.headers.get("Retry-After")).toBe("600")
    await failing.run("/sitemap.xml")
    expect(failing.fetchSpy).toHaveBeenCalledTimes(2)
  })

  it("leaves other paths and white-label hosts to Pages", async () => {
    const { run, next, fetchSpy } = setup(async () => new Response(INDEX))
    await run("/sitemaps.xml")
    await run("/sitemap.xml", "https://shop.example-org.com")
    expect(next).toHaveBeenCalledTimes(2)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("robots.txt points at the main-host sitemap and keeps AI crawlers allowed", () => {
    expect(robotsTxt).toContain("Sitemap: https://sc-market.space/sitemap.xml")
    expect(robotsTxt).toContain("Disallow: /error")
    expect(robotsTxt).toMatch(/User-agent: \*\nContent-Signal: search=yes, ai-input=yes, ai-train=yes/)
    expect(robotsTxt).not.toMatch(/User-agent: (GPTBot|ClaudeBot|Google-Extended)/)
  })
})
