import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AlertInterface } from "../../../datatypes/Alert"

const h = vi.hoisted(() => ({ bottomNavHeight: 64 }))
vi.mock("../../../hooks/layout/useBottomNavHeight", () => ({
  useBottomNavHeight: () => h.bottomNavHeight,
}))

import {
  ALERT_AUTO_HIDE_MS,
  AlertSnackbar,
  alertBottomOffset,
} from "../AlertSnackbar"

function Harness(props: { initial: AlertInterface | null }) {
  const [alert, setAlert] = React.useState(props.initial)
  return (
    <>
      <button onClick={() => setAlert(null)}>reset</button>
      <button
        onClick={() => setAlert({ severity: "success", message: "Again" })}
      >
        again
      </button>
      <AlertSnackbar alert={alert} onClose={() => setAlert(null)} />
    </>
  )
}

describe("AlertSnackbar", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    h.bottomNavHeight = 64
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("lets clicks through around the alert; only the alert takes them", () => {
    render(<Harness initial={{ severity: "success", message: "Watching" }} />)
    const root = screen.getByTestId("alert-snackbar")
    const alert = screen.getByRole("alert")
    expect(getComputedStyle(root).pointerEvents).toBe("none")
    expect(getComputedStyle(alert).pointerEvents).toBe("auto")
  })

  it("sits bottom-center, above the bottom nav and the safe area", () => {
    render(<Harness initial={{ severity: "success", message: "Watching" }} />)
    const root = screen.getByTestId("alert-snackbar")
    expect(root.className).toMatch(/anchorOriginBottomCenter/)
    // jsdom's CSSOM drops env(), so check the offset the root is given.
    // Phones: the 64px bottom nav + 8px, plus the safe area.
    expect(alertBottomOffset(64)).toEqual({
      xs: "calc(72px + env(safe-area-inset-bottom))",
      sm: "calc(24px + env(safe-area-inset-bottom))",
    })
    // Keyboard open (no bottom nav): just the gap and the safe area.
    expect(alertBottomOffset(0).xs).toBe(
      "calc(8px + env(safe-area-inset-bottom))",
    )
  })

  it("closes a success message by itself", () => {
    render(<Harness initial={{ severity: "success", message: "Watching" }} />)
    expect(screen.getByText("Watching")).toBeTruthy()
    act(() => {
      vi.advanceTimersByTime(ALERT_AUTO_HIDE_MS + 1000)
    })
    expect(screen.queryByText("Watching")).toBeNull()
  })

  it("keeps an error until it is dismissed, even on a click elsewhere", () => {
    render(<Harness initial={{ severity: "error", message: "Failed" }} />)
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    fireEvent.mouseDown(document.body)
    fireEvent.click(document.body)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText("Failed")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: /close/i }))
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.queryByText("Failed")).toBeNull()
  })

  it("restarts the timer for a new message", () => {
    render(<Harness initial={{ severity: "success", message: "First" }} />)
    act(() => {
      vi.advanceTimersByTime(ALERT_AUTO_HIDE_MS - 1000)
    })
    fireEvent.click(screen.getByText("again"))
    act(() => {
      vi.advanceTimersByTime(ALERT_AUTO_HIDE_MS - 1000)
    })
    expect(screen.getByText("Again")).toBeTruthy()
  })
})
