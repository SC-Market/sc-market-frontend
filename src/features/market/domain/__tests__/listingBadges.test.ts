import { describe, expect, it } from "vitest"
import { isListingNew, LISTING_NEW_DAYS } from "../listingBadges"

const now = new Date("2026-11-03T12:00:00Z")
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000).toISOString()

describe("isListingNew", () => {
  it("uses a 3-day window", () => {
    expect(LISTING_NEW_DAYS).toBe(3)
  })

  it("is new from creation until just under 3 days", () => {
    expect(isListingNew(hoursAgo(0), now)).toBe(true)
    expect(isListingNew(hoursAgo(25), now)).toBe(true)
    expect(isListingNew(hoursAgo(72 - 0.001), now)).toBe(true)
  })

  it("is not new at exactly 3 days or later", () => {
    expect(isListingNew(hoursAgo(72), now)).toBe(false)
    expect(isListingNew(hoursAgo(24 * 30), now)).toBe(false)
  })

  it("counts a creation time slightly in the future (clock skew) as new", () => {
    expect(isListingNew(hoursAgo(-1), now)).toBe(true)
  })

  it("accepts a Date as well as an ISO string", () => {
    expect(isListingNew(new Date(hoursAgo(1)), now)).toBe(true)
  })

  it("is never new for an unparseable date", () => {
    expect(isListingNew("not a date", now)).toBe(false)
  })
})
