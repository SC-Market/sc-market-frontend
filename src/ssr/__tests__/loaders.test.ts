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
