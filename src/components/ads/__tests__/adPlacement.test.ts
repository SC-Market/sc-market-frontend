import { describe, expect, it } from "vitest"
import {
  AD_FIRST_POSITION,
  AD_FREQUENCY,
  AD_MIN_GAP,
  AD_MIN_LEAD,
  AD_MIN_LISTINGS,
  adListingOffsets,
  adPositions,
  adSlotCount,
  seededRandom,
} from "../adPlacement"

const SIZES = [10, 12, 24, 32, 33, 48, 57, 60, 96, 120, 200]
const SEEDS = Array.from({ length: 300 }, (_, i) => i * 7919 + 1)

describe("ad placement", () => {
  it("gives a page the same number of slots as the fixed layout did", () => {
    for (const count of [0, 5, 9, ...SIZES]) {
      // The fixed layout: AD_FIRST_POSITION, then every AD_FREQUENCY + 1.
      let fixed = 0
      if (count >= AD_MIN_LISTINGS) {
        for (
          let i = AD_FIRST_POSITION;
          i < count + fixed;
          i += AD_FREQUENCY + 1
        )
          fixed++
      }
      expect(adSlotCount(count), `${count} listings`).toBe(fixed)
      expect(adPositions(count, 1)).toHaveLength(fixed)
    }
  })

  it("keeps every ad in range: never first, never last", () => {
    for (const count of SIZES) {
      for (const seed of SEEDS) {
        const offsets = adListingOffsets(count, seed)
        expect(offsets[0]).toBeGreaterThanOrEqual(AD_MIN_LEAD)
        expect(offsets[offsets.length - 1]).toBeLessThanOrEqual(count - 1)
        const positions = adPositions(count, seed)
        const total = count + positions.length
        expect(positions[0]).toBeGreaterThan(0)
        expect(positions[positions.length - 1]).toBeLessThan(total - 1)
      }
    }
  })

  it("keeps at least AD_MIN_GAP listings between two ads, so none are neighbours", () => {
    for (const count of SIZES) {
      for (const seed of SEEDS) {
        const offsets = adListingOffsets(count, seed)
        const positions = adPositions(count, seed)
        for (let k = 1; k < offsets.length; k++) {
          expect(offsets[k] - offsets[k - 1]).toBeGreaterThanOrEqual(AD_MIN_GAP)
          expect(positions[k] - positions[k - 1]).toBeGreaterThan(1)
        }
      }
    }
  })

  it("is deterministic for a given seed and page size", () => {
    for (const count of SIZES) {
      for (const seed of SEEDS.slice(0, 20)) {
        expect(adPositions(count, seed)).toEqual(adPositions(count, seed))
      }
    }
    const a = seededRandom(42)
    const b = seededRandom(42)
    for (let i = 0; i < 10; i++) expect(a()).toBe(b())
  })

  it("moves the ads with the seed", () => {
    for (const count of [12, 48, 120]) {
      const layouts = new Set(
        SEEDS.map((seed) => adPositions(count, seed).join(",")),
      )
      expect(layouts.size, `${count} listings`).toBeGreaterThan(5)
      // The first ad lands on many different spots, not just a couple.
      const firsts = new Set(SEEDS.map((seed) => adPositions(count, seed)[0]))
      expect(firsts.size).toBeGreaterThan(5)
    }
    expect(adPositions(48, 1)).not.toEqual(adPositions(48, 2))
  })

  it("draws seededRandom values in [0, 1)", () => {
    const random = seededRandom(7)
    for (let i = 0; i < 1000; i++) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})
