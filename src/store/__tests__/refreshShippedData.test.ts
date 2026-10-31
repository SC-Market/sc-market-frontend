import { describe, it, expect } from "vitest"
import { liveShippedQueries } from "../refreshShippedData"

describe("liveShippedQueries", () => {
  it("picks fulfilled live queries and leaves game data alone", () => {
    const shipped = {
      generatedApiV2: {
        queries: {
          'getListingDetail({"id":"a"})': {
            status: "fulfilled",
            endpointName: "getListingDetail",
            originalArgs: { id: "a" },
            data: { listing: 1 },
          },
          "getShips(undefined)": {
            status: "fulfilled",
            endpointName: "getShips",
            originalArgs: undefined,
          },
          'getShop({"slug":"x"})': {
            status: "rejected",
            endpointName: "getShop",
            originalArgs: { slug: "x" },
          },
        },
      },
    }
    expect(liveShippedQueries(shipped)).toEqual([
      {
        reducerPath: "generatedApiV2",
        endpointName: "getListingDetail",
        originalArgs: { id: "a" },
        data: { listing: 1 },
      },
    ])
  })
})
