import { describe, it, expect } from "vitest"
import { renameLine, summaryValueLines } from "../GameDataImportJobRow"

const num = (n: number) => `#${n}`

describe("summaryValueLines", () => {
  it("formats numbers", () => {
    expect(summaryValueLines(173, num)).toEqual(["#173"])
  })

  it("shows an object as one line per entry, transitions with an arrow", () => {
    expect(
      summaryValueLines({ "key_derived->derived": 26, "cig->cig": 3 }, num),
    ).toEqual(["key_derived → derived: #26", "cig → cig: #3"])
  })

  it("shows empty objects and arrays as a dash", () => {
    expect(summaryValueLines({}, num)).toEqual(["—"])
    expect(summaryValueLines([], num)).toEqual(["—"])
  })

  it("joins arrays and flattens nested values", () => {
    expect(summaryValueLines(["a", 2], num)).toEqual(["a, #2"])
    expect(summaryValueLines({ x: { y: 1 }, z: [1, 2] }, num)).toEqual([
      "x: y: #1",
      "z: #1, #2",
    ])
  })

  it("never renders [object Object]", () => {
    expect(summaryValueLines({ a: { b: { c: 1 } } }, num).join()).not.toMatch(
      /object Object/,
    )
  })
})

describe("renameLine", () => {
  it("shows old and new name with the source transition", () => {
    expect(
      renameLine({
        id: "a",
        oldName: "Ksar Lmg Energy 01",
        newName: "Verdict LMG",
        match: "p4k_id",
        oldSource: "key_derived",
        newSource: "derived",
        p4kId: "p",
      }),
    ).toBe('"Ksar Lmg Energy 01" → "Verdict LMG" (key_derived → derived)')
  })

  it("shows the match type for rows matched by name", () => {
    expect(
      renameLine({
        id: "b",
        oldName: "Shiv (Knife)",
        newName: "Shiv",
        match: "normalized",
        newSource: "cig",
        p4kId: "p",
      }),
    ).toBe('"Shiv (Knife)" → "Shiv" (normalized, cig)')
  })
})
