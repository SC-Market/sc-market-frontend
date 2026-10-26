/**
 * Shop webhooks offered events that never sent. Order Comment doesn't exist
 * any more (nothing creates order comments), so it's gone; Order Assigned and
 * Order Review now send. The site-wide public order feed was retired along
 * with public orders.
 */
import { describe, it, expect } from "vitest"
import { WEBHOOK_ACTIONS } from "../webhookEvents"

describe("shop webhook events", () => {
  it("lists only events the API sends", () => {
    expect(WEBHOOK_ACTIONS.map((a) => a.action_name)).toEqual([
      "order_create",
      "order_assigned",
      "order_status_change",
      "order_review",
      "market_item_bid",
    ])
  })
})
