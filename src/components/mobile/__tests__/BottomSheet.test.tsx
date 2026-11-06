import React, { useState } from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { Button } from "@mui/material"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { mainTheme } from "../../../hooks/styles/Theme"
import { BottomSheet } from "../BottomSheet"

const h = vi.hoisted(() => ({ mobile: true }))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../hooks/layout/useBreakpoint", () => ({
  useIsMobile: () => h.mobile,
}))

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={mainTheme}>{ui}</ThemeProvider>)

function Opener(
  props: Partial<React.ComponentProps<typeof BottomSheet>> & {
    onCloseSpy?: () => void
  },
) {
  const [open, setOpen] = useState(false)
  const { onCloseSpy, ...rest } = props
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open it</Button>
      <BottomSheet
        title="Messages"
        {...rest}
        open={open}
        onClose={() => {
          onCloseSpy?.()
          setOpen(false)
        }}
      >
        <input aria-label="Search chats" />
      </BottomSheet>
    </>
  )
}

beforeEach(() => {
  h.mobile = true
})

describe("BottomSheet", () => {
  it("is a modal dialog named by its title", () => {
    wrap(<Opener />)
    fireEvent.click(screen.getByText("Open it"))
    const dialog = screen.getByRole("dialog", { name: "Messages" })
    expect(dialog).toHaveAttribute("aria-modal", "true")
    expect(
      screen.getByRole("heading", { level: 2, name: "Messages" }),
    ).toBeInTheDocument()
  })

  it("uses ariaLabel when there is no visible title", () => {
    wrap(<Opener title={undefined} ariaLabel="Quick edit" />)
    fireEvent.click(screen.getByText("Open it"))
    expect(screen.getByRole("dialog", { name: "Quick edit" })).toBeVisible()
  })

  it("uses ariaLabelledBy / ariaDescribedBy when given", () => {
    wrap(
      <BottomSheet
        open
        onClose={() => {}}
        ariaLabelledBy="t"
        ariaDescribedBy="d"
      >
        <span id="t">Image preview</span>
        <span id="d">Swipe to browse</span>
      </BottomSheet>,
    )
    const dialog = screen.getByRole("dialog", { name: "Image preview" })
    expect(dialog).toHaveAccessibleDescription("Swipe to browse")
  })

  it("does not mount its content while closed", () => {
    wrap(<Opener />)
    expect(screen.queryByLabelText("Search chats")).toBeNull()
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("unmounts its content after closing", async () => {
    wrap(<Opener />)
    fireEvent.click(screen.getByText("Open it"))
    expect(screen.getByLabelText("Search chats")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    await waitFor(() =>
      expect(screen.queryByLabelText("Search chats")).toBeNull(),
    )
  })

  it("keeps its content mounted while closed with keepMounted", () => {
    wrap(<Opener keepMounted />)
    expect(
      screen.getByLabelText("Search chats", { selector: "input" }),
    ).toBeInTheDocument()
  })

  it("closes on Escape and returns focus to the opener", async () => {
    const spy = vi.fn()
    wrap(<Opener onCloseSpy={spy} />)
    const opener = screen.getByText("Open it")
    opener.focus()
    fireEvent.click(opener)
    const dialog = screen.getByRole("dialog")
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement),
    )
    fireEvent.keyDown(dialog, { key: "Escape" })
    expect(spy).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(document.activeElement).toBe(opener)
  })

  it("closes once on a backdrop click", () => {
    const spy = vi.fn()
    wrap(<Opener onCloseSpy={spy} />)
    fireEvent.click(screen.getByText("Open it"))
    const backdrop = document.querySelector(".MuiBackdrop-root") as HTMLElement
    fireEvent.click(backdrop)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("ignores backdrop clicks with disableBackdropClose", () => {
    const spy = vi.fn()
    wrap(<Opener onCloseSpy={spy} disableBackdropClose />)
    fireEvent.click(screen.getByText("Open it"))
    const backdrop = document.querySelector(".MuiBackdrop-root") as HTMLElement
    fireEvent.click(backdrop)
    expect(spy).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("closes when the handle is dragged down past the peek snap", () => {
    const spy = vi.fn()
    wrap(<Opener onCloseSpy={spy} snapPoints={["peek", "full"]} />)
    fireEvent.click(screen.getByText("Open it"))
    const handle = screen.getByTestId("bottom-sheet-handle")
    fireEvent.touchStart(handle, { touches: [{ clientY: 100 }] })
    fireEvent.touchMove(handle, { touches: [{ clientY: 1000 }] })
    fireEvent.touchEnd(handle)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("snaps instead of closing after a short drag", () => {
    const spy = vi.fn()
    wrap(<Opener onCloseSpy={spy} snapPoints={["half", "full"]} />)
    fireEvent.click(screen.getByText("Open it"))
    const handle = screen.getByTestId("bottom-sheet-handle")
    fireEvent.touchStart(handle, { touches: [{ clientY: 100 }] })
    fireEvent.touchMove(handle, { touches: [{ clientY: 140 }] })
    fireEvent.touchEnd(handle)
    expect(spy).not.toHaveBeenCalled()
  })
})
