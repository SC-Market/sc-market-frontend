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

const notif = (
  entity: unknown,
  actors: { username: string }[] = [{ username: "seller1" }],
) =>
  ({
    read: false,
    notification_id: "n1",
    action: "buy_order_filled",
    entity_type: "orders",
    timestamp: "2026-11-03T00:00:00Z",
    actors,
    entity,
  }) as never

// A seller filled one of your buy orders (backend buy_order.filled): the
// entity is the order it created, the actor the seller.
describe("buy_order_filled notification", () => {
  it("names the seller and links to the order", () => {
    render(
      <MemoryRouter>
        <NotificationEntry
          notif={notif({ order_id: "order-1", cost: 12000 })}
        />
      </MemoryRouter>,
    )
    const el = screen.getByTestId("notif")
    expect(el.textContent).toContain("Your buy order was filled by seller1")
    expect(el.getAttribute("data-to")).toContain("order-1")
  })

  it("renders without an actor", () => {
    render(
      <MemoryRouter>
        <NotificationEntry notif={notif({ order_id: "order-1" }, [])} />
      </MemoryRouter>,
    )
    expect(screen.getByTestId("notif").textContent).toContain(
      "Your buy order was filled by",
    )
  })
})
