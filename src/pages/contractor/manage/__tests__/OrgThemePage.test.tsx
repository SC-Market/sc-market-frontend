/**
 * The Theme & White Label tab needed Manage Theme, but its Site Settings and
 * Sidebar save with Manage Org Details. Each section now shows for the
 * permission its save needs, and the tab shows for either.
 */
import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"

const page = vi.hoisted(() => ({ data: undefined as unknown }))

vi.mock("../../../../features/contractor/hooks/usePageOrgManage", () => ({
  usePageOrgManage: () => ({ data: page.data }),
}))
vi.mock("../../../../store/api/contractors", () => ({
  useGetOrgThemeQuery: () => ({ data: undefined }),
  useUpdateOrgThemeMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteOrgThemeMutation: () => [vi.fn()],
}))
vi.mock("../../../../components/theme-editor/ThemeEditor", () => ({
  ThemeEditor: () => <div>theme editor</div>,
}))
vi.mock("../../../../views/contractor/WhiteLabelSettings", () => ({
  WhiteLabelSettings: () => <div>white-label settings</div>,
}))

import { OrgThemePage } from "../OrgThemePage"
import { visibleOrgManageTabs } from "../../../../features/contractor/domain/manageTabs"

function memberWith(...permissions: string[]) {
  return {
    contractor: {
      spectrum_id: "WLORG",
      premium_tier: "white_label",
      owner_role: "owner",
      roles: [
        { role_id: "r1", position: 5, ...Object.fromEntries(permissions.map((p) => [p, true])) },
      ],
    },
    profile: { username: "me", contractors: [{ spectrum_id: "WLORG", role: "r", roles: ["r1"] }] },
  }
}

function sections(data: ReturnType<typeof memberWith>) {
  page.data = data
  const { unmount } = render(<OrgThemePage />)
  const shown = {
    editor: !!screen.queryByText("theme editor"),
    settings: !!screen.queryByText("white-label settings"),
  }
  unmount()
  return shown
}

describe("OrgThemePage", () => {
  it("shows the theme editor for Manage Theme only", () => {
    expect(sections(memberWith("manage_theme"))).toEqual({ editor: true, settings: false })
  })

  it("shows the site and sidebar settings for Manage Org Details only", () => {
    expect(sections(memberWith("manage_org_details"))).toEqual({ editor: false, settings: true })
  })

  it("the tab shows for either permission", () => {
    const tabs = (d: ReturnType<typeof memberWith>) =>
      visibleOrgManageTabs(d.contractor as never, d.profile as never)
    expect(tabs(memberWith("manage_theme"))).toContain("theme")
    expect(tabs(memberWith("manage_org_details"))).toContain("theme")
    expect(tabs(memberWith("manage_invites"))).not.toContain("theme")
  })
})
