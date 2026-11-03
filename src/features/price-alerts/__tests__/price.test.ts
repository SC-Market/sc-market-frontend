import { describe, it, expect } from "vitest"
import { parseTargetPrice } from "../domain/price"

describe("parseTargetPrice", () => {
  it.each([
    ["25000", 25000],
    ["25,000", 25000],
    ["2", 2],
  ])("accepts %s", (input, expected) => {
    expect(parseTargetPrice(input)).toBe(expected)
  })

  it.each(["", "1", "0", "-5", "2.5", "abc", "2147483648"])(
    "rejects %s",
    (input) => {
      expect(parseTargetPrice(input)).toBeNull()
    },
  )
})
