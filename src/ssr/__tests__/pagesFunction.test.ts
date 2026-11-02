// @vitest-environment node
import { describe, it, expect, vi } from "vitest"
import {
  cacheKey,
  cacheUse,
  isCrawler,
  isWhiteLabelCandidate,
  kindEnabled,
  onRequest,
  redirectResponse,
  ssrDecision,
  ssrSwitchedOn,
  SSR_DEADLINE,
  SSR_FALLBACK_HEADER,
  SSR_OFF_HEADER,
  ssrVariants,
  withDeadline,
} from "../pagesFunction"

vi.mock("../serverBuild", () => {
  throw new Error("no server build in tests")
})
vi.mock("../buildVersion", () => ({ SSR_BUILD_VERSION: "test" }))

const PREVIEW = "https://ssr-phase4.sc-market-frontend.pages.dev"
const PROD = "https://sc-market.space"

const req = (url: string, init?: RequestInit) => new Request(url, init)

describe("ssrSwitchedOn (kill switch)", () => {
  it("is off in production unless SSR_ENABLED is true", () => {
    expect(ssrSwitchedOn({} as never, "sc-market.space")).toBe(false)
    expect(
      ssrSwitchedOn({ SSR_ENABLED: "true" } as never, "sc-market.space"),
    ).toBe(true)
  })
  it("is on for previews and localhost unless SSR_ENABLED is false", () => {
    expect(
      ssrSwitchedOn({} as never, "ssr-phase4.sc-market-frontend.pages.dev"),
    ).toBe(true)
    expect(ssrSwitchedOn({} as never, "localhost")).toBe(true)
    expect(
      ssrSwitchedOn(
        { SSR_ENABLED: "false" } as never,
        "ssr-phase4.sc-market-frontend.pages.dev",
      ),
    ).toBe(false)
  })
})

describe("kindEnabled (per-prefix rollback)", () => {
  it("allows every SSR kind by default and only the listed ones otherwise", () => {
    expect(kindEnabled({} as never, "listing")).toBe(true)
    expect(kindEnabled({ SSR_KINDS: "shop, user" } as never, "listing")).toBe(
      false,
    )
    expect(kindEnabled({ SSR_KINDS: "shop, user" } as never, "user")).toBe(true)
    expect(kindEnabled({} as never, "manufacturer")).toBe(false)
  })
})

describe("ssrDecision", () => {
  const env = {} as never
  it("renders the entity pages", () => {
    for (const path of [
      "/market/abc",
      "/shops/foo",
      "/shops/foo/reviews",
      "/contractor/ORG",
      "/user/bob/reviews",
    ]) {
      expect(ssrDecision(req(`${PREVIEW}${path}`), env)).toMatchObject({
        render: true,
      })
    }
  })
  it("leaves hubs, other pages, filtered URLs and white-label hosts to the bridge", () => {
    expect(ssrDecision(req(`${PREVIEW}/market`), env).render).toBe(false)
    expect(
      ssrDecision(req(`${PREVIEW}/wiki/manufacturers/x`), env).render,
    ).toBe(false)
    expect(ssrDecision(req(`${PREVIEW}/shops/foo?q=x`), env).render).toBe(false)
    expect(
      ssrDecision(req(`${PREVIEW}/shops/foo?utm_source=x`), env).render,
    ).toBe(true)
    expect(
      ssrDecision(req("https://org.example/shops/foo"), {
        SSR_ENABLED: "true",
      } as never).render,
    ).toBe(false)
    expect(
      ssrDecision(req(`${PREVIEW}/shops/foo`, { method: "POST" }), env).render,
    ).toBe(false)
  })
  it("leaves trailing-slash spellings to the bridge (it 301s them)", () => {
    expect(ssrDecision(req(`${PREVIEW}/market/abc/`), env)).toEqual({
      render: false,
      reason: "trailing slash",
    })
  })
  it("is off with the kill-switch header", () => {
    expect(
      ssrDecision(
        req(`${PREVIEW}/shops/foo`, { headers: { [SSR_OFF_HEADER]: "1" } }),
        env,
      ).render,
    ).toBe(false)
  })
  it("is off in production by default", () => {
    expect(ssrDecision(req(`${PROD}/shops/foo`), env).render).toBe(false)
  })
})

