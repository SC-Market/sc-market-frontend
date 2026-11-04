import { describe, it, expect } from "vitest"
import { uploadErrorDetail } from "../uploadError"

describe("uploadErrorDetail", () => {
  it.each([
    [{ data: { error: { message: "Too big" } } }, "Too big"],
    [
      { data: { error: { validationErrors: [{ message: "Bad type" }] } } },
      "Bad type",
    ],
    [{ data: { message: "Top level" } }, "Top level"],
    [
      { data: { validationErrors: [{ message: "Top validation" }] } },
      "Top validation",
    ],
    [{ data: {} }, undefined],
    [new Error("network"), undefined],
    [undefined, undefined],
  ])("%o -> %s", (err, expected) => {
    expect(uploadErrorDetail(err)).toBe(expected)
  })
})
