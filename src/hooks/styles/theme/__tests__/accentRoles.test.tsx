import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { Button, Chip, Link, ThemeProvider } from "@mui/material"
import type { Theme } from "@mui/material"
import { mainTheme } from "../mainTheme"
import { lightTheme } from "../lightTheme"
import { CUSTOM_THEMES } from "../../custom_themes"
import { AA_TEXT, AA_UI, contrast, flatten, surfaces } from "../contrast"

// Green-only accent (2026-11): one accent (primary), a neutral for
// secondary-role controls, and `secondary` for the buy side and premium.

const themes: [string, Theme][] = [
  ["main", mainTheme],
  ["light", lightTheme],
  ...CUSTOM_THEMES.entries(),
]

const worst = (theme: Theme, color: string) => {
  const { paper, page } = surfaces(theme)
  const solid = flatten(color, paper)
  return Math.min(contrast(solid, paper), contrast(solid, page))
}

describe("main theme accent roles", () => {
  const { palette } = mainTheme

  it("the accent is green and reads at AA on paper and the page", () => {
    expect(palette.primary.main).toBe("#10b881")
    expect(worst(mainTheme, palette.primary.main)).toBeGreaterThanOrEqual(
      AA_TEXT,
    )
  })

  it("secondary (the buy side and premium) is the violet and reads at AA on paper and the page", () => {
    expect(palette.secondary.main).toBe("#7a7efe")
    expect(worst(mainTheme, palette.secondary.main)).toBeGreaterThanOrEqual(
      AA_TEXT,
    )
  })

  it("the light theme's secondary is the deeper violet", () => {
    expect(lightTheme.palette.secondary.main).toBe("#4e36f5")
  })

  it("the focus ring is the accent", () => {
    expect(palette.common.focus).toBe(palette.primary.main)
  })
})

describe.each(themes)("%s theme accent roles", (_name, theme) => {
  const { palette } = theme

  it("secondary (the buy side and premium) reads at AA on paper and the page", () => {
    expect(worst(theme, palette.secondary.main)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it("neutral text reads at AA on paper and the page", () => {
    expect(worst(theme, palette.neutral.main)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it("neutral is the base neutral, not the buy-side colour", () => {
    const base = palette.mode === "light" ? lightTheme : mainTheme
    expect(palette.neutral.main).toBe(base.palette.neutral.main)
    expect(palette.neutral.main).not.toBe(palette.secondary.main)
  })

  it("the focus ring is at least 3:1 on paper and the page", () => {
    expect(worst(theme, palette.common.focus)).toBeGreaterThanOrEqual(AA_UI)
  })

  it("the strong control border is at least 3:1 on paper and the page", () => {
    expect(worst(theme, palette.outline.strong)).toBeGreaterThanOrEqual(AA_UI)
  })

  it("defines the focus ring variable from its own focus colour", () => {
    const overrides = theme.components?.MuiCssBaseline?.styleOverrides as
      | Record<string, Record<string, string>>
      | undefined
    expect(overrides?.[":root"]["--mui-palette-common-focus"]).toBe(
      palette.common.focus,
    )
  })
})

describe("neutral controls", () => {
  it("outlined neutral buttons and default outlined chips use the neutral text and the strong border", () => {
    render(
      <ThemeProvider theme={mainTheme}>
        <Button variant="outlined" color="neutral">
          See all
        </Button>
        <Chip variant="outlined" label="New" />
      </ThemeProvider>,
    )
    const { neutral, outline } = mainTheme.palette
    const button = getComputedStyle(
      screen.getByRole("button", { name: "See all" }),
    )
    expect(button.color).toBe(neutral.main)
    expect(button.borderColor).toBe(outline.strong)
    const chip = getComputedStyle(screen.getByText("New").parentElement!)
    expect(chip.color).toBe(neutral.main)
    expect(chip.borderColor).toBe(outline.strong)
  })
})

describe("light theme links", () => {
  it("use the accent text role, AA on white", () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <Link href="#guide">Guide</Link>
      </ThemeProvider>,
    )
    const color = getComputedStyle(screen.getByText("Guide")).color
    expect(color).toBe(lightTheme.palette.text.accent)
    expect(worst(lightTheme, color)).toBeGreaterThanOrEqual(AA_TEXT)
  })
})