describe("redirectResponse", () => {
  it("301s to the canonical URL, keeping the query", () => {
    const response = redirectResponse(
      new URL(`${PREVIEW}/market/abc-short-title`),
      new URL(`${PREVIEW}/market/0f1e2d3c?utm_source=x`),
    )
    expect(response.status).toBe(301)
    expect(response.headers.get("Location")).toBe(
      `${PREVIEW}/market/abc-short-title?utm_source=x`,
    )
    expect(response.headers.get("X-SCM-SSR")).toBe("redirect")
  })
})

describe("cacheUse", () => {
  it("serves fresh pages, revalidates stale ones, renders old ones", () => {
    expect(cacheUse(10, false)).toBe("hit")
    expect(cacheUse(300, false)).toBe("stale")
    expect(cacheUse(3600, false)).toBe("expired")
    expect(cacheUse(Number.NaN, false)).toBe("expired")
  })
  it("lets crawlers take day-old pages without a re-render", () => {
    expect(cacheUse(300, true)).toBe("stale")
    expect(cacheUse(3600, true)).toBe("hit")
    expect(cacheUse(2 * 86400, true)).toBe("expired")
  })
  it("recognises crawlers", () => {
    expect(
      isCrawler(
        "Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)",
      ),
    ).toBe(true)
    expect(isCrawler("Mozilla/5.0 (compatible; bingbot/2.0)")).toBe(true)
    expect(isCrawler("Mozilla/5.0 (compatible; Discordbot/2.0)")).toBe(true)
    expect(
      isCrawler(
        "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/130 Safari/537.36",
      ),
    ).toBe(false)
    expect(isCrawler(null)).toBe(false)
  })
})

describe("onRequest", () => {
  it("fails open to the bridge when the render can't run", async () => {
    vi.stubGlobal("caches", {
      default: { match: async () => undefined, put: async () => {} },
    })
    const shell =
      '<!doctype html><html><head><title>SC Market</title></head><body><div id="root"></div></body></html>'
    const next = vi.fn(
      async () =>
        new Response(shell, { headers: { "Content-Type": "text/html" } }),
    )
    const response = await onRequest({
      request: req(`${PREVIEW}/shops/foo`),
      env: {
        ASSETS: {
          fetch: async () =>
            new Response(shell, { headers: { "Content-Type": "text/html" } }),
        },
      },
      next,
      waitUntil: () => {},
      passThroughOnException: () => {},
    })
    // The bridge answered (it needs VITE_BACKEND_URL for its summary, so it
    // serves the plain shell): never an error page.
    expect(response.status).toBe(200)
    expect(response.headers.get("X-SCM-SSR")).toBeNull()
    // ... and says why SSR didn't serve.
    expect(response.headers.get(SSR_FALLBACK_HEADER)).toBe("error")
    vi.unstubAllGlobals()
  })

  it("marks the kill switch's bridge answers, not paths it never renders", async () => {
    const shell = "<!doctype html><html><head></head><body></body></html>"
    const env = {
      ASSETS: {
        fetch: async () =>
          new Response(shell, { headers: { "Content-Type": "text/html" } }),
      },
    }
    const context = (url: string, init?: RequestInit) => ({
      request: req(url, init),
      env,
      next: async () => new Response(shell),
      waitUntil: () => {},
    })
    const off = await onRequest(
      context(`${PREVIEW}/market/abc`, { headers: { [SSR_OFF_HEADER]: "1" } }),
    )
    expect(off.headers.get(SSR_FALLBACK_HEADER)).toBe("off (header)")
    const aggregate = await onRequest(context(`${PREVIEW}/market/aggregate/x`))
    expect(aggregate.headers.get(SSR_FALLBACK_HEADER)).toBeNull()
  })
})

