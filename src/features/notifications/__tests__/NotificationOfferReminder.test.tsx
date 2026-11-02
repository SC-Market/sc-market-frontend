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

const notif = (
  action: string,
  stage: "first" | "final" | "buyer",
  offers: { session_id: string; title: string; open?: boolean }[],
) =>
  ({
    read: false,
    notification_id: "n1",
    action,
    entity_type: "offer_reminders",
    timestamp: "2026-11-03T00:00:00Z",
    actors: [],
    entity: {
      batch_id: "b1",
      stage,
      offers: offers.map((o) => ({
        offer_at: "2026-11-02T00:00:00Z",
        open: true,
        ...o,
      })),
    },
  }) as never

describe("pending-offer reminder notifications", () => {
  it("seller, one offer: names it and opens the offer", () => {
    render(
      <NotificationEntry
        notif={notif("offer_pending_reminder", "first", [
          { session_id: "s1", title: "Laranite" },
        ])}
      />,
    )
    expect(screen.getByTestId("notif").textContent).toBe(
      'An offer is waiting for your reply: "Laranite"',
    )
    expect(screen.getByTestId("notif").getAttribute("data-to")).toBe(
      "/offer/s1",
    )
  })

  it("seller, final, several: counts them and opens the first one still open", () => {
    render(
      <NotificationEntry
        notif={notif("offer_pending_final_reminder", "final", [
          { session_id: "s1", title: "A", open: false },
          { session_id: "s2", title: "B" },
        ])}
      />,
    )
    expect(screen.getByTestId("notif").textContent).toBe(
      "Last reminder: 2 offers are waiting for your reply",
    )
    expect(screen.getByTestId("notif").getAttribute("data-to")).toBe(
      "/offer/s2",
    )
  })

  it("buyer: still waiting, with the three options", () => {
    render(
      <NotificationEntry
        notif={notif("offer_waiting_buyer", "buyer", [
          { session_id: "s1", title: "Quantanium" },
        ])}
      />,
    )
    expect(screen.getByTestId("notif").textContent).toBe(
      '"Quantanium" is still waiting for the seller. Keep waiting, message the seller, or withdraw it.',
    )
  })

  it("buyer, several", () => {
    render(
      <NotificationEntry
        notif={notif("offer_waiting_buyer", "buyer", [
          { session_id: "s1", title: "A" },
          { session_id: "s2", title: "B" },
        ])}
      />,
    )
    expect(screen.getByTestId("notif").textContent).toBe(
      "2 of your offers are still waiting for the seller",
    )
  })
})
