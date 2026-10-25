import { describe, expect, it } from "vitest"
import { reflowLayout, type ReflowItem } from "../reflowLayout"

/** The seeded personal dashboard: a 3-wide sidebar column beside 9-wide tables. */
const seeded: ReflowItem[] = [
  { i: "metrics", x: 0, y: 0, w: 3, h: 4, minW: 2 },
  { i: "notifications", x: 0, y: 4, w: 3, h: 5, minW: 3 },
  { i: "offers", x: 3, y: 0, w: 9, h: 5, minW: 4 },
  { i: "orders", x: 3, y: 5, w: 9, h: 5, minW: 4 },
  { i: "buy-orders", x: 3, y: 10, w: 9, h: 4, minW: 4 },
]

function byId(items: ReflowItem[]) {
  return Object.fromEntries(items.map((item) => [item.i, item]))
}

/** Every row from 0 to the bottom has all `cols` columns covered. */
function rowsAreFull(items: ReflowItem[], cols: number) {
  const bottom = Math.max(...items.map((item) => item.y + item.h))
  for (let row = 0; row < bottom; row++) {
    let covered = 0
    for (const item of items) {
      if (row >= item.y && row < item.y + item.h) covered += item.w
    }
    if (covered !== cols) return false
  }
  return true
}

describe("reflowLayout", () => {
  it("returns the saved layout unchanged at 12 columns", () => {
    expect(reflowLayout(seeded, 12)).toBe(seeded)
  })

  it.each([6, 4, 2])("leaves no empty columns at %i columns", (cols) => {
    const result = reflowLayout(seeded, cols)
    expect(rowsAreFull(result, cols)).toBe(true)
    for (const item of result) {
      expect(item.x + item.w).toBeLessThanOrEqual(cols)
    }
  })

  it("stacks the seeded layout full width, in reading order, at 6 columns", () => {
    const result = byId(reflowLayout(seeded, 6))
    expect(result.metrics).toMatchObject({ x: 0, y: 0, w: 6 })
    expect(result.offers).toMatchObject({ x: 0, y: 4, w: 6 })
    expect(result.notifications).toMatchObject({ x: 0, y: 9, w: 6 })
    expect(result.orders).toMatchObject({ x: 0, y: 14, w: 6 })
    expect(result["buy-orders"]).toMatchObject({ x: 0, y: 19, w: 6 })
  })

  it("keeps two half-width widgets side by side", () => {
    const result = byId(
      reflowLayout(
        [
          { i: "a", x: 0, y: 0, w: 6, h: 4 },
          { i: "b", x: 6, y: 0, w: 6, h: 4 },
        ],
        6,
      ),
    )
    expect(result.a).toMatchObject({ x: 0, y: 0, w: 3 })
    expect(result.b).toMatchObject({ x: 3, y: 0, w: 3 })
  })

  it("never asks for a minimum width wider than the widget", () => {
    for (const item of reflowLayout(seeded, 2)) {
      expect(item.minW ?? 0).toBeLessThanOrEqual(item.w)
    }
  })
})