describe("withDeadline", () => {
  it("resolves to the value in time, SSR_DEADLINE after it", async () => {
    await expect(withDeadline(Promise.resolve(1), 50)).resolves.toBe(1)
    await expect(withDeadline(new Promise(() => {}), 5)).resolves.toBe(
      SSR_DEADLINE,
    )
  })
})

describe("ssrVariants (SSR_VARIANTS)", () => {
  it("is every variant on previews and localhost, none in production, when unset", () => {
    expect([
      ...ssrVariants({} as never, "ssr-phase4.sc-market-frontend.pages.dev"),
    ]).toEqual(["theme", "locale", "host"])
    expect([...ssrVariants({} as never, "localhost")]).toHaveLength(3)
    expect([...ssrVariants({} as never, "sc-market.space")]).toEqual([])
    expect([...ssrVariants({} as never, "medrunner.sc-market.space")]).toEqual(
      [],
    )
  })
  it("is exactly the listed variants when set", () => {
    const env = (SSR_VARIANTS: string) => ({ SSR_VARIANTS }) as never
    expect([...ssrVariants(env("theme"), "sc-market.space")]).toEqual(["theme"])
    expect([
      ...ssrVariants(env(" Locale , theme,bogus"), "sc-market.space"),
    ]).toEqual(["theme", "locale"])
    expect([
      ...ssrVariants(env("none"), "ssr-phase4.sc-market-frontend.pages.dev"),
    ]).toEqual([])
  })
})

describe("white-label hosts", () => {
  it("only looks up plausible hostnames", () => {
    expect(isWhiteLabelCandidate("medrunner.sc-market.space")).toBe(true)
    expect(isWhiteLabelCandidate("shop.example.co.uk")).toBe(true)
    expect(isWhiteLabelCandidate("sc-market.space")).toBe(false)
    expect(isWhiteLabelCandidate("www.sc-market.space")).toBe(false)
    expect(isWhiteLabelCandidate("localhost")).toBe(false)
    expect(isWhiteLabelCandidate("127.0.0.1")).toBe(false)
    expect(isWhiteLabelCandidate("intranet")).toBe(false)
    expect(isWhiteLabelCandidate("a_b.example.com")).toBe(false)
  })
  it("renders a white-label host's entity pages only with the host variant on", () => {
    const on = { SSR_ENABLED: "true", SSR_VARIANTS: "host" } as never
    const off = { SSR_ENABLED: "true", SSR_VARIANTS: "theme,locale" } as never
    const url = "https://medrunner.sc-market.space/contractor/MEDRUNNER"
    expect(ssrDecision(req(url), on)).toEqual({ render: true, kind: "org" })
    expect(ssrDecision(req(url), off)).toEqual({
      render: false,
      reason: "white-label",
    })
    // Hubs and other pages stay the bridge's (static) on every host.
    expect(
      ssrDecision(req("https://medrunner.sc-market.space/market"), on).render,
    ).toBe(false)
    // The main site is unaffected by the host variant.
    expect(ssrDecision(req(`${PROD}/contractor/MEDRUNNER`), off).render).toBe(
      true,
    )
  })
})

describe("cacheKey", () => {
  it("keeps the path's case: each spelling is its own render", () => {
    const a = cacheKey(new URL(`${PROD}/user/Bob`), "", "")
    const b = cacheKey(new URL(`${PROD}/user/bob`), "", "")
    expect(a).not.toBe(b)
    expect(a).toContain("/user/Bob")
  })
  it("separates variants and game versions", () => {
    const url = new URL(`${PROD}/wiki/items/x`)
    const keys = new Set([
      cacheKey(url, "", ""),
      cacheKey(url, "~theme=light", ""),
      cacheKey(url, "~lng=de", ""),
      cacheKey(url, "~host=a.sc-market.space", ""),
      cacheKey(url, "", "@v1:t"),
    ])
    expect(keys.size).toBe(5)
  })
})
