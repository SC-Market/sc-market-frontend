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
}))

vi.mock("../buildVersion", () => ({ SSR_BUILD_VERSION: "test" }))
vi.mock("../serverBuild", () => ({
  serverBuild: { entry: { module: { createSsrLoadContext: () => ({}) } } },
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
