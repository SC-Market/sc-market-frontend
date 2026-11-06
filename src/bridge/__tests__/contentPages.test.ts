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
import {
  handleBridgeRequest,
  resolvePage,
  SHELL_PATH,
  type BridgeEnv,
  type BridgeRuntime,
} from "../handler"
import { matchBridgeRoute } from "../routes"
import type { HtmlRewriterLike } from "../render"
import { headMarkup, summaryChunks } from "../render"
import type { BridgeDocument } from "../pages"

const raw = import.meta.glob<string>("/content/**/*.{md,json}", {
  query: "?raw",
  import: "default",
  eager: true,
})
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
  [CONTENT_ASSET_PATHS.guide(guide.meta.category, guide.meta.slug)]: guideAsset(
    site,
    guide,
  ),
}

function env(
  fallback: "404" | "spa" = "404",
): BridgeEnv & { ASSETS: { fetch: ReturnType<typeof vi.fn> } } {
  return {
    ASSETS: {
      fetch: vi.fn(async (input: Request | URL | string) => {
        const url = new URL(
          input instanceof Request ? input.url : input.toString(),
        )
        const body = ASSETS[url.pathname]
        if (body)
          return new Response(JSON.stringify(body), {
            headers: { "Content-Type": "application/json" },
          })
        return fallback === "404"
          ? new Response("Not found", { status: 404 })
          : new Response("<!doctype html>", {
              headers: { "Content-Type": "text/html" },
            })
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
  return resolvePage(
    new URL(`https://sc-market.space${path}`),
    e,
    runtime,
    () => {},
  )
}

async function doc(path: string): Promise<BridgeDocument> {
  const outcome = await resolve(path)
  if (outcome.kind !== "page")
    throw new Error(`expected a page for ${path}, got ${outcome.kind}`)
  return outcome.doc
}

function jsonLdTypes(d: BridgeDocument): string[] {
  return d.head.jsonLd.map((node) => (node as { "@type": string })["@type"])
}

const html = (d: BridgeDocument) =>
  summaryChunks(d.summary)
    .map((c) => c.content)
    .join("")

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
    const article = d.head.jsonLd[1] as {
      author: { name: string }
      dateModified: string
    }
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
    for (const g of site.guides)
      expect(body).toContain(
        `<a href="/guides/${g.meta.category}/${g.meta.slug}">`,
      )
    for (const c of site.categories)
      expect(body).toContain(`<a href="/guides/${c.id}">`)
    expect(body).toContain('<a href="/about">')
  })

  it("reads static assets only, never the API", async () => {
    const e = env()
    await resolve(path, e)
    expect(runtime.fetch).not.toHaveBeenCalled()
    expect(
      new URL((e.ASSETS.fetch.mock.calls[0][0] as Request).url).pathname,
    ).toBe(CONTENT_ASSET_PATHS.guide(guide.meta.category, guide.meta.slug))
  })

  it.each([
    [
      "an unknown guide (asset 404)",
      `/guides/${category.id}/no-such-guide`,
      "404",
    ],
    [
      "an unknown guide (SPA fallback HTML)",
      `/guides/${category.id}/no-such-guide`,
      "spa",
    ],
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
    for (const c of site.categories)
      expect(body).toContain(`<a href="/guides/${c.id}">`)
    for (const g of site.guides)
      expect(body).toContain(
        `<a href="/guides/${g.meta.category}/${g.meta.slug}">`,
      )
    expect(body).toContain('<a href="/about">')
  })

  it("renders a category page with the directory", async () => {
    const d = await doc(`/guides/${category.id}`)
    expect(d.canonical).toBe(`https://sc-market.space/guides/${category.id}`)
    expect(html(d)).toContain(`<h1>`)
    for (const g of site.guides)
      expect(html(d)).toContain(
        `<a href="/guides/${g.meta.category}/${g.meta.slug}">`,
      )
  })

  it("renders About with AboutPage JSON-LD pointing at the Organization", async () => {
    const d = await doc("/about")
    expect(jsonLdTypes(d)).toEqual(["BreadcrumbList", "AboutPage"])
    expect((d.head.jsonLd[1] as { mainEntity: unknown }).mainEntity).toEqual({
      "@id": "https://sc-market.space/#organization",
    })
    expect(html(d)).toContain("not affiliated with the Cloud Imperium group")
    for (const g of site.guides)
      expect(html(d)).toContain(
        `<a href="/guides/${g.meta.category}/${g.meta.slug}">`,
      )
  })
})

