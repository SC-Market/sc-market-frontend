import { describe, expect, it } from "vitest"
import { sellerActivityText } from "../sellerActivityText"

describe("sellerActivityText", () => {
  it("all facts, coarse", () => {
    expect(
      sellerActivityText({
        last_seen: "today",
        reply_time: "within_hours",
        reply_sample_size: 12,
        completed_orders: 1234,
      }),
    ).toBe(
      "Seller activity: active today; usually replies within a few hours (12 order and offer chats, last 90 days); 1,234 completed orders.",
    )
  })
  it("hidden last seen and too few chats: only what is known", () => {
    expect(
      sellerActivityText({
        last_seen: null,
        reply_time: null,
        reply_sample_size: null,
        completed_orders: 1,
      }),
    ).toBe("Seller activity: 1 completed order.")
  })
  it("nothing to say", () => {
    expect(
      sellerActivityText({
        last_seen: null,
        reply_time: null,
        reply_sample_size: null,
        completed_orders: 0,
      }),
    ).toBeNull()
    expect(sellerActivityText(undefined)).toBeNull()
  })
})
