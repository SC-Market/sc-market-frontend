import { describe, it, expect } from "vitest"
import { isAwaitingData } from "../queryLoading"

describe("isAwaitingData", () => {
  it("is true on the first load and when the args change (no data for them yet)", () => {
    expect(isAwaitingData({ isFetching: true, currentData: undefined })).toBe(true)
  })

  // Regression: pages used `isLoading || isFetching`, so every background
  // refetch (polling, focus, an invalidated tag) swapped the loaded content
  // for its skeleton, e.g. /contract/:id after its notifications were cleared.
  it("is false during a background refetch of the same args", () => {
    expect(isAwaitingData({ isFetching: true, currentData: { id: 1 } })).toBe(false)
  })

  it("is false once settled, with or without data", () => {
    expect(isAwaitingData({ isFetching: false, currentData: { id: 1 } })).toBe(false)
    expect(isAwaitingData({ isFetching: false, currentData: undefined })).toBe(false)
  })
})