describe("bridge: guide translations", () => {
  // The real content plus a German translation of `guide`, up to date with
  // its English body, and a stale French one.
  const english = guide.file
  const translated = compileSite(
    [
      ...files,
      {
        path: english.replace(/\.md$/, ".de.md"),
        source: `---\ntitle: Anleitung auf Deutsch\ndescription: Kurz gesagt.\nsource_hash: ${guide.sourceHash}\n---\nHallo [Markt](/market).\n`,
      },
      {
        path: english.replace(/\.md$/, ".fr.md"),
        source: `---\ntitle: Guide en français\ndescription: En bref.\nsource_hash: 0123456789ab\n---\nBonjour.\n`,
      },
    ],
    { today: "2100-01-01" },
  )
  const tGuide = translated.guides.find((g) => g.meta.id === guide.meta.id)!
  const de = tGuide.translations.find((t) => t.locale === "de")!
  const path = `/guides/${guide.meta.category}/${guide.meta.slug}`
  const origin = "https://sc-market.space"
  const assets: Record<string, unknown> = {
    [CONTENT_ASSET_PATHS.guide(guide.meta.category, guide.meta.slug)]:
      guideAsset(translated, tGuide),
    [CONTENT_ASSET_PATHS.guide(guide.meta.category, guide.meta.slug, "de")]:
      guideAsset(translated, tGuide, de),
  }
  const SHELL = "<!doctype html><html><head></head><body></body></html>"
  const assetFetch = vi.fn(async (input: Request | URL | string) => {
    const url = new URL(input instanceof Request ? input.url : input.toString())
    if (url.pathname === SHELL_PATH)
      return new Response(SHELL, { headers: { "Content-Type": "text/html" } })
    const body = assets[url.pathname]
    return body
      ? new Response(JSON.stringify(body), {
          headers: { "Content-Type": "application/json" },
        })
      : new Response("Not found", { status: 404 })
  })
  const tEnv: BridgeEnv = {
    ASSETS: { fetch: assetFetch },
    VITE_FRONTEND_URL: origin,
  }

  async function translatedDoc(lng: string) {
    const match = matchBridgeRoute(path)!
    const outcome = await resolvePage(
      new URL(`${origin}${path}?lng=${lng}`),
      tEnv,
      runtime,
      () => {},
      { route: match.route, params: { ...match.params, lng } },
    )
    if (outcome.kind !== "page") throw new Error(outcome.kind)
    return outcome.doc
  }

  it("publishes only the up-to-date translation", () => {
    expect(tGuide.meta.translations.map((t) => t.locale)).toEqual(["de"])
  })

  it("renders the translation with its own canonical, lang and hreflang alternates", async () => {
    const d = await translatedDoc("de")
    expect(d.title).toBe("Anleitung auf Deutsch — SC Market Guides")
    expect(d.canonical).toBe(`${origin}${path}?lng=de`)
    expect(d.head.lang).toBe("de")
    expect(d.head.alternates).toEqual([
      { hreflang: "en", href: `${origin}${path}` },
      { hreflang: "de", href: `${origin}${path}?lng=de` },
      { hreflang: "x-default", href: `${origin}${path}` },
    ])
    const article = d.head.jsonLd[1] as { inLanguage: string }
    expect(article.inLanguage).toBe("de")
    expect(html(d)).toContain("Hallo Markt.")
    const markup = headMarkup(d.head, d.canonical, false)
    expect(markup).toContain(
      `<link rel="alternate" hreflang="de" href="${origin}${path}?lng=de">`,
    )
  })

  it("lists the alternates on the English page too", async () => {
    const match = matchBridgeRoute(path)!
    const outcome = await resolvePage(
      new URL(`${origin}${path}`),
      tEnv,
      runtime,
      () => {},
      match,
    )
    if (outcome.kind !== "page") throw new Error(outcome.kind)
    expect(outcome.doc.canonical).toBe(`${origin}${path}`)
    expect(outcome.doc.head.lang).toBe("en")
    expect(outcome.doc.head.alternates?.map((a) => a.hreflang)).toEqual([
      "en",
      "de",
      "x-default",
    ])
  })

  it("has no alternates for an English-only guide", async () => {
    const d = await doc(path)
    expect(d.head.alternates).toBeUndefined()
  })

  class RecordingRewriter implements HtmlRewriterLike {
    static selectors: string[] = []
    on(selector: string): HtmlRewriterLike {
      RecordingRewriter.selectors.push(selector)
      return this
    }
    transform(response: Response): Response {
      return new Response("TRANSLATED", response)
    }
  }

  async function request(search: string) {
    RecordingRewriter.selectors = []
    const next = vi.fn(async () => new Response("ENGLISH FILE"))
    const response = await handleBridgeRequest(
      {
        request: new Request(`${origin}${path}${search}`),
        env: tEnv,
        next,
        waitUntil: () => {},
      },
      { ...runtime, HTMLRewriter: RecordingRewriter },
    )
    return { response, next }
  }

  it("serves ?lng=<locale> of a translated guide as its own page, <html lang> included", async () => {
    for (const search of ["?lng=de", "?lng=de-AT"]) {
      const { response, next } = await request(search)
      expect(await response.text()).toBe("TRANSLATED")
      expect(response.headers.get("X-SCM-Bridge")).toBe("page")
      expect(next).not.toHaveBeenCalled()
      expect(RecordingRewriter.selectors).toContain("html")
    }
  })

  it.each([
    ["a missing translation", "?lng=ja"],
    ["a stale translation", "?lng=fr"],
    ["English", "?lng=en"],
    ["an unknown language", "?lng=pt"],
  ])("serves the English file for %s", async (_name, search) => {
    const { response, next } = await request(search)
    expect(next).toHaveBeenCalledOnce()
    expect(await response.text()).toBe("ENGLISH FILE")
  })
})
