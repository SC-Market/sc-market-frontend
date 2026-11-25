import { describe, expect, it } from "vitest"
import { planReveal, type RevealRect } from "../useStaggeredReveal"

const TIMING = { step: 35, maxDelay: 350 }

/** A card of a grid with `cols` columns, 300px rows, at reading position i. */
function cell(i: number, cols: number, w = 200, h = 300): RevealRect {
  const row = Math.floor(i / cols)
  const col = i % cols
  return {
    top: row * h,
    left: col * w,
    bottom: row * h + h,
    right: col * w + w,
  }
}

describe("planReveal", () => {
  it("staggers cards in reading order (row by row, then across)", () => {
    const rects = Array.from({ length: 6 }, (_, i) => cell(i, 3))
    expect(planReveal(rects, TIMING)).toEqual([0, 35, 70, 105, 140, 175])
  })

  it("follows the rendered position, not the input order", () => {
    // Input order scrambled (e.g. data order vs layout order): the delays
    // still rise with the on-screen reading order.
    const order = [4, 0, 5, 2, 1, 3]
    const rects = order.map((i) => cell(i, 3))
    const delays = planReveal(rects, TIMING)
    expect(delays).toEqual(order.map((i) => i * 35))
  })

  it("treats sub-pixel top differences as one row", () => {
    const rects: RevealRect[] = [
      { top: 0.6, left: 200, bottom: 300, right: 400 },
      { top: 0, left: 0, bottom: 300, right: 200 },
    ]
    expect(planReveal(rects, TIMING)).toEqual([35, 0])
  })

  it("plans every card, including ones below the fold", () => {
    // 2 columns at 390x844: row 3 (top 900) is below the fold when planned
    // (e.g. mid-scroll after a page change) and still gets its place.
    const rects = Array.from({ length: 8 }, (_, i) => cell(i, 2, 195, 300))
    expect(planReveal(rects, TIMING)).toEqual([
      0, 35, 70, 105, 140, 175, 210, 245,
    ])
  })

  it("caps the delay however many cards are on screen", () => {
    const rects = Array.from({ length: 24 }, (_, i) => cell(i, 8, 100, 100))
    const delays = planReveal(rects, TIMING)
    expect(Math.max(...delays)).toBe(350)
    expect(delays[10]).toBe(350)
    expect(delays[9]).toBe(315)
  })

  it("reads right to left on rtl pages", () => {
    const rects = [cell(0, 3), cell(1, 3), cell(2, 3)]
    expect(planReveal(rects, TIMING, { rtl: true })).toEqual([70, 35, 0])
  })
})
