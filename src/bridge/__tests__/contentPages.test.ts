// @vitest-environment node
/**
 * Help & Guides / About through the bridge, using the real compiled content
 * and the same JSON files the build emits (served by a fake env.ASSETS).
 */
import { describe, expect, it, vi } from "vitest"
import {
  aboutAsset,
  categoryAsset,
  compileSite,
  contentIndex,
  guideAsset,
  type SourceFile,
} from "../../features/help/build/compile"
import { CONTENT_ASSET_PATHS } from "../../features/help/domain/assetPaths"
import { resolvePage, type BridgeEnv, type BridgeRuntime } from "../handler"
import { headMarkup, summaryChunks } from "../render"
import type { BridgeDocument } from "../pages"

const raw = import.meta.glob<string>("/content/**/*.{md,json}", { query: "?raw", import: "default", eager: true })
const files: SourceFile[] = Object.entries(raw).map(([path, source]) => ({
  path: path.replace(/^\/content\//, ""),
  source,
}))
const site = compileSite(files, { today: "2100-01-01" })
const guide = site.guides.find((g) => g.meta.howto)!
const category = site.categories.find((c) => c.id === guide.meta.category)!

const ASSETS: Record<string, unknown> = {
  [CONTENT_ASSET_PATHS.index]: { version: 1, ...contentIndex(site) },
  [CONTENT_ASSET_PATHS.about]: aboutAsset(site),
  [CONTENT_ASSET_PATHS.category(category.id)]: categoryAsset(site, category),
  [CONTENT_ASSET_PATHS.guide(guide.meta.category, guide.meta.slug)]: guideAsset(site, guide),
}

function env(fallback: "404" | "spa" = "404"): BridgeEnv & { ASSETS: { fetch: ReturnType<typeof vi.fn> } } {
  return {
    ASSETS: {
      fetch: vi.fn(async (input: Request | URL | string) => {
        const url = new URL(input instanceof Request ? input.url : input.toString())
        const body = ASSETS[url.pathname]
        if (body) return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } })
        return fallback === "404"
          ? new Response("Not found", { status: 404 })
          : new Response("<!doctype html>", { headers: { "Content-Type": "text/html" } })
      }),
    },
    VITE_FRONTEND_URL: "https://sc-market.space",
  }
}

const runtime: BridgeRuntime = {
  HTMLRewriter: class {} as unknown as BridgeRuntime["HTMLRewriter"],
  fetch: vi.fn(async () => {
    throw new Error("content pages must not call the API")
  }) as unknown as typeof fetch,
}

async function resolve(path: string, e = env()) {
  return resolvePage(new URL(`https://sc-market.space${path}`), e, runtime, () => {})
}

async function doc(path: string): Promise<BridgeDocument> {
  const outcome = await resolve(path)
  if (outcome.kind !== "page") throw new Error(`expected a page for ${path}, got ${outcome.kind}`)
  return outcome.doc
}

function jsonLdTypes(d: BridgeDocument): string[] {
  return d.head.jsonLd.map((node) => (node as { "@type": string })["@type"])
}

const html = (d: BridgeDocument) => summaryChunks(d.summary).map((c) => c.content).join("")

describe("bridge: guide pages", () => {
  const path = `/guides/${guide.meta.category}/${guide.meta.slug}`

  it("renders the whole guide as text with TechArticle, HowTo and BreadcrumbList", async () => {
    const d = await doc(path)
    expect(d.title).toBe(`${guide.meta.title} — SC Market Guides`)
    expect(d.canonical).toBe(`https://sc-market.space${path}`)
    expect(jsonLdTypes(d)).toEqual(["BreadcrumbList", "TechArticle", "HowTo"])
    const howTo = d.head.jsonLd[2] as { step: { text: string }[] }
    expect(howTo.step.map((s) => s.text)).toEqual(guide.body.steps)
    const crumbs = d.head.jsonLd[0] as { itemListElement: { name: string }[] }
    expect(crumbs.itemListElement.map((c) => c.name)).toEqual([
      "SC Market",
      "Help & Guides",
      category.title,
      guide.meta.title,
    ])
    const article = d.head.jsonLd[1] as { author: { name: string }; dateModified: string }
    expect(article.author.name).toBe("Khuzdul")
    expect(article.dateModified).toBe(guide.meta.updated)

    const body = html(d)
    expect(body).toContain("<h1>")
    expect(body).toContain("<ol>")
    for (const step of guide.body.steps) expect(body).toContain(step)
    // Site links from the guide end up in the crawlable Related list.
    expect(body).toContain(`<a href="/guides/${category.id}">`)
    expect(headMarkup(d.head, d.canonical, false)).toContain('"@type":"HowTo"')
  })

  it("includes the full guides directory as crawlable links", async () => {
    const body = html(await doc(path))
    expect(body).toContain("All guides")
    for (const g of site.guides) expect(body).toContain(`<a href="/guides/${g.meta.category}/${g.meta.slug}">`)
    for (const c of site.categories) expect(body).toContain(`<a href="/guides/${c.id}">`)
    expect(body).toContain('<a href="/about">')
  })

  it("reads static assets only, never the API", async () => {
    const e = env()
    await resolve(path, e)
    expect(runtime.fetch).not.toHaveBeenCalled()
    expect(new URL((e.ASSETS.fetch.mock.calls[0][0] as Request).url).pathname).toBe(
      CONTENT_ASSET_PATHS.guide(guide.meta.category, guide.meta.slug),
    )
  })

  it.each([
    ["an unknown guide (asset 404)", `/guides/${category.id}/no-such-guide`, "404"],
    ["an unknown guide (SPA fallback HTML)", `/guides/${category.id}/no-such-guide`, "spa"],
    ["an unknown category", "/guides/no-such-category", "404"],
    ["params that can't name a file", "/guides/..%2F..%2Fx/y", "404"],
    ["upper-case params", `/guides/${category.id}/Buy`, "404"],
  ] as const)("is a 404 for %s", async (_name, p, fallback) => {
    const outcome = await resolve(p, env(fallback))
    expect(outcome.kind).toBe("notFound")
  })
})

describe("bridge: hubs and About", () => {
  it("renders the hub with links to every category and guide", async () => {
    const d = await doc("/guides")
    expect(jsonLdTypes(d)).toEqual(["BreadcrumbList", "CollectionPage"])
    const body = html(d)
    for (const c of site.categories) expect(body).toContain(`<a href="/guides/${c.id}">`)
    for (const g of site.guides) expect(body).toContain(`<a href="/guides/${g.meta.category}/${g.meta.slug}">`)
    expect(body).toContain('<a href="/about">')
  })

  it("renders a category page with the directory", async () => {
    const d = await doc(`/guides/${category.id}`)
    expect(d.canonical).toBe(`https://sc-market.space/guides/${category.id}`)
    expect(html(d)).toContain(`<h1>`)
    for (const g of site.guides) expect(html(d)).toContain(`<a href="/guides/${g.meta.category}/${g.meta.slug}">`)
  })

  it("renders About with AboutPage JSON-LD pointing at the Organization", async () => {
    const d = await doc("/about")
    expect(jsonLdTypes(d)).toEqual(["BreadcrumbList", "AboutPage"])
    expect((d.head.jsonLd[1] as { mainEntity: unknown }).mainEntity).toEqual({
      "@id": "https://sc-market.space/#organization",
    })
    expect(html(d)).toContain("not affiliated with the Cloud Imperium group")
    for (const g of site.guides) expect(html(d)).toContain(`<a href="/guides/${g.meta.category}/${g.meta.slug}">`)
  })
})
