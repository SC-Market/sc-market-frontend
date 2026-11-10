// @vitest-environment node
import { describe, it, expect, vi } from "vitest"
import { handleSitemapRequest } from "../sitemapProxy"
import { PRIVATE_ROBOTS, whiteLabelRobots } from "../whiteLabelSeo"
import robotsTxt from "../../../public/robots.txt?raw"

const API = "https://api.sc-market.space"
const HOST = "https://medrunner.sc-market.space"

class MemoryCache {
  entries = new Map<string, Response>()
  async match(request: Request) {
    return this.entries.get(request.url)?.clone()
  }
  async put(request: Request, response: Response) {
    this.entries.set(request.url, response)
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

const DOMAIN = {
  data: {
    spectrum_id: "MEDRUNNER",
    contractor_id: "c1",
    name: "Medrunner",
    focus_mode: "public",
    homepage_path: null,
    require_membership: false,
  },
}

function setup(
  upstream: Record<string, () => Response>,
  env: Record<string, string> = { SSR_ENABLED: "true", SSR_VARIANTS: "host" },
) {
  const fetchSpy = vi.fn(async (url: string) => {
    const route = Object.keys(upstream).find((path) => url.endsWith(path))
    return route ? upstream[route]() : json({}, 500)
  })
  const cache = new MemoryCache()
  const pending: Promise<unknown>[] = []
  const next = vi.fn(async () => new Response(robotsTxt))
  const run = async (path: string, origin = HOST) => {
    const res = await handleSitemapRequest(
      {
        request: new Request(`${origin}${path}`),
        env: {
          ASSETS: { fetch: async () => new Response("") },
          VITE_BACKEND_URL: API,
          ...env,
        },
        next,
        waitUntil: (p) => pending.push(p),
      },
      {
        cache: cache as unknown as Cache,
        fetch: fetchSpy as unknown as typeof fetch,
      },
    )
    await Promise.all(pending)
    return res
  }
  return { run, fetchSpy, next }
}

describe("white-label robots.txt", () => {
  it("is the site's rules, pointing at the host's own sitemap", async () => {
    const { run } = setup({
      "/api/domain/medrunner.sc-market.space": () => json(DOMAIN),
    })
    const res = await run("/robots.txt")
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain("Disallow: /settings")
    expect(body).toContain(`Sitemap: ${HOST}/sitemap.xml`)
    expect(body).not.toContain("Sitemap: https://sc-market.space/")
  })

  it("disallows everything on a members-only domain", async () => {
    const { run } = setup({
      "/api/domain/medrunner.sc-market.space": () =>
        json({ data: { ...DOMAIN.data, require_membership: true } }),
    })
    expect(await (await run("/robots.txt")).text()).toBe(PRIVATE_ROBOTS)
  })

  it("is the static file on the main site, an unknown host, or with the variant off", async () => {
    const main = setup({})
    await main.run("/robots.txt", "https://sc-market.space")
    expect(main.next).toHaveBeenCalled()
    expect(main.fetchSpy).not.toHaveBeenCalled()

    const unknown = setup({
      "/api/domain/medrunner.sc-market.space": () => json({}, 404),
    })
    await unknown.run("/robots.txt")
    expect(unknown.next).toHaveBeenCalledTimes(1)

    const off = setup({}, { SSR_ENABLED: "true", SSR_VARIANTS: "theme,locale" })
    await off.run("/robots.txt")
    expect(off.next).toHaveBeenCalled()
    expect(off.fetchSpy).not.toHaveBeenCalled()
  })

  it("keeps the rules when the site has no Sitemap line", () => {
    expect(whiteLabelRobots("User-agent: *\nDisallow: /x\n", HOST)).toBe(
      `User-agent: *\nDisallow: /x\n\nSitemap: ${HOST}/sitemap.xml\n`,
    )
  })
})

describe("white-label sitemap.xml", () => {
  it("lists the org page, its active shops and its listings on the host", async () => {
    const { run, fetchSpy } = setup({
      "/api/domain/medrunner.sc-market.space": () => json(DOMAIN),
      "/api/v2/shops/by-owner?spectrum_id=MEDRUNNER": () =>
        json([
          { slug: "medrunner", status: "active" },
          { slug: "old", status: "archived" },
        ]),
      "/api/v2/listings/search?org=MEDRUNNER&page=1&page_size=100&quantity_min=1":
        () =>
          json({
            listings: [
              {
                listing_id: "0b1c2d3e-0000-4000-8000-000000000001",
                title: "Med Pen",
              },
              {
                listing_id: "0b1c2d3e-0000-4000-8000-000000000001",
                title: "Med Pen",
              },
            ],
            total: 1,
          }),
    })
    const res = await run("/sitemap.xml")
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")).toContain("application/xml")
    const xml = await res.text()
    expect(xml).toContain(`<loc>${HOST}/contractor/MEDRUNNER</loc>`)
    expect(xml).toContain(`<loc>${HOST}/shops/medrunner</loc>`)
    expect(xml).not.toContain("/shops/old")
    expect(xml.match(/<loc>[^<]*\/market\/[^<]*<\/loc>/g)).toHaveLength(1)
    expect(xml).not.toContain("https://sc-market.space")
    // Cached per host: a second request makes no API call.
    const calls = fetchSpy.mock.calls.length
    await run("/sitemap.xml")
    expect(fetchSpy.mock.calls.length).toBe(calls)
  })

  it("has no section files, and nothing behind a sign-in", async () => {
    const { run } = setup({
      "/api/domain/medrunner.sc-market.space": () => json(DOMAIN),
    })
    expect((await run("/sitemap-market-0.xml")).status).toBe(404)
    const members = setup({
      "/api/domain/medrunner.sc-market.space": () =>
        json({ data: { ...DOMAIN.data, focus_mode: "internal" } }),
    })
    expect((await members.run("/sitemap.xml")).status).toBe(404)
  })

  it("is a 503 with Retry-After when the API fails, never cached", async () => {
    const { run } = setup({
      "/api/domain/medrunner.sc-market.space": () => json(DOMAIN),
      "/api/v2/shops/by-owner?spectrum_id=MEDRUNNER": () => json({}, 502),
    })
    const res = await run("/sitemap.xml")
    expect(res.status).toBe(503)
    expect(res.headers.get("Retry-After")).toBe("600")
  })
})
