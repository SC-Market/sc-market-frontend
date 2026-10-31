// @vitest-environment node
import { describe, it, expect, vi } from "vitest"
import {
  kindEnabled,
  onRequest,
  ssrDecision,
  ssrSwitchedOn,
  SSR_OFF_HEADER,
} from "../pagesFunction"

vi.mock("../serverBuild", () => {
  throw new Error("no server build in tests")
})

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
    expect(kindEnabled({} as never, "item")).toBe(false)
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
    expect(ssrDecision(req(`${PREVIEW}/wiki/items/x`), env).render).toBe(false)
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
    vi.unstubAllGlobals()
  })
})
