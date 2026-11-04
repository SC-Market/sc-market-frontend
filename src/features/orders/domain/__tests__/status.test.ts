import { describe, it, expect } from "vitest"
import { isOrderOpen, ORDER_CLOSED_STATUSES } from "../status"

describe("isOrderOpen", () => {
  it.each([
    ["not-started", true],
    ["in-progress", true],
    ["fulfilled", false],
    ["cancelled", false],
  ])("%s → %s", (status, open) => {
    expect(isOrderOpen(status)).toBe(open)
  })

  it("closed statuses are cancelled and fulfilled", () => {
    expect([...ORDER_CLOSED_STATUSES].sort()).toEqual([
      "cancelled",
      "fulfilled",
    ])
  })
})
