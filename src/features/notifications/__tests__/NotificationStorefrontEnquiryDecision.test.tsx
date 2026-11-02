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
    <div data-testid="notif" data-to={to ?? ""}>
      {children}
    </div>
  ),
}))

import { NotificationEntry } from "../components/NotificationEntry"

const base = {
  read: false,
  notification_id: "n1",
  entity_type: "storefront_enquiries",
  timestamp: "2026-11-01T00:00:00Z",
  actors: [],
}

const entity = (target_type: "org" | "shop", target: string) => ({
  enquiry_id: "e1",
  target_type,
  target,
  target_name: target_type === "org" ? "Test Org" : "My Shop",
  requested_subdomain: "testorg",
  status: "completed",
})

describe("storefront enquiry decision notifications (to the sender)", () => {
  it("accepted: names the org and subdomain, links to the org's Storefront settings", () => {
    render(
      <NotificationEntry
        notif={
          {
            ...base,
            action: "storefront_enquiry_accepted",
            entity: entity("org", "TESTORG"),
          } as never
        }
      />,
    )
    const el = screen.getByTestId("notif")
    expect(el.textContent).toBe(
      "Your branded storefront enquiry for Test Org (testorg.sc-market.space) was accepted",
    )
    expect(el.getAttribute("data-to")).toBe("/org/TESTORG/manage/storefront")
  })

  it("declined: a shop's enquiry links to the shop's settings", () => {
    render(
      <NotificationEntry
        notif={
          {
            ...base,
            action: "storefront_enquiry_declined",
            entity: entity("shop", "my-shop"),
          } as never
        }
      />,
    )
    const el = screen.getByTestId("notif")
    expect(el.textContent).toBe(
      "Your branded storefront enquiry for My Shop (testorg.sc-market.space) was declined",
    )
    expect(el.getAttribute("data-to")).toBe("/shop/my-shop/settings")
  })

  it("an enquiry that is gone still renders a generic line, with no link", () => {
    render(
      <NotificationEntry
        notif={
          {
            ...base,
            action: "storefront_enquiry_declined",
            entity: null,
          } as never
        }
      />,
    )
    const el = screen.getByTestId("notif")
    expect(el.textContent).toBe("Your branded storefront enquiry was declined")
    expect(el.getAttribute("data-to")).toBe("")
  })

  it("the admins' new-enquiry notification is unchanged", () => {
    render(
      <NotificationEntry
        notif={
          {
            ...base,
            action: "storefront_enquiry_created",
            entity: entity("org", "TESTORG"),
          } as never
        }
      />,
    )
    expect(screen.getByTestId("notif").textContent).toBe(
      "Test Org asked for a branded storefront: testorg.sc-market.space",
    )
  })
})
