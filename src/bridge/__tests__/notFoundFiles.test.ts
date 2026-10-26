/**
 * Missing /content/** (and /assets/**) files must 404 on Cloudflare Pages, not
 * come back as the SPA's index.html with a 200.
 *
 * Pages' _redirects has no 404 status: "/content/*  /content/:splat  404" was
 * silently ignored and /content/bridge/nope.json returned index.html. What
 * works is a 404.html inside the directory (Pages serves the nearest one with
 * a 404 status). These checks pin that setup down.
 */
import { describe, it, expect } from "vitest"
import routesJson from "../../../public/_routes.json"
import redirects from "../../../public/_redirects?raw"
import { CONTENT_ASSET_PATHS } from "../../features/help/domain/assetPaths"

const notFoundPages = import.meta.glob<string>("../../../public/*/404.html", {
  query: "?raw",
  import: "default",
  eager: true,
})

describe("404s for missing static files", () => {
  it.each(["assets", "content"])("public/%s/404.html exists", (dir) => {
    const page = notFoundPages[`../../../public/${dir}/404.html`]
    expect(page, dir).toBeDefined()
    expect(page).toMatch(/<title>404/)
  })

  it("covers every content file the bridge and sitemap read", () => {
    const paths = [
      CONTENT_ASSET_PATHS.manifest,
      CONTENT_ASSET_PATHS.index,
      CONTENT_ASSET_PATHS.about,
      CONTENT_ASSET_PATHS.category("selling"),
      CONTENT_ASSET_PATHS.guide("selling", "fill-a-buy-order"),
    ]
    for (const p of paths) expect(p.startsWith("/content/"), p).toBe(true)
  })

  it("_redirects has no 404 rules (Pages ignores them) and no rule for /content", () => {
    const rules = redirects
      .split("\n")
      .filter((line: string) => line.trim() && !line.trim().startsWith("#"))
    expect(rules.filter((r: string) => /\s404\s*$/.test(r))).toEqual([])
    expect(rules.filter((r: string) => r.trim().startsWith("/content"))).toEqual([])
  })

  it("no Function runs for /content (it would bypass the static 404)", () => {
    const covers = (rule: string, p: string) =>
      rule.endsWith("*") ? p.startsWith(rule.slice(0, -1)) : rule === p
    expect(routesJson.include.some((r) => covers(r, "/content/bridge/index.json"))).toBe(false)
  })
})
