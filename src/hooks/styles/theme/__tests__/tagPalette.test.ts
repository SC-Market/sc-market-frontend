import { describe, expect, it } from "vitest"
import type { Theme } from "@mui/material"
import { mainTheme, mainThemeOptions } from "../mainTheme"
import { lightTheme, lightThemeOptions } from "../lightTheme"
import { themeBase } from "../baseTheme"
import { createAppTheme } from "../createAppTheme"
import { CUSTOM_THEMES } from "../../custom_themes"
import { AA_TEXT, AA_UI, contrast, surfaces } from "../contrast"
import { TAG_HUES, TAG_TONES } from "../tagPalette"

const themes: [string, Theme][] = [
  ["main", mainTheme],
  ["light", lightTheme],
  ...CUSTOM_THEMES.entries(),
]

describe.each(themes)("%s theme tag palette", (_name, theme) => {
  const { paper, page } = surfaces(theme)

  it.each(TAG_TONES)("%s passes AA", (tone) => {
    const c = theme.palette.tag[tone]
    // Text on its own tint (resting and hover) and on the surfaces around it
    for (const bg of [c.tint, c.hover, paper, page]) {
      expect(contrast(c.text, bg)).toBeGreaterThanOrEqual(AA_TEXT)
    }
    // The 1px border against the surfaces the chip sits on
    for (const bg of [paper, page]) {
      expect(contrast(c.border, bg)).toBeGreaterThanOrEqual(AA_UI)
    }
  })

  it("keeps the eight hues distinct", () => {
    const texts = TAG_HUES.map((h) => theme.palette.tag[h].text)
    const tints = TAG_HUES.map((h) => theme.palette.tag[h].tint)
    expect(new Set(texts).size).toBe(TAG_HUES.length)
    expect(new Set(tints).size).toBe(TAG_HUES.length)
  })
})

describe("tag palette on surfaces the contrast maths can't read", () => {
  it.each([
    ["dark", [themeBase, mainThemeOptions]],
    ["light", [themeBase, mainThemeOptions, lightThemeOptions]],
  ] as const)(
    "%s: derives against the base surfaces and still passes",
    (_mode, layers) => {
      const theme = createAppTheme(...layers, {
        palette: {
          background: { paper: "linear-gradient(#000, #111)" },
        },
      })
      const base = _mode === "dark" ? mainTheme : lightTheme
      for (const tone of TAG_TONES) {
        expect(theme.palette.tag[tone]).toEqual(base.palette.tag[tone])
      }
    },
  )
})
