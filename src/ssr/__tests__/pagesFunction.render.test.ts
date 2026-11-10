// @vitest-environment node
/**
 * The SSR Function's cache and fail-open behaviour around a render, with
 * the server build and React Router's request handler replaced by a fake
 * whose answer each test controls.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  SSR_FAILURE_HEADER,
  SSR_OUTCOME_HEADER,
  SSR_PARTIAL_HEADER,
} from "../protocol"

const answer = vi.hoisted(() => ({
  next: (): Promise<Response> => Promise.reject(new Error("unset")),
  /** The options of the last createSsrLoadContext call (the render's input). */
  lastOptions: null as null | { requestContext: Record<string, unknown> },
}))

vi.mock("../buildVersion", () => ({ SSR_BUILD_VERSION: "test" }))
vi.mock("../serverBuild", () => ({
  serverBuild: {
    entry: {
      module: {
        createSsrLoadContext: (options: {
          requestContext: Record<string, unknown>
        }) => {
          answer.lastOptions = options
          return {}
        },
      },
    },
  },
  inlineStylesheetsByHref: {},
}))
vi.mock("react-router", () => ({
  createRequestHandler: () => () => answer.next(),
}))

const { onRequest, SSR_DEADLINE_MS, SSR_FALLBACK_HEADER } =
  await import("../pagesFunction")

const PREVIEW = "https://ssr-phase4.sc-market-frontend.pages.dev"
const SHELL =
  '<!doctype html><html><head></head><body><div id="root"></div></body></html>'

function page(headers: Record<string, string> = {}): Response {
  return new Response("<html><body>listing</body></html>", {
    status: 200,
    headers: { [SSR_OUTCOME_HEADER]: "page", ...headers },
  })
}

let puts: string[]
let pending: Promise<unknown>[]

function context(path: string) {
  return {
    request: new Request(`${PREVIEW}${path}`, {
      headers: { "User-Agent": "Googlebot/2.1" },
    }),
    env: {
      ASSETS: {
        fetch: async () =>
          new Response(SHELL, { headers: { "Content-Type": "text/html" } }),
      },
    },
    next: async () => new Response(SHELL),
    waitUntil: (p: Promise<unknown>) => {
      pending.push(p)
    },
  }
}

