/**
 * Theme editor guardrails: live WCAG AA badges per colour pair, an auto-fix
 * that writes the nearest passing colour, and a warning (not a block)
 * before saving a failing theme. Fixture: MEDRUNNER's saved dark theme,
 * whose grey heading/emphasis text is 3.0:1 on its page.
 */
import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { ThemeContrastPanel } from "../ThemeContrastPanel"
import {
  failingContrastChecks,
  formatRatio,
  themeContrastChecks,
} from "../contrastChecks"
import { AA_TEXT, contrast } from "../../../hooks/styles/theme/contrast"

vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))

import { ThemeEditor } from "../ThemeEditor"

const dark = () => ({
  palette: {
    text: { primary: "#ffffff", secondary: "#6a7282" },
    action: { hover: "#2c5278e6" },
    outline: { main: "#364153" },
    primary: { dark: "#2c5278e6", main: "#2c5278", contrastText: "#ffffff" },
    secondary: { main: "#9ebedb" },
    background: {
      paper: "#1d2735",
      navbar: "#1d2735",
      default: "#1e2939",
      sidebar: "#1d2735",
    },
  },
})

const row = (key: string) => screen.getByTestId(`contrast-${key}`)

describe("ThemeContrastPanel", () => {
  it("badges each pair pass or fail, and marks derived ones Auto", () => {
    render(
      <ThemeContrastPanel modeData={dark()} mode="dark" onChange={vi.fn()} />,
    )
    const heading = within(row("headingText"))
    expect(heading.getByText("Fails AA")).toBeInTheDocument()
    expect(heading.getByText(/3\.03:1/)).toBeInTheDocument()

    // Primary as text was 1.8:1; the derived accent passes
    const accent = within(row("accentText"))
    expect(accent.getByText("Passes AA")).toBeInTheDocument()
    expect(accent.getByText(/Auto/)).toBeInTheDocument()
    expect(accent.queryByRole("button")).toBeNull()

    expect(within(row("focus")).getByText("Passes AA")).toBeInTheDocument()
    expect(
      within(row("controlBorder")).getByText("Passes AA"),
    ).toBeInTheDocument()

    // Selected and disabled state, derived (hooks/styles/theme/roles.ts)
    for (const key of ["selectedText", "selectedVsHover"]) {
      expect(within(row(key)).getByText("Passes AA")).toBeInTheDocument()
      expect(within(row(key)).getByText(/Auto/)).toBeInTheDocument()
    }
    // Disabled text is judged on legibility, not AA
    const disabled = within(row("disabledText"))
    expect(disabled.getByText("Legible")).toBeInTheDocument()
    expect(disabled.getByText(/Disabled 3:1/)).toBeInTheDocument()
  })

  it("raises a saved disabled colour too faint to read to 3:1", () => {
    // Every built theme floors text.disabled at 3:1 (applyContrastFloors),
    // so a saved value under it renders, and passes, at the floor
    const data = dark() as ReturnType<typeof dark> & {
      palette: { text: { disabled?: string } }
    }
    data.palette.text.disabled = "#2a3445"
    const check = themeContrastChecks(data, "dark").find(
      (c) => c.key === "disabledText",
    )!
    expect(check.auto).toBe(false)
    expect(check.pass).toBe(true)
    expect(check.ratio).toBeGreaterThanOrEqual(3)
  })

  it("auto-fix writes the nearest passing colour to the token", () => {
    const onChange = vi.fn()
    render(
      <ThemeContrastPanel modeData={dark()} mode="dark" onChange={onChange} />,
    )
    fireEvent.click(
      within(row("headingText")).getByRole("button", { name: /Auto-fix/ }),
    )
    expect(onChange).toHaveBeenCalledTimes(1)
    const [path, value] = onChange.mock.calls[0]
    expect(path).toEqual(["palette", "text", "secondary"])
    expect(contrast(value, "#1e2939")).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrast(value, "#1d2735")).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it("passes once the fix is applied", () => {
    const data = dark()
    const fix = themeContrastChecks(data, "dark").find(
      (c) => c.key === "headingText",
    )!.fix!
    data.palette.text.secondary = fix
    expect(themeContrastChecks(data, "dark").every((c) => c.pass)).toBe(true)
  })

  it("rounds ratios down, so a near miss never reads as a pass", () => {
    expect(formatRatio(4.499)).toBe("4.49")
    expect(formatRatio(3)).toBe("3.00")
  })
})

describe("ThemeEditor save", () => {
  it("warns about failing pairs, then saves anyway on request", async () => {
    const onSave = vi.fn(() => Promise.resolve())
    const themeData = { dark: dark(), light: {} }
    expect(failingContrastChecks(themeData).map((f) => f.check.key)).toEqual([
      "headingText",
    ])
    render(
      <ThemeEditor
        initialThemeData={themeData}
        initialFaviconUrl={null}
        onSave={onSave}
        onReset={() => Promise.resolve()}
      />,
    )
    fireEvent.click(screen.getByRole("button", { name: /Save Theme/ }))
    const dialog = await screen.findByRole("dialog")
    expect(
      within(dialog).getByText(/Headings & emphasis text/),
    ).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
    fireEvent.click(within(dialog).getByRole("button", { name: "Save anyway" }))
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it("saves straight away when every pair passes", () => {
    const onSave = vi.fn(() => Promise.resolve())
    const passing = dark()
    passing.palette.text.secondary = "#99a1af"
    render(
      <ThemeEditor
        initialThemeData={{ dark: passing, light: {} }}
        initialFaviconUrl={null}
        onSave={onSave}
        onReset={() => Promise.resolve()}
      />,
    )
    fireEvent.click(screen.getByRole("button", { name: /Save Theme/ }))
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})
