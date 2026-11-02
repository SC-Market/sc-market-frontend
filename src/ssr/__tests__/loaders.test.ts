// @vitest-environment node
import { describe, it, expect, vi } from "vitest"
import type { LoaderFunctionArgs } from "react-router"
import { listingLoader } from "../loaders"
import { makeStore } from "../../store/store"
import { createServerNetworkEnv } from "../../server/serverNetworkEnv"
import type { SsrRequest } from "../context"

/** One SSR request whose API answers every call with `status`. */
function ssrRequest(status: number) {
  const fetchFn = vi.fn(
    async () =>
      new Response(JSON.stringify({ error: "x" }), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  )
  const ssr = {
    store: makeStore({
      networkEnv: createServerNetworkEnv({ fetchFn, retry: false }),
    }),
    notFound: false,
  } as unknown as SsrRequest
  return { ssr, fetchFn }
}

function run(ssr: SsrRequest) {
  return listingLoader({
    params: { id: "abc12345--thing" },
    context: { ssr },
    request: new Request("https://sc-market.space/market/abc12345--thing"),
  } as unknown as LoaderFunctionArgs)
}

describe("listingLoader", () => {
  it("marks an unknown listing not found", async () => {
    const { ssr } = ssrRequest(404)
    await run(ssr)
    expect(ssr.notFound).toBe(true)
    expect(ssr.failed).toBeUndefined()
  })

  it.each([429, 503])(
    "fails the render on a %i (no error page cached), with one API call",
    async (status) => {
      const { ssr, fetchFn } = ssrRequest(status)
      await run(ssr)
      expect(ssr.notFound).toBe(false)
      expect(ssr.failed).toBe(`primary ${status}`)
      // No retries (the render's deadline) and no prefetch after a failure.
      expect(fetchFn).toHaveBeenCalledTimes(1)
    },
  )
})

describe("white-label frame data", () => {
  function request(whiteLabel: unknown) {
    const urls: string[] = []
    const fetchFn = vi.fn(async (input: RequestInfo | URL) => {
      urls.push(input instanceof Request ? input.url : String(input))
      return new Response(JSON.stringify({ data: {} }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    })
    const ssr = {
      store: makeStore({
        networkEnv: createServerNetworkEnv({ fetchFn, retry: false }),
      }),
      notFound: false,
      requestContext: { whiteLabel },
    } as unknown as SsrRequest
    return { ssr, urls }
  }

  it("loads the org and its sidebar settings on its white-label host", async () => {
    const { ssr, urls } = request({
      hostname: "medrunner.sc-market.space",
      domain: { spectrum_id: "MEDRUNNER" },
      theme: null,
    })
    await run(ssr)
    expect(
      urls.some((u) => u.includes("/contractors/MEDRUNNER/whitelabel/sidebar")),
    ).toBe(true)
    expect(urls.some((u) => /\/contractors\/MEDRUNNER(\?|$)/.test(u))).toBe(
      true,
    )
  })

  it("loads neither on the main site", async () => {
    const { ssr, urls } = request(null)
    await run(ssr)
    expect(urls.some((u) => u.includes("whitelabel"))).toBe(false)
  })
})
