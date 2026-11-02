import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  Button,
  Checkbox,
  Chip,
  IconButton,
  TextField,
  ThemeProvider,
  ToggleButton,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import type { Theme } from "@mui/material"
import { mainTheme } from "../mainTheme"
import { lightTheme } from "../lightTheme"
import { CUSTOM_THEMES } from "../../custom_themes"
import {
  AA_TEXT,
  AA_UI,
  ACCENT_FILLS,
  ON_ACCENT_DARK,
  accentFill,
  contrast,
  disabledButton,
  flatten,
  selectedToggle,
  surfaces,
} from "../contrast"

const themes: [string, Theme][] = [
  ["main", mainTheme],
  ["light", lightTheme],
  ...CUSTOM_THEMES.entries(),
]

describe.each(themes)("%s theme contrast", (_name, theme) => {
  const { paper, page } = surfaces(theme)

  it("palette disabled colours meet their floors", () => {
    const { action, text } = theme.palette
    for (const bg of [paper, page]) {
      // IconButton, Checkbox, input outlines
      expect(
        contrast(flatten(action.disabled, paper), bg),
      ).toBeGreaterThanOrEqual(AA_UI)
      // disabled TextField value and label
      expect(
        contrast(flatten(text.disabled, paper), bg),
      ).toBeGreaterThanOrEqual(AA_TEXT)
    }
  })

  it("derives the action palette for its own mode", () => {
    const ink = theme.palette.mode === "dark" ? "255, 255, 255" : "0, 0, 0"
    const { action } = theme.palette
    expect(action.disabledBackground).toBe(`rgba(${ink}, 0.12)`)
    expect(action.focus).toBe(`rgba(${ink}, 0.12)`)
    expect(action.selected).toBe(
      `rgba(${ink}, ${theme.palette.mode === "dark" ? 0.16 : 0.08})`,
    )
    expect(action.active).toBe(
      theme.palette.mode === "dark" ? "#fff" : "rgba(0, 0, 0, 0.54)",
    )
  })

  it("disabled IconButton, Checkbox and TextField use the floored colours", () => {
    render(
      <ThemeProvider theme={theme}>
        <IconButton disabled aria-label="remove">
          <DeleteIcon />
        </IconButton>
        <Checkbox disabled inputProps={{ "aria-label": "agree" }} />
        <TextField disabled label="Name" defaultValue="Ada" />
      </ThemeProvider>,
    )
    const { action, text } = theme.palette
    const css = (el: Element) => getComputedStyle(el)
    expect(css(screen.getByRole("button", { name: "remove" })).color).toBe(
      action.disabled,
    )
    expect(
      css(screen.getByRole("checkbox", { name: "agree" }).parentElement!).color,
    ).toBe(action.disabled)
    const input = screen.getByRole("textbox", { name: "Name" })
    // InputBase root carries the colour; the <input> inherits it
    expect(css(input.parentElement!).color).toBe(text.disabled)
    expect(css(screen.getByText("Name", { selector: "label" })).color).toBe(
      text.disabled,
    )
    const outline = input.parentElement!.querySelector(
      ".MuiOutlinedInput-notchedOutline",
    )!
    expect(css(outline).borderColor).toBe(action.disabled)
  })

  it("disabled buttons read at AA", () => {
    const d = disabledButton(theme, "all")
    for (const bg of [paper, page, d.fill]) {
      expect(contrast(d.text, bg)).toBeGreaterThanOrEqual(AA_TEXT)
    }
    for (const bg of [paper, page]) {
      expect(contrast(d.border, bg)).toBeGreaterThanOrEqual(AA_UI)
    }
  })

  it.each(ACCENT_FILLS)("%s fills keep AA text, hover included", (color) => {
    const a = accentFill(theme, color)
    expect(contrast(a.text, a.fill)).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrast(a.text, flatten(a.hover, paper))).toBeGreaterThanOrEqual(
      AA_TEXT,
    )
    expect(contrast(a.deleteIcon, a.fill)).toBeGreaterThanOrEqual(AA_UI)
  })

  it.each(["standard", "primary", "secondary"])(
    "selected %s ToggleButton has an AA label and a 3:1 ring",
    (color) => {
      const s = selectedToggle(theme, color)
      expect(contrast(s.text, s.fill)).toBeGreaterThanOrEqual(AA_TEXT)
      expect(contrast(s.text, s.hover)).toBeGreaterThanOrEqual(AA_TEXT)
      expect(contrast(s.ring, paper)).toBeGreaterThanOrEqual(AA_UI)
      expect(contrast(s.ring, page)).toBeGreaterThanOrEqual(AA_UI)
    },
  )
})

describe("main theme", () => {
  it.each(ACCENT_FILLS)("%s fills take dark text", (color) => {
    expect(accentFill(mainTheme, color).text).toBe(ON_ACCENT_DARK)
  })

  it("applies the overrides to rendered components", () => {
    render(
      <ThemeProvider theme={mainTheme}>
        <Button variant="contained" color="error">
          Delete
        </Button>
        <Button variant="contained" disabled>
          Save
        </Button>
        <Chip color="warning" label="Pending" />
        <ToggleButton value="a" selected>
          Grid
        </ToggleButton>
      </ThemeProvider>,
    )
    const css = (el: HTMLElement) => getComputedStyle(el)
    expect(css(screen.getByRole("button", { name: "Delete" })).color).toBe(
      ON_ACCENT_DARK,
    )
    expect(css(screen.getByRole("button", { name: "Save" })).color).toBe(
      disabledButton(mainTheme, "all").text,
    )
    expect(css(screen.getByText("Pending").parentElement!).color).toBe(
      ON_ACCENT_DARK,
    )
    expect(
      css(screen.getByRole("button", { name: "Grid" })).boxShadow,
    ).toContain(selectedToggle(mainTheme, "standard").ring)
  })
})