beforeEach(() => {
  puts = []
  pending = []
  vi.stubGlobal("caches", {
    default: {
      match: async () => undefined,
      put: async (key: string) => {
        puts.push(String(key))
      },
      delete: async () => true,
    },
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("onRequest around a render", () => {
  it("serves and caches a complete render", async () => {
    answer.next = async () => page()
    const response = await onRequest(context("/market/abc"))
    await Promise.all(pending)
    expect(response.headers.get("X-SCM-SSR")).toBe("miss")
    expect(response.headers.get("X-SCM-SSR-Partial")).toBeNull()
    expect(puts).toHaveLength(1)
  })

  it("serves a render with transiently failed data but never caches it", async () => {
    answer.next = async () =>
      page({ [SSR_PARTIAL_HEADER]: "getPriceHistory(429)" })
    const response = await onRequest(context("/market/abc"))
    await Promise.all(pending)
    expect(response.status).toBe(200)
    expect(response.headers.get("X-SCM-SSR")).toBe("miss")
    expect(response.headers.get("X-SCM-SSR-Partial")).toBe(
      "getPriceHistory(429)",
    )
    expect(puts).toHaveLength(0)
  })

  it("fails open to the bridge when the primary data failed, caching nothing", async () => {
    answer.next = async () =>
      new Response(null, {
        status: 503,
        headers: {
          [SSR_OUTCOME_HEADER]: "failed",
          [SSR_FAILURE_HEADER]: "primary 429",
        },
      })
    const response = await onRequest(context("/market/abc"))
    await Promise.all(pending)
    expect(response.headers.get("X-SCM-SSR")).toBeNull()
    expect(response.headers.get(SSR_FALLBACK_HEADER)).toBe(
      "failed: primary 429",
    )
    expect(puts).toHaveLength(0)
  })

  it("answers from the bridge past the deadline, and the late render still fills the cache", async () => {
    vi.useFakeTimers()
    let finish: (response: Response) => void = () => {}
    answer.next = () => new Promise<Response>((resolve) => (finish = resolve))
    const responding = onRequest(context("/market/slow"))
    await vi.advanceTimersByTimeAsync(SSR_DEADLINE_MS + 1)
    const response = await responding
    expect(response.headers.get(SSR_FALLBACK_HEADER)).toBe("deadline")
    expect(puts).toHaveLength(0)

    finish(page())
    await vi.runAllTimersAsync()
    await Promise.all(pending)
    expect(puts).toEqual([expect.stringContaining("/market/slow")])
  })
})

/** The page cache's keys (not the API JSON cache's). */
const pageKeys = () => puts.filter((key) => key.includes("ssr-cache"))

function visitor(
  url: string,
  headers: Record<string, string>,
  env: Record<string, string> = {},
) {
  return {
    ...context("/"),
    request: new Request(url, {
      headers: { "User-Agent": "Mozilla/5.0 Chrome/130", ...headers },
    }),
    env: { ...context("/").env, ...env },
  }
}

describe("variants", () => {
  it("renders and caches each visitor variant under its own key", async () => {
    answer.next = async () => page()
    const url = `${PREVIEW}/user/bob`
    const variants: Record<string, string>[] = [
      {},
      { Cookie: "theme=light" },
      { Cookie: "i18next=de" },
      { "Accept-Language": "fr-FR,fr;q=0.9" },
      { Cookie: "theme=light; i18next=ja" },
    ]
    for (const headers of variants) {
      await onRequest(visitor(url, headers))
    }
    await Promise.all(pending)
    expect(pageKeys().map((k) => k.slice(k.indexOf("/user/")))).toEqual([
      "/user/bob",
      "/user/bob~theme=light",
      "/user/bob~lng=de",
      "/user/bob~lng=fr",
      "/user/bob~theme=light~lng=ja",
    ])
  })

  it("gives crawlers the default page, whatever cookies they send", async () => {
    answer.next = async () => page()
    await onRequest(
      visitor(`${PREVIEW}/user/bob`, {
        "User-Agent": "Googlebot/2.1",
        Cookie: "theme=light; i18next=de",
        "Accept-Language": "de",
      }),
    )
    await Promise.all(pending)
    expect(pageKeys()).toEqual([expect.stringMatching(/\/user\/bob$/)])
    expect(answer.lastOptions?.requestContext).toMatchObject({
      lng: "en",
      theme: "system",
    })
  })

  it("renders only the variants SSR_VARIANTS lists", async () => {
    answer.next = async () => page()
    const response = await onRequest(
      visitor(
        `${PREVIEW}/user/bob`,
        { Cookie: "theme=light; i18next=de" },
        { SSR_VARIANTS: "locale" },
      ),
    )
    await Promise.all(pending)
    expect(response.headers.get("Vary")).toBe("Accept-Language, Cookie")
    expect(pageKeys()).toEqual([expect.stringMatching(/\/user\/bob~lng=de$/)])
  })
})

describe("white-label hosts", () => {
  const HOST = "https://medrunner.sc-market.space"
  const ENV = {
    SSR_ENABLED: "true",
    SSR_VARIANTS: "host",
    VITE_BACKEND_URL: "https://api.test",
  }
  const domain = (overrides: Record<string, unknown> = {}) => ({
    data: {
      spectrum_id: "MEDRUNNER",
      contractor_id: "c1",
      name: "Medrunner",
      focus_mode: "public",
      homepage_path: null,
      require_membership: false,
      ...overrides,
    },
  })
  const THEME = {
    data: {
      theme_data: { light: {}, dark: { palette: {} } },
      favicon_url: null,
      updated_at: "2026-11-01T00:00:00Z",
    },
  }

  function api(routes: Record<string, [number, unknown]>) {
    const calls: string[] = []
    vi.stubGlobal("fetch", async (input: string, init?: RequestInit) => {
      calls.push(String(input))
      // Anonymous GETs only: no cookies or credentials are ever forwarded.
      expect(init?.method).toBe("GET")
      expect(new Headers(init?.headers).get("Cookie")).toBeNull()
      const route = Object.keys(routes).find((path) =>
        String(input).endsWith(path),
      )
      const [status, body] = route ? routes[route] : [500, {}]
      return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      })
    })
    return calls
  }

  it("renders a public storefront host with its domain and theme, keyed by host", async () => {
    api({
      "/api/domain/medrunner.sc-market.space": [200, domain()],
      "/api/contractors/MEDRUNNER/theme": [200, THEME],
    })
    answer.next = async () => page()
    const response = await onRequest(
      visitor(
        `${HOST}/contractor/MEDRUNNER`,
        { Cookie: "scmarket.sid=secret; theme=light" },
        { ...ENV, SSR_VARIANTS: "host,theme" },
      ),
    )
    await Promise.all(pending)
    expect(response.headers.get("X-SCM-SSR")).toBe("miss")
    expect(answer.lastOptions?.requestContext.whiteLabel).toMatchObject({
      hostname: "medrunner.sc-market.space",
      domain: { spectrum_id: "MEDRUNNER", name: "Medrunner" },
      theme: THEME.data,
    })
    expect(pageKeys()).toEqual([
      expect.stringMatching(
        /\/contractor\/MEDRUNNER~host=medrunner\.sc-market\.space~theme=light$/,
      ),
    ])
  })

  it("renders with the site theme when the org has none", async () => {
    api({
      "/api/domain/medrunner.sc-market.space": [200, domain()],
      "/api/contractors/MEDRUNNER/theme": [404, {}],
    })
    answer.next = async () => page()
    await onRequest(visitor(`${HOST}/contractor/MEDRUNNER`, {}, ENV))
    expect(answer.lastOptions?.requestContext.whiteLabel).toMatchObject({
      theme: null,
    })
  })

  it.each([
    [
      "an unknown host",
      { "/api/domain/medrunner.sc-market.space": [404, {}] },
      "white-label: unknown host",
    ],
    [
      "a members-only host",
      {
        "/api/domain/medrunner.sc-market.space": [
          200,
          domain({ require_membership: true }),
        ],
      },
      "white-label: members only",
    ],
    [
      "an internal workspace",
      {
        "/api/domain/medrunner.sc-market.space": [
          200,
          domain({ focus_mode: "internal" }),
        ],
      },
      "white-label: members only",
    ],
    [
      "a failing domain lookup",
      { "/api/domain/medrunner.sc-market.space": [503, {}] },
      "white-label: domain 503",
    ],
  ] as const)(
    "leaves %s to the static shell",
    async (_name, routes, reason) => {
      api(routes as unknown as Record<string, [number, unknown]>)
      answer.lastOptions = null
      answer.next = async () => page()
      const response = await onRequest(
        visitor(`${HOST}/contractor/MEDRUNNER`, {}, ENV),
      )
      await Promise.all(pending)
      expect(response.headers.get("X-SCM-SSR")).toBeNull()
      expect(response.headers.get(SSR_FALLBACK_HEADER)).toBe(reason)
      expect(answer.lastOptions).toBeNull()
      expect(pageKeys()).toEqual([])
    },
  )

  it.each(["/user/someone", "/wiki/items/abc", "/market/aggregate/1-laser"])(
    "answers %s on the org's host with a 302 to sc-market.space, before any lookup",
    async (path) => {
      const calls = api({})
      answer.lastOptions = null
      const response = await onRequest(
        visitor(`${HOST}${path}?utm_source=x`, {}, ENV),
      )
      expect(response.status).toBe(302)
      expect(response.headers.get("Location")).toBe(
        `https://sc-market.space${path}?utm_source=x`,
      )
      expect(response.headers.get("X-SCM-SSR")).toBe("handoff")
      expect(calls).toEqual([])
      expect(answer.lastOptions).toBeNull()
    },
  )

  it("keeps guarded pages in the browser while the host variant is off", async () => {
    api({})
    const response = await onRequest(
      visitor(`${HOST}/user/someone`, {}, { ...ENV, SSR_VARIANTS: "theme" }),
    )
    expect(response.status).toBe(200)
    expect(response.headers.get(SSR_FALLBACK_HEADER)).toBe("white-label")
  })

  it("never hands off on the main site", async () => {
    answer.next = async () => page()
    const response = await onRequest(
      visitor(`https://sc-market.space/user/someone`, {}, ENV),
    )
    expect(response.status).toBe(200)
  })

  it("sends another org's page on this org's host to sc-market.space", async () => {
    api({
      "/api/domain/medrunner.sc-market.space": [200, domain()],
      "/api/contractors/MEDRUNNER/theme": [404, {}],
    })
    answer.lastOptions = null
    const response = await onRequest(
      visitor(`${HOST}/contractor/BWINCORP`, {}, ENV),
    )
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe(
      "https://sc-market.space/contractor/BWINCORP",
    )
    expect(answer.lastOptions).toBeNull()
  })

  it("answers a 302 when the page hands off (another seller's listing), caching nothing", async () => {
    api({
      "/api/domain/medrunner.sc-market.space": [200, domain()],
      "/api/contractors/MEDRUNNER/theme": [404, {}],
    })
    answer.next = async () =>
      new Response(null, {
        status: 302,
        headers: { [SSR_OUTCOME_HEADER]: "handoff" },
      })
    const response = await onRequest(visitor(`${HOST}/market/abc`, {}, ENV))
    await Promise.all(pending)
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toBe(
      "https://sc-market.space/market/abc",
    )
    // The render got its own hand-off report.
    expect(answer.lastOptions?.requestContext.handoff).toEqual({
      leaving: false,
    })
    expect(pageKeys()).toEqual([])
  })
})
