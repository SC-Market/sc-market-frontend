import { describe, it, expect } from "vitest"
import { lotUpdatesForQuantityChange } from "../lotQuantityUpdates"

// Newest first, as GET /stock-lots returns them
const lots = [
  { lot_id: "newest", quantity_total: 5 },
  { lot_id: "middle", quantity_total: 0 },
  { lot_id: "oldest", quantity_total: 3 },
]

describe("lotUpdatesForQuantityChange", () => {
  it("sends nothing for no change", () => {
    expect(lotUpdatesForQuantityChange(lots, 0)).toEqual([])
  })

  // Regression: raising the total from 8 to 10 wrote 10 into one lot.
  it("adds an increase to the newest lot only", () => {
    expect(lotUpdatesForQuantityChange(lots, 2)).toEqual([{ lot_id: "newest", quantity_total: 7 }])
  })

  it("takes a decrease from the newest lot when it holds enough", () => {
    expect(lotUpdatesForQuantityChange(lots, -4)).toEqual([{ lot_id: "newest", quantity_total: 1 }])
  })

  it("takes a larger decrease from the lots in order, skipping empty ones", () => {
    expect(lotUpdatesForQuantityChange(lots, -7)).toEqual([
      { lot_id: "newest", quantity_total: 0 },
      { lot_id: "oldest", quantity_total: 1 },
    ])
  })

  it("can empty every lot", () => {
    expect(lotUpdatesForQuantityChange(lots, -8)).toEqual([
      { lot_id: "newest", quantity_total: 0 },
      { lot_id: "oldest", quantity_total: 0 },
    ])
  })

  it("refuses a decrease larger than the lots hold", () => {
    expect(lotUpdatesForQuantityChange(lots, -9)).toBeNull()
  })

  it("refuses an increase with no lot to put it in", () => {
    expect(lotUpdatesForQuantityChange([], 1)).toBeNull()
  })
})
