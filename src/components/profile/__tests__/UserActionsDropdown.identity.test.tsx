/**
 * The profile actions menu no longer offers the retired v1 admin "Unlink RSI
 * account" (POST /api/admin/users/:username/unlink, removed); admins get a
 * link to Admin -> Identity with the user searched instead.
 */
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import { describe, it, expect, vi } from "vitest"

const h = vi.hoisted(() => ({ isAdmin: true }))

vi.mock("../../../features/profile/hooks/useUserActions", () => ({
  useUserActions: () => ({
    myProfile: { username: "boss" },
    contractor: undefined,
    isPersonallyBlocked: false,
    isSelf: false,
    isOrgBlocked: false,
    isAdmin: h.isAdmin,
    personalBlocklistLoading: false,
    orgBlocklistLoading: false,
  }),
}))
vi.mock("../BlockUserButton", () => ({ BlockUserButton: () => null, BlockUserForOrgButton: () => null }))
vi.mock("../UnblockUserButton", () => ({ UnblockUserButton: () => null, UnblockUserForOrgButton: () => null }))

import { UserActionsDropdown } from "../UserActionsDropdown"

function open(isAdmin: boolean) {
  h.isAdmin = isAdmin
  render(
    <ThemeProvider theme={mainTheme}>
      <MemoryRouter>
        <UserActionsDropdown user={{ username: "Stale Handle", rsi_confirmed: true } as never} />
      </MemoryRouter>
    </ThemeProvider>,
  )
  fireEvent.click(screen.getAllByRole("button")[0])
}

describe("UserActionsDropdown admin identity entry", () => {
  it("admins get a link to Admin -> Identity with the user searched", () => {
    open(true)
    const link = screen.getByRole("link", { name: /Admin -> Identity/ })
    expect(link).toHaveAttribute("href", "/admin/identity?q=Stale%20Handle")
    expect(screen.queryByText(/Unlink RSI/)).toBeNull()
  })

  it("non-admins don't", () => {
    open(false)
    expect(screen.queryByRole("link", { name: /Admin -> Identity/ })).toBeNull()
  })
})
