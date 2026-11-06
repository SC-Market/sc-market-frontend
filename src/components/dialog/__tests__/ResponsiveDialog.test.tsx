import React, { useState } from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { Button } from "@mui/material"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ResponsiveDialog } from "../ResponsiveDialog"
import { ConfirmDialog } from "../ConfirmDialog"

const h = vi.hoisted(() => ({ mobile: false }))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../hooks/layout/useBreakpoint", () => ({
  useIsMobile: () => h.mobile,
}))

const theme = createTheme()
const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)

function Opener(
  props: Partial<React.ComponentProps<typeof ResponsiveDialog>> & {
    onCloseSpy?: () => void
  },
) {
  const [open, setOpen] = useState(false)
  const { onCloseSpy, ...rest } = props
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open it</Button>
      <ResponsiveDialog
        title="Rename shop"
        description="Pick a new name."
        actions={<Button>Save</Button>}
        {...rest}
        open={open}
        onClose={() => {
          onCloseSpy?.()
          setOpen(false)
        }}
      >
        <input aria-label="Name" />
      </ResponsiveDialog>
    </>
  )
}

const paper = () =>
  screen.getByRole("dialog").closest(".MuiDialog-paper") ??
  screen.getByRole("dialog")

beforeEach(() => {
  h.mobile = false
})

describe("ResponsiveDialog", () => {
  it("labels the dialog with its title and description", () => {
    wrap(<Opener />)
    fireEvent.click(screen.getByText("Open it"))
    const dialog = screen.getByRole("dialog", { name: "Rename shop" })
    expect(dialog).toHaveAccessibleDescription("Pick a new name.")
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
  })

  it("uses ariaLabel when there is no visible title", () => {
    wrap(<Opener title={undefined} ariaLabel="Item details" />)
    fireEvent.click(screen.getByText("Open it"))
    expect(
      screen.getByRole("dialog", { name: "Item details" }),
    ).toBeInTheDocument()
  })

  it("renders a centred dialog on desktop", () => {
    wrap(<Opener />)
    fireEvent.click(screen.getByText("Open it"))
    expect(paper().className).not.toMatch(/FullScreen/)
    expect(paper().className).toMatch(/paperWidthSm/)
  })

  it("renders a bottom sheet on phones by default", () => {
    h.mobile = true
    wrap(<Opener />)
    fireEvent.click(screen.getByText("Open it"))
    const container = paper().parentElement as HTMLElement
    expect(getComputedStyle(container).alignItems).toBe("flex-end")
    expect(paper().className).not.toMatch(/FullScreen/)
  })

  it("closes the sheet when its handle is dragged down", () => {
    h.mobile = true
    const spy = vi.fn()
    wrap(<Opener onCloseSpy={spy} />)
    fireEvent.click(screen.getByText("Open it"))
    const handle = screen.getByTestId("sheet-handle")
    fireEvent.touchStart(handle, { touches: [{ clientY: 100 }] })
    fireEvent.touchMove(handle, { touches: [{ clientY: 140 }] })
    fireEvent.touchEnd(handle)
    expect(spy).not.toHaveBeenCalled()
    fireEvent.touchStart(handle, { touches: [{ clientY: 100 }] })
    fireEvent.touchMove(handle, { touches: [{ clientY: 260 }] })
    fireEvent.touchEnd(handle)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("goes full screen on phones when asked", () => {
    h.mobile = true
    wrap(<Opener mobile="fullScreen" />)
    fireEvent.click(screen.getByText("Open it"))
    expect(paper().className).toMatch(/FullScreen/)
  })

  it("closes on Escape and returns focus to the opener", async () => {
    const spy = vi.fn()
    wrap(<Opener onCloseSpy={spy} />)
    const opener = screen.getByText("Open it")
    opener.focus()
    fireEvent.click(opener)
    const dialog = screen.getByRole("dialog")
    const root = dialog.closest(".MuiDialog-root") as HTMLElement
    await waitFor(() =>
      expect(root).toContainElement(document.activeElement as HTMLElement),
    )
    fireEvent.keyDown(dialog, { key: "Escape" })
    expect(spy).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(document.activeElement).toBe(opener)
  })

  it("closes from the close button", async () => {
    const spy = vi.fn()
    wrap(<Opener onCloseSpy={spy} />)
    fireEvent.click(screen.getByText("Open it"))
    fireEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("disableClose ignores Escape, the backdrop and the close button", () => {
    const spy = vi.fn()
    wrap(<Opener onCloseSpy={spy} disableClose />)
    fireEvent.click(screen.getByText("Open it"))
    const dialog = screen.getByRole("dialog")
    fireEvent.keyDown(dialog, { key: "Escape" })
    const backdrop = document.querySelector(".MuiBackdrop-root") as HTMLElement
    fireEvent.mouseDown(backdrop)
    fireEvent.click(backdrop)
    const close = screen.getByRole("button", { name: "Close" })
    expect(close).toBeDisabled()
    expect(spy).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("submits as a form when onSubmit is given", () => {
    const submit = vi.fn((e: React.FormEvent) => e.preventDefault())
    wrap(
      <ResponsiveDialog
        open
        onClose={() => {}}
        title="Add email"
        onSubmit={submit}
        actions={<Button type="submit">Add</Button>}
      />,
    )
    fireEvent.click(screen.getByRole("button", { name: "Add" }))
    expect(submit).toHaveBeenCalledTimes(1)
  })
})

describe("ConfirmDialog", () => {
  it("confirms and cancels", () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    wrap(
      <ConfirmDialog
        open
        onClose={onClose}
        onConfirm={onConfirm}
        title="Delete email?"
        message="This can't be undone."
        confirmLabel="Delete"
        destructive
      />,
    )
    const dialog = screen.getByRole("dialog", { name: "Delete email?" })
    expect(dialog).toHaveAccessibleDescription("This can't be undone.")
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("loading keeps it open and disables Cancel", () => {
    const onClose = vi.fn()
    wrap(
      <ConfirmDialog
        open
        onClose={onClose}
        onConfirm={() => {}}
        title="Revoke token?"
        confirmLabel="Revoke"
        loading
      />,
    )
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" })
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
