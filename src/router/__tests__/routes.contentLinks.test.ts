/**
 * Every site link in the Help & Guides content (/content/**) must resolve to
 * a real page: matched by src/App.tsx's route table (not the `/*` 404 splat,
 * not an admin route), and for /guides/... links, an existing guide. Also
 * compiles the real content, so a broken guide fails here as well as in the
 * build.
 */
import { describe, expect, it } from "vitest"
import { matchRoutes } from "react-router-dom"
import { routes } from "../../App"
import { compileSite, type SourceFile } from "../../features/help/build/compile"
import { HELP_PATHS } from "../../routes/paths"

const raw = import.meta.glob<string>("/content/**/*.{md,json}", {
  query: "?raw",
  import: "default",
  eager: true,
})
const files: SourceFile[] = Object.entries(raw).map(([path, source]) => ({
  path: path.replace(/^\/content\//, ""),
  source,
}))

const site = compileSite(files, {
  today: new Date().toISOString().slice(0, 10),
  // Images resolve to a stand-in; their existence is checked by the build.
  imageResolver: () => (src) => src,
})

const pages = [
  ...site.guides.map((g) => ({ file: g.file, links: g.body.links })),
  { file: site.about.file, links: site.about.body.links },
]
const guidePaths = new Set(site.guides.map((g) => HELP_PATHS.guide(g.meta.category, g.meta.slug)))
const categoryPaths = new Set(site.categories.map((c) => HELP_PATHS.category(c.id)))

/**
 * Legacy paths that only redirect somewhere else (often based on a cookie).
 * Guides must link the real destination instead.
 */
const REDIRECT_ONLY = new Set([
  "/market/create",
  "/market/create/:tab",
  "/market/manage",
  "/market/manage-stock",
  "/market/stock/:listingId",
  "/orders/assigned",
  "/order/services",
  "/services",
  "/help",
  "/org/:contractor_id/listings",
])

const cases = pages.flatMap(({ file, links }) => links.map((href) => [file, href] as const))

describe("Help & Guides content", () => {
  it("compiles, with at least one guide per category and an About page", () => {
    expect(site.guides.length).toBeGreaterThan(0)
    for (const category of site.categories) {
      expect(site.guides.some((g) => g.meta.category === category.id), category.id).toBe(true)
    }
    expect(site.about.body.blocks.length).toBeGreaterThan(0)
  })

  it("has site links to check", () => {
    expect(cases.length).toBeGreaterThan(0)
  })

  it.each(cases)("%s → %s resolves to a real page", (_file, href) => {
    const pathname = href.split(/[?#]/)[0]
    const matches = matchRoutes(routes, pathname) ?? []
    const leaf = matches.at(-1)?.route
    expect(leaf, "no route matched").toBeDefined()
    expect(leaf?.path, "only the /* 404 splat matched").not.toBe("/*")
    const pattern = matches.map((m) => m.route.path ?? "").filter(Boolean).join("/").replace(/\/+/g, "/")
    expect(REDIRECT_ONLY.has(pattern) || REDIRECT_ONLY.has(leaf?.path ?? ""), `${pattern} only redirects`).toBe(false)
    expect(pathname.startsWith("/admin"), "links into the admin area").toBe(false)
    if (pathname.startsWith(`${HELP_PATHS.hub}/`)) {
      expect(guidePaths.has(pathname) || categoryPaths.has(pathname), "unknown guide or category").toBe(true)
    }
  })
})
