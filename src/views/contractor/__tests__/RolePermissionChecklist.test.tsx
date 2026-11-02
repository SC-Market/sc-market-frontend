import "../../../util/i18n"
/**
 * The role editor's permission checkboxes come from one list
 * (ROLE_PERMISSIONS) for both the Add Role form and each role's row, and
 * each has a "?" explanation that works without hovering.
 */
import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, within } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import { RolePermissionChecklist } from "../OrgRoles"
import {
  ROLE_PERMISSIONS,
  editableRolePermissions,
} from "../../../features/contractor/domain/rolePermissions"
import type { ContractorRole } from "../../../features/contractor/domain/types"

const role: ContractorRole = {
  contractor_id: "c1",
  role_id: "r1",
  name: "Trader",
  position: 5,
  manage_roles: false,
  manage_orders: false,
  kick_members: false,
  manage_invites: false,
  manage_org_details: false,
  manage_stock: true,
  manage_market: false,
  manage_recruiting: false,
  manage_webhooks: false,
  manage_blocklist: false,
  claim_orders: false,
  manage_theme: false,
}

function renderChecklist(premium_tier: string | null, setRole = vi.fn()) {
  render(
    <ThemeProvider theme={mainTheme}>
      <RolePermissionChecklist org={{ premium_tier }} role={role} setRole={setRole} />
    </ThemeProvider>,
  )
  return setRole
}

describe("editableRolePermissions", () => {
  it("offers Manage Theme only to white-label orgs", () => {
    expect(editableRolePermissions({ premium_tier: null })).toEqual(
      ROLE_PERMISSIONS.filter((p) => p !== "manage_theme"),
    )
    expect(editableRolePermissions({ premium_tier: "white_label" })).toEqual([...ROLE_PERMISSIONS])
    expect(editableRolePermissions(undefined)).not.toContain("manage_theme")
  })
})

describe("RolePermissionChecklist", () => {
  it("shows one checkbox per permission, in order, reflecting the role", () => {
    renderChecklist(null)
    const boxes = screen.getAllByRole("checkbox")
    expect(boxes.map((b) => b.getAttribute("name"))).toEqual(
      ROLE_PERMISSIONS.filter((p) => p !== "manage_theme"),
    )
    expect(screen.getByRole("checkbox", { name: /Manage Stock/ })).toBeChecked()
    expect(screen.getByRole("checkbox", { name: /Manage Market/ })).not.toBeChecked()
  })

  it("adds Manage Theme for a white-label org", () => {
    renderChecklist("white_label")
    expect(screen.getAllByRole("checkbox")).toHaveLength(ROLE_PERMISSIONS.length)
  })

  it("updates only the toggled permission", () => {
    const setRole = renderChecklist(null)
    fireEvent.click(screen.getByRole("checkbox", { name: /Manage Market/ }))
    expect(setRole).toHaveBeenCalledWith({ ...role, manage_market: true })
  })

  it("explains a permission from its ? button without toggling the checkbox", async () => {
    const setRole = renderChecklist(null)
    const help = screen.getByRole("button", { name: "Help: Manage Stock" })
    fireEvent.click(help)
    const tip = await screen.findByRole("tooltip")
    expect(within(tip).getByText(/stock lots/i)).toBeInTheDocument()
    expect(setRole).not.toHaveBeenCalled()
  })
})
