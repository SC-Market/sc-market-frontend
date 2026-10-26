// @vitest-environment node
/**
 * Moved Help & Guides URLs: the edge answers each old path with a 301 to the
 * new one (Pages skips public/_redirects for Function routes), and the old
 * path is gone from the content build (no page, not in the sitemap manifest).
 */
import { describe, expect, it, vi } from "vitest"
import { checkRedirects, compileSite, sitemapManifest, type SourceFile } from "../../features/help/build/compile"
import { GUIDE_REDIRECTS, guideRedirectTarget } from "../../features/help/domain/redirects"
import { HELP_PATHS } from "../../routes/paths"
import { handleBridgeRequest, type BridgeRuntime } from "../handler"

const raw = import.meta.glob<string>("/content/**/*.{md,json}", { query: "?raw", import: "default", eager: true })
const files: SourceFile[] = Object.entries(raw).map(([path, source]) => ({
  path: path.replace(/^\/content\//, ""),
  source,
}))
const site = compileSite(files, { today: "2100-01-01" })
const manifestPaths = new Set(sitemapManifest(site).pages.map((p) => p.path))
const livePaths = new Set([
  ...site.categories.map((c) => HELP_PATHS.category(c.id)),
  ...site.guides.map((g) => HELP_PATHS.guide(g.meta.category, g.meta.slug)),
])

function run(path: string, origin = "https://sc-market.space", method = "GET") {
  const next = vi.fn(async () => new Response("NEXT"))
  const assets = vi.fn(async () => new Response("<!doctype html>", { headers: { "Content-Type": "text/html" } }))
  const runtime: BridgeRuntime = {
    HTMLRewriter: class {} as unknown as BridgeRuntime["HTMLRewriter"],
    fetch: vi.fn() as unknown as typeof fetch,
  }
  return handleBridgeRequest(
    { request: new Request(`${origin}${path}`, { method }), env: { ASSETS: { fetch: assets } }, next, waitUntil: () => {} },
    runtime,
  ).then((res) => ({ res, next, assets }))
}

const cases = Object.entries(GUIDE_REDIRECTS)

describe("moved guide URLs", () => {
  it("has redirects to check", () => {
    expect(cases.length).toBeGreaterThan(0)
  })

  it.each(cases)("%s → 301 %s", async (from, to) => {
    const { res, next, assets } = await run(from)
    expect(res.status).toBe(301)
    expect(res.headers.get("Location")).toBe(`https://sc-market.space${to}`)
    expect(next).not.toHaveBeenCalled()
    expect(assets).not.toHaveBeenCalled()
  })

  it.each(cases)("%s is gone from the build; %s is a live page in the sitemap", (from, to) => {
    expect(livePaths.has(from)).toBe(false)
    expect(manifestPaths.has(from)).toBe(false)
    expect(livePaths.has(to)).toBe(true)
    expect(manifestPaths.has(to)).toBe(true)
  })

  it("never redirects to another redirect", () => {
    for (const [, to] of cases) expect(guideRedirectTarget(to)).toBeNull()
  })

  it("keeps the query, ignores case and a trailing slash, and answers HEAD", async () => {
    const [from, to] = cases[0]
    const { res } = await run(`${from.toUpperCase()}/?utm_source=x`, "https://sc-market.space", "HEAD")
    expect(res.status).toBe(301)
    expect(res.headers.get("Location")).toBe(`https://sc-market.space${to}?utm_source=x`)
  })

  it("redirects on the host it was asked on", async () => {
    const [from, to] = cases[0]
    const { res } = await run(from, "https://www.sc-market.space")
    expect(res.headers.get("Location")).toBe(`https://www.sc-market.space${to}`)
  })

  it("never redirects a live page", () => {
    for (const path of livePaths) expect(guideRedirectTarget(path), path).toBeNull()
  })

  it("the content build accepts the real map and rejects a stale or dangling one", () => {
    expect(() => checkRedirects(site)).not.toThrow()
    const [live] = livePaths
    expect(() => checkRedirects(site, { [live]: "/guides" })).toThrow(/still a page/)
    expect(() => checkRedirects(site, { "/guides/old/x": "/guides/nope/x" })).toThrow(/isn't a page/)
  })
})
