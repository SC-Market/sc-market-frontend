import React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const update = vi.fn()
const query = vi.fn()
const cell = (channel: string, enabled: boolean, extra: object = {}) => ({
  channel,
  enabled,
  locked: false,
  default: enabled,
  ...extra,
})
const data = {
  contractor_id: null,
  scopes: [
    { contractor_id: null, name: "Personal", spectrum_id: null },
    { contractor_id: "org-1", name: "Acme", spectrum_id: "ACME" },
  ],
  categories: [
    {
      category: "orders",
      cells: [],
      events: [
        {
          event: "order.created",
          cells: [
            cell("in_app", true, { locked: true, reason: "always_on" }),
            cell("push", true),
            cell("email", false),
            cell("discord_dm", false, { locked: true, reason: "coming_soon" }),
          ],
        },
        {
          event: "order.status.fulfilled",
          cells: [
            cell("in_app", true, { locked: true, reason: "always_on" }),
            cell("push", true),
          ],
        },
        {
          event: "order.status.cancelled",
          cells: [
            cell("in_app", true, { locked: true, reason: "always_on" }),
            cell("push", false),
          ],
        },
      ],
    },
    {
      category: "announcements",
      cells: [],
      events: [
        {
          event: "admin.alert",
          cells: [
            cell("in_app", true, { locked: true, reason: "always_on" }),
            cell("push", true, { locked: true, reason: "always_on" }),
          ],
        },
      ],
    },
  ],
}

vi.mock("../../../store/api/v2/market", () => ({
  useGetNotificationPreferencesQuery: (arg: unknown) => {
    query(arg)
    return { data, isLoading: false, isError: false, isFetching: false }
  },
  useUpdateNotificationPreferencesMutation: () => [
    update,
    { isLoading: false, isError: false },
  ],
  useGetContractAlertsQuery: () => ({
    data: undefined,
    isLoading: true,
    isError: false,
  }),
  useUpdateContractAlertMutation: () => [
    vi.fn(),
    { isLoading: false, isError: false },
  ],
}))
vi.mock("../../../components/paper/Section", () => ({
  FlatSection: ({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) => (
    <section>
      <h3>{title}</h3>
      {children}
    </section>
  ),
}))

import { NotificationPreferencesTabs } from "../components/NotificationPreferencesTabs"

const renderTabs = () =>
  render(
    <MemoryRouter>
      <NotificationPreferencesTabs />
    </MemoryRouter>,
  )

describe("NotificationPreferencesTabs", () => {
  beforeEach(() => {
    update.mockClear()
    query.mockClear()
  })

  it("shows the Orders & offers tab with a pill per channel; locked cells are disabled", () => {
    renderTabs()
    const row = screen.getByTestId("notif-row-new-order")
    const push = within(row).getByRole("switch", { name: "New order: Push" })
    expect(push.getAttribute("aria-checked")).toBe("true")
    expect(
      within(row)
        .getByRole("switch", { name: "New order: In-app" })
        .getAttribute("aria-disabled"),
    ).toBe("true")
    expect(
      within(row)
        .getByRole("switch", { name: "New order: Discord DM" })
        .getAttribute("aria-disabled"),
    ).toBe("true")
  })

  it("a row whose events differ is mixed; clicking turns all of them on", () => {
    renderTabs()
    const status = within(screen.getByTestId("notif-row-status")).getByRole(
      "switch",
      { name: "Status changes: Push" },
    )
    expect(status.getAttribute("aria-checked")).toBe("mixed")
    fireEvent.click(status)
    expect(update).toHaveBeenCalledWith({
      updateNotificationPreferencesRequest: {
        contractor_id: null,
        updates: [
          { event: "order.status.fulfilled", channel: "push", enabled: true },
          { event: "order.status.cancelled", channel: "push", enabled: true },
        ],
      },
    })
  })

  it("Customise lists the row's events", () => {
    renderTabs()
    fireEvent.click(
      within(screen.getByTestId("notif-row-status")).getByRole("button", {
        name: /Customise/,
      }),
    )
    expect(
      screen.getAllByText(/order\.status\.|Order (fulfilled|cancelled)/).length,
    ).toBeGreaterThan(0)
  })

  it("the Account tab shows announcements locked on", () => {
    renderTabs()
    fireEvent.click(screen.getByTestId("notif-tab-account"))
    const push = within(screen.getByTestId("notif-row-admin")).getByRole(
      "switch",
      { name: "Announcement: Push" },
    )
    expect(push.getAttribute("aria-checked")).toBe("true")
    expect(push.getAttribute("aria-disabled")).toBe("true")
  })
})
