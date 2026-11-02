import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(importOriginal),
)

vi.mock("../components/NotificationBase", () => ({
  NotificationBase: ({ to, children }: { to?: string; children: React.ReactNode }) => (
    <div data-testid="notif" data-to={to}>
      {children}
    </div>
  ),
}))

import { NotificationEntry } from "../components/NotificationEntry"

const notif = (listings: { listing_id: string; title: string }[]) =>
  ({
    read: false,
    notification_id: "n1",
    action: "listing_expiring",
    entity_type: "listing_expiry_notices",
    timestamp: "2026-11-01T00:00:00Z",
    actors: [],
    entity: {
      batch_id: "b1",
      shop_slug: "lara",
      shop_name: "Lara's",
      renew_path: `/shop/lara/listings?renew=${listings.map((l) => l.listing_id).join(",")}`,
      listings: listings.map((l) => ({ ...l, expires_at: "2026-11-04T00:00:00Z", status: "active" })),
    },
  }) as never

describe("listing_expiring notification", () => {
  it("one listing: names it and links to the one-click renew", () => {
    render(<NotificationEntry notif={notif([{ listing_id: "l1", title: "Laranite" }])} />)
    expect(screen.getByTestId("notif").textContent).toContain('Still selling "Laranite"?')
    expect(screen.getByTestId("notif").getAttribute("data-to")).toBe("/shop/lara/listings?renew=l1")
  })
  it("several: counts them", () => {
    render(<NotificationEntry notif={notif([{ listing_id: "l1", title: "A" }, { listing_id: "l2", title: "B" }])} />)
    expect(screen.getByTestId("notif").textContent).toContain("2 listings in Lara's expire in 3 days")
  })
})
