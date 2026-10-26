import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { describe, expect, it, vi } from "vitest"
import { mainTheme, type ExtendedTheme } from "../../../hooks/styles/Theme"
import { LandingFeatures } from "../LandingFeatures"
import { MIN_FEATURE_TILE_WIDTH, featureTileGrid } from "../featureTileGrid"

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next")
  return { ...actual, useTranslation: () => ({ t: (key: string) => key }) }
})

const theme = mainTheme as ExtendedTheme

/** All CSS text emotion injected into the document. */
function injectedCss(): string {
  return [...document.querySelectorAll("style")]
    .map((s) => {
      const sheet = s.sheet as CSSStyleSheet | null
      const rules = sheet ? [...sheet.cssRules].map((r) => r.cssText).join("\n") : ""
      return rules || s.textContent || ""
    })
    .join("\n")
}

// Regression: at a ~900px window with the sidebar open the feature section is
// ~530px wide, but the md (viewport) breakpoint still put the blocks two per
// row, so each 16:9 tile was only ~250px wide.
describe("LandingFeatures tile layout", () => {
  const gap = parseFloat(theme.spacing(theme.layoutSpacing.layout * 4))
  const twoUpAt = MIN_FEATURE_TILE_WIDTH * 2 + gap

  it("goes two per row only when the section fits two 360px tiles", () => {
    expect(MIN_FEATURE_TILE_WIDTH).toBe(360)
    const { container, grid } = featureTileGrid(theme)
    expect(container).toEqual({ containerType: "inline-size" })
    expect(grid).toMatchObject({
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr)",
      [`@container (min-width: ${twoUpAt}px)`]: {
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      },
    })
  })

  it("renders the blocks one per row by default, keyed to the container width", () => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <LandingFeatures />
        </MemoryRouter>
      </ThemeProvider>,
    )
    const tiles = screen.getByTestId("landing-feature-tiles")
    expect(getComputedStyle(tiles).display).toBe("grid")
    expect(getComputedStyle(tiles.parentElement!).getPropertyValue("container-type")).toBe("inline-size")
    expect(tiles.children).toHaveLength(4)
    const css = injectedCss()
    expect(css).toContain(`@container (min-width: ${twoUpAt}px)`)
    // No viewport media query decides the tile columns any more.
    expect(css).not.toMatch(/@media[^{]*\{[^}]*grid-template-columns/)
  })
})
