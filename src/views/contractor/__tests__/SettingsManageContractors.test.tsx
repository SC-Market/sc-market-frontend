import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { describe, it, expect, vi, beforeEach } from "vitest"

const h = vi.hoisted(() => ({
  archiveTarget: null as null | { spectrum_id: string; name: string },
  transferTarget: null as null | { spectrum_id: string; name: string },
  archiving: false,
  setArchiveTarget: vi.fn(),
  handleArchiveOrg: vi.fn(),
  setTransferTarget: vi.fn(),
  handleTransferOwnership: vi.fn(),
}))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../hooks/layout/useBreakpoint", () => ({
  useIsMobile: () => false,
}))
vi.mock("../../../components/grid/ThemedDataGrid", () => ({
  ThemedDataGrid: () => null,
}))
vi.mock("../../../features/contractor/api/contractorApi", () => ({
  useGetContractorBySpectrumIDQuery: () => ({ data: undefined }),
}))
vi.mock("../../../features/contractor/hooks/useManageContractors", () => ({
  useManageContractors: () => ({
    profile: { contractors: [] },
    archiveTarget: h.archiveTarget,
    setArchiveTarget: h.setArchiveTarget,
    archiveReason: "",
    setArchiveReason: vi.fn(),
    isArchiving: h.archiving,
    handleArchiveOrg: h.handleArchiveOrg,
    transferTarget: h.transferTarget,
    setTransferTarget: h.setTransferTarget,
    transferSearchQuery: "",
    setTransferSearchQuery: vi.fn(),
    transferSelectedUser: null,
    setTransferSelectedUser: vi.fn(),
    transferSearchOptions: [],
    transferMembers: [],
    setTransferSearchOptions: vi.fn(),
    isTransferring: false,
    handleTransferOwnership: h.handleTransferOwnership,
    handleLeaveOrg: vi.fn(),
  }),
}))

import { SettingsManageContractors } from "../SettingsManageContractors"

const wrap = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <SettingsManageContractors />
    </ThemeProvider>,
  )

beforeEach(() => {
  h.archiveTarget = null
  h.transferTarget = null
  h.archiving = false
  vi.clearAllMocks()
})

describe("SettingsManageContractors confirms", () => {
  it("archive: named by its title, described with the org name, confirms", () => {
    h.archiveTarget = { spectrum_id: "ORG", name: "Red Wing" }
    wrap()
    expect(
      screen.getByRole("dialog", { name: "Archive organization?" }),
    ).toHaveAccessibleDescription(/Archiving Red Wing will remove all members/)
    fireEvent.click(
      screen.getByRole("button", { name: "Archive organization" }),
    )
    expect(h.handleArchiveOrg).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(h.setArchiveTarget).toHaveBeenCalledWith(null)
  })

  it("archive: locked while archiving", () => {
    h.archiveTarget = { spectrum_id: "ORG", name: "Red Wing" }
    h.archiving = true
    wrap()
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" })
    expect(h.setArchiveTarget).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
  })

  it("transfer: named by its title; Transfer needs a member", () => {
    h.transferTarget = { spectrum_id: "ORG", name: "Red Wing" }
    wrap()
    expect(
      screen.getByRole("dialog", { name: "Transfer organization ownership?" }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Transfer Ownership" }),
    ).toBeDisabled()
  })
})
