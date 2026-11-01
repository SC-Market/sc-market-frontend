import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, a?: string | ({ defaultValue?: string } & Record<string, unknown>), b?: Record<string, unknown>) => {
      const o = typeof a === "string" ? { defaultValue: a, ...(b ?? {}) } : (a ?? {})
      return String(o.defaultValue ?? _k).replace(/\{\{(\w+)\}\}/g, (_m, n) => String((o as Record<string, unknown>)[n] ?? ""))
    },
  }),
}))

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
