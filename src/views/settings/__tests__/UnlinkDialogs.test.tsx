import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const h = vi.hoisted(() => ({
  mobile: false,
  unlinkRsi: vi.fn(),
  rsiLoading: false,
  confirmProvider: vi.fn(),
  cancelProvider: vi.fn(),
  providerUnlinking: false,
}))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../hooks/layout/useBreakpoint", () => ({
  useIsMobile: () => h.mobile,
}))
vi.mock("../../../features/profile/hooks/useAccountSettingsActions", () => ({
  useUnlinkRsiAccount: () => ({
    unlink: h.unlinkRsi,
    isLoading: h.rsiLoading,
    isSuccess: false,
    isError: false,
    error: undefined,
  }),
}))
vi.mock("../../../features/profile/hooks/useAccountLinks", () => ({
  useAccountLinks: () => ({
    isLoading: false,
    isUnlinking: h.providerUnlinking,
    isSettingPrimary: false,
    errorMessage: null,
    setErrorMessage: vi.fn(),
    accountUsername: null,
    setAccountUsername: vi.fn(),
    citizenIDUsername: null,
    setCitizenIDUsername: vi.fn(),
    authProviders: [],
    hasDiscord: true,
    hasCitizenID: false,
    primaryProvider: null,
    unlinkDialog: { open: true, providerType: "discord" },
    handleUnlinkClick: vi.fn(),
    handleConfirmUnlink: h.confirmProvider,
    handleCancelUnlink: h.cancelProvider,
    handleSetPrimary: vi.fn(),
    getProviderName: () => "Discord",
  }),
}))
vi.mock("../../../components/button/LinkCitizenIDButton", () => ({
  LinkCitizenIDButton: () => null,
}))
vi.mock("../../../components/button/DiscordLoginButton", () => ({
  DiscordLoginButton: () => null,
}))

import { mainTheme } from "../../../hooks/styles/Theme"
import { UnlinkProfile } from "../UnlinkProfile"
import { AccountLinks } from "../AccountLinks"

const wrap = (ui: React.ReactElement) =>
  render(
    <ThemeProvider theme={mainTheme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>,
  )

beforeEach(() => {
  h.mobile = false
  h.rsiLoading = false
  h.providerUnlinking = false
  h.unlinkRsi.mockReset()
  h.confirmProvider.mockReset()
  h.cancelProvider.mockReset()
})

describe("UnlinkProfile", () => {
  it("confirms in a dialog named by its title before unlinking", () => {
    wrap(<UnlinkProfile />)
    fireEvent.click(screen.getByRole("button", { name: "Unlink Account" }))
    const dialog = screen.getByRole("dialog", {
      name: "Confirm Account Unlink",
    })
    expect(dialog).toHaveAccessibleDescription(
      /reset your profile to unverified status/,
    )
    const buttons = screen.getAllByRole("button", { name: "Unlink Account" })
    fireEvent.click(buttons[buttons.length - 1])
    expect(h.unlinkRsi).toHaveBeenCalledTimes(1)
  })

  it("phones: the same confirm as a bottom sheet", () => {
    h.mobile = true
    wrap(<UnlinkProfile />)
    fireEvent.click(screen.getByRole("button", { name: "Unlink Account" }))
    expect(
      screen.getByRole("dialog", { name: "Confirm Account Unlink" }),
    ).toBeInTheDocument()
    expect(screen.getByTestId("sheet-handle")).toBeInTheDocument()
  })
})

describe("AccountLinks unlink confirm", () => {
  it("is named by its title; Unlink confirms, Cancel cancels", () => {
    wrap(<AccountLinks />)
    expect(
      screen.getByRole("dialog", { name: "Unlink Account" }),
    ).toHaveAccessibleDescription(
      "Are you sure you want to unlink this account? You will no longer be able to log in using this method.",
    )
    fireEvent.click(screen.getByRole("button", { name: "Unlink" }))
    expect(h.confirmProvider).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(h.cancelProvider).toHaveBeenCalledTimes(1)
  })

  it("can't be dismissed while unlinking", () => {
    h.providerUnlinking = true
    wrap(<AccountLinks />)
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" })
    expect(h.cancelProvider).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
  })
})
