import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const h = vi.hoisted(() => ({ mobile: false }))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../hooks/layout/useBreakpoint", () => ({
  useIsMobile: () => h.mobile,
}))
vi.mock("../../../features/profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({ data: undefined }),
}))
vi.mock("../../../features/market/api/marketV2Api", () => ({
  useSearchListingsQuery: () => ({ data: undefined }),
}))
vi.mock("../../../features/shops/api/shopsApi", () => ({
  useGetMyShopsQuery: () => ({ data: [] }),
}))
vi.mock("../../../features/contractor/hooks/useWhiteLabelSidebar", () => ({
  useWhiteLabelSidebar: () => ({
    hidden: new Set(),
    customTabs: [],
    loaded: true,
  }),
}))
vi.mock("../../../hooks/login/useSession", () => ({
  useIsAuthenticated: () => false,
}))
vi.mock("../../../util/startupDeferral", () => ({
  useStartupGateOpen: () => true,
}))

import { CommandPalette } from "../CommandPalette"

const NAME = "Search pages, actions and listings"

const renderPalette = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter>
        <CommandPalette />
      </MemoryRouter>
    </ThemeProvider>,
  )

const openWithShortcut = () =>
  fireEvent.keyDown(window, { key: "k", ctrlKey: true })

beforeEach(() => {
  h.mobile = false
})

describe("CommandPalette", () => {
  it("opens on Ctrl+K as a dialog named by its search field, and focuses it", async () => {
    renderPalette()
    expect(screen.queryByRole("dialog")).toBeNull()
    openWithShortcut()
    const dialog = await screen.findByRole("dialog", { name: NAME })
    expect(dialog).toBeInTheDocument()
    await waitFor(() => expect(screen.getByPlaceholderText(NAME)).toHaveFocus())
  })

  it("desktop: a centred overlay with the ESC hint, not full screen", async () => {
    renderPalette()
    openWithShortcut()
    await screen.findByRole("dialog", { name: NAME })
    expect(screen.getAllByText("ESC").length).toBeGreaterThan(0)
    expect(document.querySelector(".MuiDialog-paperFullScreen")).toBeNull()
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull()
  })

  it("phones: full screen with a close button", async () => {
    h.mobile = true
    renderPalette()
    openWithShortcut()
    await screen.findByRole("dialog", { name: NAME })
    expect(document.querySelector(".MuiDialog-paperFullScreen")).not.toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("Escape closes it", async () => {
    renderPalette()
    openWithShortcut()
    await screen.findByRole("dialog", { name: NAME })
    fireEvent.keyDown(window, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })
})
