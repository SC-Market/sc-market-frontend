/**
 * Admin alert notifications open only http(s) links, in a new window with
 * no opener (a javascript: or data: link would otherwise run as the site).
 */
import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Notification } from "../../../../hooks/login/UserProfile"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../api/notificationApi", () => ({
  useNotificationUpdateMutation: () => [vi.fn(async () => ({}))],
}))
vi.mock("../../../../components/markdown/Markdown.lazy", () => ({
  MarkdownRender: (props: { text: string }) => <div>{props.text}</div>,
}))
vi.mock("../../components/NotificationBase", () => ({
  NotificationBase: (props: {
    onClick?: () => void
    children: React.ReactNode
  }) => (
    <div>
      {props.onClick && <button onClick={props.onClick}>open</button>}
      {props.children}
    </div>
  ),
}))

import {
  NotificationAdminAlert,
  safeAlertLink,
} from "../NotificationAdminAlert"

function notif(link: string | undefined): Notification {
  return {
    read: false,
    notification_id: "n1",
    action: "admin_alert",
    entity_type: "admin_alerts",
    entity: {
      alert_id: "a1",
      title: "Maintenance",
      content: "Down at 10",
      link,
    },
    timestamp: "2026-11-10T00:00:00Z",
    actors: [],
  }
}

describe("safeAlertLink", () => {
  it("keeps http(s) links and drops every other scheme", () => {
    expect(safeAlertLink("https://sc-market.space/news")).toBe(
      "https://sc-market.space/news",
    )
    expect(safeAlertLink("http://example.com")).toBe("http://example.com")
    expect(safeAlertLink("javascript:alert(1)")).toBeNull()
    expect(safeAlertLink("JavaScript:alert(1)")).toBeNull()
    expect(safeAlertLink("data:text/html,<script>1</script>")).toBeNull()
    expect(safeAlertLink("/relative")).toBeNull()
    expect(safeAlertLink(undefined)).toBeNull()
  })
})

describe("NotificationAdminAlert", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(window, "open").mockImplementation(() => null)
  })

  it("opens an https link with noopener,noreferrer", async () => {
    render(
      <NotificationAdminAlert notif={notif("https://sc-market.space/n")} />,
    )
    fireEvent.click(screen.getByRole("button", { name: "open" }))
    await waitFor(() =>
      expect(window.open).toHaveBeenCalledWith(
        "https://sc-market.space/n",
        "_blank",
        "noopener,noreferrer",
      ),
    )
  })

  it("a javascript: link is not clickable at all", () => {
    render(<NotificationAdminAlert notif={notif("javascript:alert(1)")} />)
    expect(screen.queryByRole("button", { name: "open" })).toBeNull()
    expect(window.open).not.toHaveBeenCalled()
  })
})
