import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi } from "vitest"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)

vi.mock("../components/NotificationBase", () => ({
  NotificationBase: ({
    to,
    children,
  }: {
    to?: string
    children: React.ReactNode
  }) => (
    <div data-testid="notif" data-to={to}>
      {children}
    </div>
  ),
}))

import { NotificationEntry } from "../components/NotificationEntry"

const notif = (entity: unknown) =>
  ({
    read: false,
    notification_id: "n1",
    action: "buy_order_match",
    entity_type: "listings",
    timestamp: "2026-11-02T00:00:00Z",
    actors: [],
    entity,
  }) as never

// Bell entry for buy-order matches (owner decision 2026-11-02); the entity is
// the matching listing, as for a price alert.
describe("buy_order_match notification", () => {
  it("names the listing and links to its market page", () => {
    render(
      <MemoryRouter>
        <NotificationEntry
          notif={notif({
            listing_id: "abcdef12-0000-4000-8000-000000000001",
            title: "Pembroke Helmet",
            price: 5000,
          })}
        />
      </MemoryRouter>,
    )
    const el = screen.getByTestId("notif")
    expect(el.textContent).toContain(
      "Buy-order match: Pembroke Helmet matches one of your buy orders",
    )
    expect(el.getAttribute("data-to")).toMatch(/^\/market\/abcdef12/)
  })

  it("a listing no longer public (no entity) still renders", () => {
    render(
      <MemoryRouter>
        <NotificationEntry notif={notif(null)} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId("notif").textContent).toContain(
      "matches one of your buy orders",
    )
  })
})
