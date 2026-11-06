import "../../../util/i18n"
import React, { useState } from "react"
import { render, screen, within, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import { Fab } from "@mui/material"
import {
  FloatingAction,
  FloatingActions,
  FloatingActionsSlotContext,
} from "../FloatingActions"
import { DebugPanel } from "../../market/v2/DebugPanel"
import { PreferencesButton } from "../../../views/settings/PreferencesButton"
import * as useFeatureFlagModule from "../../../hooks/market/useFeatureFlag"

vi.mock("../../../hooks/market/useFeatureFlag")
vi.mock("../../settings/PreferencesControls", () => ({
  PreferencesControls: () => null,
}))

const mockUseFeatureFlag = vi.mocked(useFeatureFlagModule.useFeatureFlag)

function flags(isDeveloper: boolean) {
  return {
    isLoading: false,
    error: null,
    isDeveloper,
    hasOverride: false,
    flags: { customizable_dashboard: false },
    overriddenFlags: [] as string[],
    setFlag: vi.fn().mockResolvedValue(undefined),
  }
}

/** Mirrors Root's MainContent: app-wide buttons plus a page's own FAB. */
function Shell(props: {
  page?: React.ReactNode
  onHeightChange?: (height: number) => void
}) {
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  return (
    <ThemeProvider theme={mainTheme}>
      <FloatingActionsSlotContext.Provider value={slot}>
        {props.page}
      </FloatingActionsSlotContext.Provider>
      <FloatingActions
        slotRef={setSlot}
        onHeightChange={props.onHeightChange ?? (() => {})}
      >
        <DebugPanel />
        <PreferencesButton />
      </FloatingActions>
    </ThemeProvider>
  )
}

/** The position styles a button carries itself. */
function positionStyles(el: HTMLElement) {
  const style = window.getComputedStyle(el)
  return {
    position: style.position,
    top: style.top,
    right: style.right,
    bottom: style.bottom,
    left: style.left,
  }
}

type PositionStyles = ReturnType<typeof positionStyles>
const isPinned = (s: PositionStyles) =>
  s.position === "absolute" || s.position === "fixed"
const sameOffsets = (a: PositionStyles, b: PositionStyles) =>
  a.top === b.top &&
  a.right === b.right &&
  a.bottom === b.bottom &&
  a.left === b.left

describe("FloatingActions", () => {
  beforeEach(() => {
    localStorage.clear()
    mockUseFeatureFlag.mockReturnValue(flags(true))
  })

  it("stacks page settings and the debug toggle in one container", () => {
    render(<Shell />)
    const area = screen.getByTestId("floating-actions")
    const settings = within(area).getByRole("button", {
      name: "Page settings",
    })
    const debug = within(area).getByRole("button", {
      name: "Open debug panel",
    })

    // Only the container is positioned; the buttons are items of its column,
    // so they can't be pinned to the same corner coordinates.
    expect(window.getComputedStyle(area).position).toBe("absolute")
    const a = positionStyles(settings)
    const b = positionStyles(debug)
    expect(isPinned(a)).toBe(false)
    expect(isPinned(b)).toBe(false)
    // The bug: both pinned with the same right/bottom offsets
    expect(isPinned(a) && isPinned(b) && sameOffsets(a, b)).toBe(false)
    // Debug toggle above page settings
    expect(
      debug.compareDocumentPosition(settings) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it("gives the two gear-corner buttons distinct accessible names", () => {
    render(<Shell />)
    const area = screen.getByTestId("floating-actions")
    const names = within(area)
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label"))
    expect(new Set(names).size).toBe(names.length)
  })

  it("leaves the debug toggle out for non-admins", () => {
    mockUseFeatureFlag.mockReturnValue(flags(false))
    render(<Shell />)
    const area = screen.getByTestId("floating-actions")
    expect(
      within(area).getByRole("button", { name: "Page settings" }),
    ).toBeInTheDocument()
    expect(
      within(area).queryByRole("button", { name: "Open debug panel" }),
    ).not.toBeInTheDocument()
  })

  it("puts a page's own FAB into the same stack, below the app buttons", async () => {
    render(
      <Shell
        page={
          <FloatingAction>
            <Fab aria-label="Filters">x</Fab>
          </FloatingAction>
        }
      />,
    )
    const area = screen.getByTestId("floating-actions")
    const filters = await waitFor(() =>
      within(area).getByRole("button", { name: "Filters" }),
    )
    expect(isPinned(positionStyles(filters))).toBe(false)
    const settings = within(area).getByRole("button", {
      name: "Page settings",
    })
    expect(
      settings.compareDocumentPosition(filters) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it("reports its height so the page can reserve room for it", () => {
    const onHeightChange = vi.fn()
    render(<Shell onHeightChange={onHeightChange} />)
    expect(onHeightChange).toHaveBeenCalled()
  })
})
