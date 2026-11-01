import { describe, it, expect } from "vitest"
import { isTransientQueryError, transientQueryFailures } from "../prerenderData"
import type { RootState } from "../../store/store"

describe("isTransientQueryError", () => {
  it("is true for rate limits, 5xx, timeouts and network errors", () => {
    for (const status of [408, 429, 500, 502, 503]) {
      expect(isTransientQueryError({ status })).toBe(true)
    }
    expect(isTransientQueryError({ status: "FETCH_ERROR" })).toBe(true)
    expect(isTransientQueryError({ status: "TIMEOUT_ERROR" })).toBe(true)
  })
  it("is false for real answers", () => {
    for (const status of [400, 401, 403, 404, 410]) {
      expect(isTransientQueryError({ status })).toBe(false)
    }
    expect(isTransientQueryError(undefined)).toBe(false)
  })
})

describe("transientQueryFailures", () => {
  it("lists rejected queries whose error is transient", () => {
    const state = {
      generatedApiV2: {
        queries: {
          a: { status: "fulfilled", endpointName: "getListingDetail" },
          b: {
            status: "rejected",
            endpointName: "getPriceHistory",
            error: { status: 429 },
          },
          c: {
            status: "rejected",
            endpointName: "getShopReviews",
            error: { status: 404 },
          },
          d: { status: "pending", endpointName: "searchListings" },
        },
      },
      serviceApi: {
        queries: {
          e: {
            status: "rejected",
            endpointName: "authSessionCheck",
            error: { status: "FETCH_ERROR" },
          },
        },
      },
    } as unknown as RootState
    expect(transientQueryFailures(state)).toEqual([
      "getPriceHistory(429)",
      "authSessionCheck(FETCH_ERROR)",
    ])
  })
})
