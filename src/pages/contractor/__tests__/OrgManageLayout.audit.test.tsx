/**
 * The org audit log is served only to Manage Org Details holders, so the
 * manage nav must not offer it to other members.
 */
import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import { OrgManageLayout } from "../OrgManageLayout"

const h = vi.hoisted(() => ({ granted: new Set<string>() }))

vi.mock("react-i18next", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-i18next")>()),
  useTranslation: () => ({
    t: (key: string, fallback?: string) =>
      typeof fallback === "string" ? fallback : key,
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
}))
vi.mock("../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))
vi.mock("../../../hooks/layout/useBreakpoint", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../hooks/layout/useBreakpoint")>()),
  useBreakpointUp: () => true,
}))
vi.mock("../../../features/contractor/domain/permissions", () => ({
  has_permission: (_c: unknown, _p: unknown, perm: string) => h.granted.has(perm),
}))
vi.mock("../../../features/contractor/hooks/usePageOrgManage", () => ({
  usePageOrgManage: () => ({
    isLoading: false,
    error: undefined,
    data: {
      contractor: { spectrum_id: "TESTORG", owner_role: "owner", roles: [] },
      profile: { username: "member", contractors: [] },
    },
  }),
}))

function navLabels() {
  render(
    <MemoryRouter initialEntries={["/org/TESTORG/manage/invites"]}>
      <OrgManageLayout />
    </MemoryRouter>,
  )
  return screen.queryAllByRole("button").map((b) => b.textContent ?? "")
}

describe("OrgManageLayout audit log item", () => {
  it("is hidden from members without Manage Org Details", () => {
    h.granted = new Set(["manage_invites"])
    const labels = navLabels()
    expect(labels).toContain("org.invitesTab")
    expect(labels).not.toContain("org.auditLogsTab")
  })

  it("is shown to Manage Org Details holders", () => {
    h.granted = new Set(["manage_org_details"])
    expect(navLabels()).toContain("org.auditLogsTab")
  })
})
