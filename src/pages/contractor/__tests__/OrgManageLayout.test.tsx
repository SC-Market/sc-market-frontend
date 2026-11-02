/**
 * Regression: every Manage Org nav item must navigate to a route that exists.
 * The "White Label" item used to point at manage/whitelabel, which has no
 * route; the white-label settings live on the theme page (OrgThemePage).
 */
import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { routes } from "../../../router/routeObjects"
import { enumerateRoutes } from "../../../router/__tests__/regression/harness"
import { OrgManageLayout } from "../OrgManageLayout"

const navigateSpy = vi.hoisted(() => vi.fn())
// The branding status query (needs a store); a white_label grant answers it.
vi.mock("../../../features/storefront/hooks/useBrandingUnlocked", () => ({
  useBrandingUnlocked: (c: { premium_tier?: string } | undefined) => c?.premium_tier === "white_label",
}))

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateSpy,
}))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(importOriginal),
)

vi.mock("../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

vi.mock("../../../hooks/layout/useBreakpoint", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../hooks/layout/useBreakpoint")>()),
  useBreakpointUp: () => true,
}))

const OWNER = {
  contractor: {
    spectrum_id: "TESTORG",
    premium_tier: "white_label",
    owner_role: "owner",
    roles: [],
  },
  profile: {
    username: "owner-user",
    contractors: [{ spectrum_id: "TESTORG", role: "owner", roles: ["owner"] }],
  },
}

/** A member whose only role grants `permissions`. */
function memberWith(...permissions: string[]) {
  return {
    contractor: {
      ...OWNER.contractor,
      roles: [
        {
          role_id: "officer",
          name: "Officer",
          position: 5,
          ...Object.fromEntries(permissions.map((p) => [p, true])),
        },
      ],
    },
    profile: {
      username: "officer-user",
      contractors: [{ spectrum_id: "TESTORG", role: "Officer", roles: ["officer"] }],
    },
  }
}

const page = vi.hoisted(() => ({ data: undefined as unknown }))
vi.mock("../../../features/contractor/hooks/usePageOrgManage", () => ({
  usePageOrgManage: () => ({ isLoading: false, error: undefined, data: page.data }),
}))

function navLabels(data: unknown) {
  page.data = data
  const { unmount } = render(
    <MemoryRouter initialEntries={["/org/TESTORG/manage/about"]}>
      <OrgManageLayout />
    </MemoryRouter>,
  )
  const labels = screen.queryAllByRole("button").map((b) => b.textContent ?? "")
  unmount()
  return labels
}

const MANAGE_PREFIX = "/org/:contractor_id/manage/"
const manageTabs = new Set(
  enumerateRoutes(routes)
    .map((leaf) => leaf.pattern)
    .filter((p) => p.startsWith(MANAGE_PREFIX))
    .map((p) => p.slice(MANAGE_PREFIX.length)),
)

describe("OrgManageLayout nav", () => {
  beforeEach(() => {
    page.data = OWNER
  })

  it("has no Market, Blocked Users or Customers tabs (those live on each shop)", () => {
    const labels = navLabels(OWNER)
    expect(labels).not.toContain("Market")
    expect(labels).not.toContain("Blocked Users")
    expect(labels).not.toContain("Customers")
    for (const tab of ["market", "blocklist", "customers"]) expect(manageTabs.has(tab)).toBe(false)
  })

  it("shows Discord Integration with Manage Webhooks, not Manage Invites", () => {
    expect(navLabels(memberWith("manage_invites"))).toEqual(["Invites"])
    expect(navLabels(memberWith("manage_webhooks"))).toEqual(["Discord Integration"])
  })

  it("hides Audit Logs from members without Manage Org Details", () => {
    expect(navLabels(memberWith("manage_invites"))).not.toContain("Audit Logs")
    expect(navLabels(memberWith("manage_org_details"))).toContain("Audit Logs")
  })

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
