import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, a?: string | ({ defaultValue?: string } & Record<string, string>)) => {
      const o = typeof a === "string" ? { defaultValue: a } : (a ?? {})
      return (o.defaultValue ?? _k).replace(/\{\{(\w+)\}\}/g, (_m, n) => (o as Record<string, string>)[n] ?? "")
    },
  }),
  Trans: () => null,
}))

vi.mock("../components/NotificationBase", () => ({
  NotificationBase: ({ to, children }: { to?: string; children: React.ReactNode }) => (
    <div data-testid="notif" data-to={to}>
      {children}
    </div>
  ),
}))

import { NotificationEntry } from "../components/NotificationEntry"

const base = {
  read: false,
  notification_id: "n1",
  action: "account_identity_changed",
  entity_type: "audit_logs",
  timestamp: "2026-10-28T00:00:00Z",
  actors: [],
}

const notice = (kind: string, new_username: string | null = null) =>
  ({ ...base, entity: { audit_log_id: "a1", kind, new_username, created_at: "2026-10-28T00:00:00Z" } }) as never

describe("account_identity_changed notification", () => {
  it("a released username names the new one and links to Settings", () => {
    render(<NotificationEntry notif={notice("username_released", "user_ab12cd34")} />)
    expect(screen.getByTestId("notif").textContent).toContain("user_ab12cd34")
    expect(screen.getByTestId("notif").textContent).toContain("Sync handle")
    expect(screen.getByTestId("notif").getAttribute("data-to")).toBe("/settings")
  })

  it.each([
    ["discord_unlinked", "unlinked Discord"],
    ["spectrum_cleared", "removed the RSI link"],
    ["spectrum_set", "updated the RSI link"],
    ["account_deactivated", "deactivated your account"],
    ["account_reactivated", "reactivated your account"],
  ])("%s", (kind, text) => {
    render(<NotificationEntry notif={notice(kind)} />)
    expect(screen.getByTestId("notif").textContent).toContain(text)
  })

  it("an unexpected entity still renders a generic line", () => {
    render(<NotificationEntry notif={{ ...base, entity: null } as never} />)
    expect(screen.getByTestId("notif").textContent).toBe("An admin changed your account.")
  })
})
