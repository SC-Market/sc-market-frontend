/**
 * The phone nav drawer must never leave an invisible modal root over the
 * page. On a prerendered page the drawer state is seeded open by the desktop
 * hydration render and closed right after, in the drawer's first commit:
 * a plain MUI Drawer then keeps its root visible (Modal `exited` never turns
 * true) and swallows every tap and scroll on the page.
 */
import React, { useEffect, useState } from "react"
import { describe, it, expect } from "vitest"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { MobileNavDrawer } from "../MobileNavDrawer"

/** Drawer state seeded open, then closed in the first effect (hydration re-seed). */
function Harness({ keepMounted }: { keepMounted: boolean }) {
  const [open, setOpen] = useState(true)
  useEffect(() => setOpen(false), [])
  return (
    <ThemeProvider theme={createTheme()}>
      <button onClick={() => setOpen(true)}>menu</button>
      <MobileNavDrawer open={open} onClose={() => setOpen(false)} keepMounted={keepMounted} width={280}>
        <a href="/market">Market link</a>
      </MobileNavDrawer>
    </ThemeProvider>
  )
}

const settle = () => act(() => new Promise((r) => setTimeout(r, 600)))
const modalRoot = () => document.querySelector<HTMLElement>(".MuiDrawer-modal")

describe("MobileNavDrawer", () => {
  it("kept mounted: the closed drawer's root is hidden and takes no pointer events", async () => {
    render(<Harness keepMounted />)
    await settle()
    const root = modalRoot()
    expect(root).not.toBeNull()
    expect(getComputedStyle(root!).visibility).toBe("hidden")
    expect(getComputedStyle(root!).pointerEvents).toBe("none")
  })

  it("not kept mounted: the closed drawer leaves nothing over the page", async () => {
    render(<Harness keepMounted={false} />)
    await settle()
    expect(modalRoot()).toBeNull()
  })

  it("still opens and closes", async () => {
    render(<Harness keepMounted />)
    await settle()
    await userEvent.click(screen.getByText("menu"))
    await settle()
    expect(getComputedStyle(modalRoot()!).visibility).not.toBe("hidden")
    expect(getComputedStyle(modalRoot()!).pointerEvents).not.toBe("none")
    expect(screen.getByText("Market link")).toBeVisible()
    await userEvent.keyboard("{Escape}")
    await settle()
    expect(getComputedStyle(modalRoot()!).visibility).toBe("hidden")
  })
})
