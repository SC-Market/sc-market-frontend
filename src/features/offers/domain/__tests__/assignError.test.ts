import { describe, it, expect } from "vitest"
import { assignErrorReason } from "../assignError"

describe("assignErrorReason", () => {
  it.each([
    [{ status: 400, data: { error: "Not a member" } }, "Not a member"],
    [
      { status: 400, data: { message: "Already assigned" } },
      "Already assigned",
    ],
    [{ message: "Network down" }, "Network down"],
    [undefined, ""],
  ])("%o -> %s", (error, expected) => {
    expect(assignErrorReason(error)).toBe(expected)
  })
})
