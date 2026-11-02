import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(importOriginal),
)

import { SellerStatusBadge } from "../SellerStatusBadge"

const activity = {
  last_seen: "today" as const,
  reply_time: "within_hours" as const,
  reply_sample_size: 12,
  completed_orders: 34,
}

describe("SellerStatusBadge", () => {
  it("shows the coarse last seen, reply time and completed orders", () => {
    render(<SellerStatusBadge activity={activity} />)
    const text = screen.getByTestId("seller-activity").textContent
    expect(text).toContain("Active today")
    expect(text).toContain("Usually replies within a few hours")
    expect(text).toContain("34 completed orders")
  })

  it("compact: one short line for cards", () => {
    render(<SellerStatusBadge activity={activity} compact />)
    expect(screen.getByTestId("seller-activity-compact").textContent).toBe("Active today · Replies < 6h")
  })

  it("hidden status and too few chats: nothing to show", () => {
    const { container } = render(
      <SellerStatusBadge
        activity={{ last_seen: null, reply_time: null, reply_sample_size: null, completed_orders: 0 }}
      />,
    )
    expect(container.textContent).toBe("")
  })

  it("can leave out completed orders (the shop page shows sales already)", () => {
    render(<SellerStatusBadge activity={activity} showCompletedOrders={false} />)
    expect(screen.getByTestId("seller-activity").textContent).not.toContain("completed")
  })
})
