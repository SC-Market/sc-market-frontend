import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

const h = vi.hoisted(() => ({
  mobile: false,
  submitting: false,
  submit: vi.fn(),
}))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../hooks/layout/useBreakpoint", () => ({
  useIsMobile: () => h.mobile,
}))
vi.mock("../../../features/profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({ data: { username: "pilot" } }),
}))
vi.mock("../../../features/admin/hooks/useModerationActions", () => ({
  useReportContent: () => ({ submit: h.submit, isSubmitting: h.submitting }),
}))

import { ReportButton } from "../ReportButton"

const renderButton = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter initialEntries={["/market/abc"]}>
        <ReportButton />
      </MemoryRouter>
    </ThemeProvider>,
  )

const openDialog = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Report this content" }))
  return screen.findByRole("dialog", { name: "Report Content" })
}

beforeEach(() => {
  h.mobile = false
  h.submitting = false
  h.submit.mockReset()
})

describe("ReportButton", () => {
  it("opens a dialog named by its title, described by the intro, for the current page", async () => {
    renderButton()
    const dialog = await openDialog()
    expect(dialog).toHaveAccessibleDescription(
      "Help us keep the community safe by reporting content that violates our guidelines.",
    )
    expect(screen.getByText("/market/abc")).toBeInTheDocument()
  })

  it("Submit stays disabled until a reason is picked, then sends the report", async () => {
    h.submit.mockResolvedValue(true)
    renderButton()
    await openDialog()
    const submit = screen.getByRole("button", { name: "Submit report" })
    expect(submit).toBeDisabled()
    fireEvent.mouseDown(screen.getByRole("combobox"))
    fireEvent.click(await screen.findByRole("option", { name: "Spam" }))
    expect(submit).toBeEnabled()
    fireEvent.click(submit)
    await waitFor(() =>
      expect(h.submit).toHaveBeenCalledWith("/market/abc", "spam", ""),
    )
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("phones: one bottom sheet (with a drag handle), same dialog", async () => {
    h.mobile = true
    renderButton()
    await openDialog()
    expect(screen.getByTestId("sheet-handle")).toBeInTheDocument()
  })

  it("can't be dismissed while the report is sending", async () => {
    h.submitting = true
    renderButton()
    const dialog = await openDialog()
    fireEvent.keyDown(dialog, { key: "Escape" })
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Close" })).toBeDisabled()
  })
})
