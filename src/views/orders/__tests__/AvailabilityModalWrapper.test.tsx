import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
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
vi.mock("../../../components/time/AvailabilitySelector", () => ({
  AvailabilitySelector: (props: { onSave: (s: boolean[]) => void }) => (
    <button onClick={() => props.onSave([true])}>Save availability</button>
  ),
}))

import { AvailabilityModalWrapper } from "../AvailabilityModalWrapper"

const renderPicker = (onClose = vi.fn(), onSave = vi.fn()) => {
  render(
    <ThemeProvider theme={createTheme()}>
      <AvailabilityModalWrapper
        open
        onClose={onClose}
        title="Your availability"
        onSave={onSave}
        initialSelections={[]}
      />
    </ThemeProvider>,
  )
  return { onClose, onSave }
}

beforeEach(() => {
  h.mobile = false
})

describe("AvailabilityModalWrapper", () => {
  it("is named by its title; the selector saves, Cancel closes", () => {
    const { onClose, onSave } = renderPicker()
    expect(
      screen.getByRole("dialog", { name: "Your availability" }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByText("Save availability"))
    expect(onSave).toHaveBeenCalledWith([true])
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onClose).toHaveBeenCalled()
  })

  it("a backdrop click doesn't throw away the picked hours", () => {
    const { onClose } = renderPicker()
    fireEvent.click(document.querySelector(".MuiBackdrop-root") as Element)
    expect(onClose).not.toHaveBeenCalled()
  })

  it("full screen on phones", () => {
    h.mobile = true
    renderPicker()
    expect(document.querySelector(".MuiDialog-paperFullScreen")).not.toBeNull()
  })
})
