import React from "react"
import { render, screen } from "@testing-library/react"
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
    action: "listing_paused_by_wipe",
    entity_type: "listing_wipes",
    timestamp: "2026-11-03T12:00:00Z",
    actors: [],
    entity,
  }) as never

describe("listing_paused_by_wipe notification", () => {
  it("says the listings were paused and links to the relist banner", () => {
    render(
      <NotificationEntry
        notif={notif({
          wipe_id: "w1",
          ran_at: "2026-11-03T12:00:00Z",
          relist_path: "/market/me",
        })}
      />,
    )
    expect(screen.getByTestId("notif").textContent).toBe(
      "Your listings were paused for the wipe. Relist them in one tap.",
    )
    expect(screen.getByTestId("notif").getAttribute("data-to")).toBe(
      "/market/me",
    )
  })

  it("without its entity still links to My Listings", () => {
    render(<NotificationEntry notif={notif(null)} />)
    expect(screen.getByTestId("notif").getAttribute("data-to")).toBe(
      "/market/me",
    )
  })
})
