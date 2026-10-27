import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi } from "vitest"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (
      _k: string,
      o: { defaultValue?: string } & Record<string, string> = {},
    ) =>
      (o.defaultValue ?? _k).replace(/\{\{(\w+)\}\}/g, (_m, n) => o[n] ?? ""),
  }),
  Trans: () => null,
}))

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

const base = {
  read: false,
  notification_id: "n1",
  entity_type: "x",
  timestamp: "2026-10-27T00:00:00Z",
  actors: [{ username: "newbie", display_name: "Newbie", avatar: "" }],
}

describe("NotificationEntry: org and offer-decision rows", () => {
  it("org_member_joined names the member and the org and links to its members tab", () => {
    render(
      <MemoryRouter>
        <NotificationEntry
          notif={
            {
              ...base,
              action: "org_member_joined",
              entity: { spectrum_id: "ACME", name: "Acme" },
            } as never
          }
        />
      </MemoryRouter>,
    )
    expect(screen.getByTestId("notif").textContent).toContain("Newbie")
    expect(screen.getByTestId("notif").textContent).toContain("Acme")
    expect(screen.getByTestId("notif").getAttribute("data-to")).toBe(
      "/contractor/ACME/members",
    )
  })

  it.each(["offer_accepted", "offer_rejected", "contract_offer_received"])(
    "%s renders and links to the offer",
    (action) => {
      render(
        <MemoryRouter>
          <NotificationEntry
            notif={{ ...base, action, entity: { id: "s1" } } as never}
          />
        </MemoryRouter>,
      )
      expect(screen.getByTestId("notif").getAttribute("data-to")).toBe(
        "/offer/s1",
      )
      expect(screen.getByTestId("notif").textContent).toContain("Newbie")
    },
  )
})
