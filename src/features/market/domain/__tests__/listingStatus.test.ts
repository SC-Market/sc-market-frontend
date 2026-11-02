import { describe, it, expect } from "vitest"
import type { TFunction } from "i18next"
import { listingStatusLabel } from "../listingStatus"

const t = ((_key: string, fallback: string) => fallback) as unknown as TFunction

describe("listingStatusLabel", () => {
  // Regression: an archived listing showed as "CANCELLED" (the API's word).
  it("calls an archived listing Archived", () => {
    expect(listingStatusLabel("cancelled", t)).toBe("Archived")
  })

  it("names the other statuses", () => {
    expect(listingStatusLabel("active", t)).toBe("Active")
    expect(listingStatusLabel("inactive", t)).toBe("Inactive")
    expect(listingStatusLabel("sold", t)).toBe("Sold")
    expect(listingStatusLabel("expired", t)).toBe("Paused")
  })
})
