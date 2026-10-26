/**
 * Regression: every Manage Org nav item must navigate to a route that exists.
 * The "White Label" item used to point at manage/whitelabel, which has no
 * route; the white-label settings live on the theme page (OrgThemePage).
 */
import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import { routes } from "../../../App"
import { enumerateRoutes } from "../../../router/__tests__/regression/harness"
import { OrgManageLayout } from "../OrgManageLayout"

const navigateSpy = vi.hoisted(() => vi.fn())
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateSpy,
}))

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

vi.mock("../../../features/contractor/hooks/usePageOrgManage", () => ({
  usePageOrgManage: () => ({
    isLoading: false,
    error: undefined,
    data: {
      contractor: {
        spectrum_id: "TESTORG",
        premium_tier: "white_label",
        owner_role: "owner",
        roles: [],
      },
      profile: {
        username: "owner-user",
        contractors: [
          { spectrum_id: "TESTORG", role: "owner", roles: ["owner"] },
        ],
      },
    },
  }),
}))

const MANAGE_PREFIX = "/org/:contractor_id/manage/"
const manageTabs = new Set(
  enumerateRoutes(routes)
    .map((leaf) => leaf.pattern)
    .filter((p) => p.startsWith(MANAGE_PREFIX))
    .map((p) => p.slice(MANAGE_PREFIX.length)),
)

describe("OrgManageLayout nav", () => {
  it("only offers items that have a manage/<tab> route (white-label org owner)", () => {
    render(
      <MemoryRouter initialEntries={["/org/TESTORG/manage/about"]}>
        <OrgManageLayout />
      </MemoryRouter>,
    )
    const labels = screen
      .getAllByRole("button")
      .map((b) => b.textContent ?? "")
    // The owner of a white-label org sees the combined theme item.
    expect(labels).toContain("Theme & White Label")
    expect(labels).not.toContain("White Label")
    expect(manageTabs.has("theme")).toBe(true)
  })

  it("every nav item navigates to a real manage/<tab> route", () => {
    render(
      <MemoryRouter initialEntries={["/org/TESTORG/manage/about"]}>
        <OrgManageLayout />
      </MemoryRouter>,
    )
    const buttons = screen.getAllByRole("button")
    expect(buttons.length).toBeGreaterThan(5)
    navigateSpy.mockClear()
    for (const b of buttons) fireEvent.click(b)
    const targets = navigateSpy.mock.calls.map((c) => c[0] as string)
    expect(targets).toHaveLength(buttons.length)
    expect(targets.filter((tab) => !manageTabs.has(tab))).toEqual([])
  })
})
