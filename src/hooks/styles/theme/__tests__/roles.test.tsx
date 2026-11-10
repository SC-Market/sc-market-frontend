/**
 * Role tokens (../roles.ts): one colour per job, derived to pass WCAG AA
 * when a theme leaves it out. The fixture is MEDRUNNER's saved white-label
 * theme (GET /api/contractors/MEDRUNNER/theme, 2026-11-09): a navy brand
 * colour that reads on a white button label (8.1:1) but not as text on its
 * own dark page (1.8:1).
 */
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  Button,
  Chip,
  Link,
  ListItemButton,
  MenuItem,
  Tab,
  Tabs,
  ThemeProvider,
  type Theme,
} from "@mui/material"
import { buildOrgTheme } from "../../themeCache"
import { themeContrastChecks } from "../../../../components/theme-editor/contrastChecks"
import { mainTheme } from "../mainTheme"
import { lightTheme } from "../lightTheme"
import {
  AA_TEXT,
  AA_UI,
  contrast,
  flatten,
  nudgeToContrast,
  surfaces,
  toHex,
  worst,
} from "../contrast"
import { primaryFill, primaryFillHover } from "../roles"

const MEDRUNNER = {
  dark: {
    navKind: "elevation",
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
  },
  light: {
    navKind: "elevation",
    palette: {
      text: { primary: "#101828", secondary: "#6a7282" },
      action: { hover: "#263d55e6" },
      outline: { main: "#e5e7eb" },
      primary: { dark: "#2c5278e6", main: "#263d55", contrastText: "#ffffff" },
      secondary: { main: "#263d55" },
      background: {
        paper: "#ffffff",
        navbar: "#ffffff",
        default: "#ffffff",
        sidebar: "#ffffff",
      },
    },
  },
}

const fixture = () => structuredClone(MEDRUNNER) as never

/** The lowest ratio of `color` on the theme's Paper and page. */
function onSurfaces(theme: Theme, color: string) {
  const { paper, page } = surfaces(theme)
  return worst(flatten(color, paper), [paper, page])
}

describe("nudgeToContrast", () => {
  it("returns a passing colour unchanged", () => {
    expect(nudgeToContrast("#ffffff", ["#1e2939"], AA_TEXT)).toBe("#ffffff")
  })

  it("moves a failing colour just far enough to pass", () => {
    const bgs = ["#1d2735", "#1e2939"]
    const fixed = nudgeToContrast("#2c5278", bgs, AA_TEXT)
    expect(worst(fixed, bgs)).toBeGreaterThanOrEqual(AA_TEXT)
    // The nearest passing step: well short of white
    expect(worst(fixed, bgs)).toBeLessThan(AA_TEXT + 0.3)
    expect(fixed).toMatch(/^#[0-9a-f]{6}$/)
  })

  it("darkens on light backgrounds", () => {
    const fixed = nudgeToContrast("#10b881", ["#ffffff"], AA_TEXT)
    expect(contrast(fixed, "#ffffff")).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrast(fixed, "#000000")).toBeLessThan(
      contrast("#10b881", "#000000"),
    )
  })

  it("judges a translucent colour as painted on the first background", () => {
    const fixed = nudgeToContrast("#2c5278e6", ["#1d2735"], AA_UI)
    expect(contrast(fixed, "#1d2735")).toBeGreaterThanOrEqual(AA_UI)
  })

  it("toHex drops alpha and pads", () => {
    expect(toHex("rgb(1, 2, 3)")).toBe("#010203")
  })
})

describe.each(["dark", "light"] as const)(
  "MEDRUNNER's saved theme, %s mode: derived roles pass AA",
  (mode) => {
    const theme = buildOrgTheme(fixture(), mode)
    const saved = MEDRUNNER[mode].palette

    it("keeps the brand colour as the button fill", () => {
      expect(primaryFill(theme)).toBe(saved.primary.main)
    })

    it("accent text and links reach 4.5:1 on Paper and the page", () => {
      expect(onSurfaces(theme, theme.palette.text.accent)).toBeGreaterThan(
        AA_TEXT,
      )
      // Everything that paints primary.main as text now gets the accent
      expect(theme.palette.primary.main).toBe(theme.palette.text.accent)
    })

    it("the focus ring reaches 3:1", () => {
      expect(onSurfaces(theme, theme.palette.common.focus)).toBeGreaterThan(
        AA_UI,
      )
    })

    it("control borders reach 3:1", () => {
      expect(onSurfaces(theme, theme.palette.outline.strong)).toBeGreaterThan(
        AA_UI,
      )
    })

    it("button text reaches 4.5:1 on the fill and its hover", () => {
      const { paper } = surfaces(theme)
      const text = theme.palette.primary.contrastText
      expect(
        contrast(text, flatten(primaryFill(theme), paper)),
      ).toBeGreaterThanOrEqual(AA_TEXT)
      expect(
        contrast(text, flatten(primaryFillHover(theme), paper)),
      ).toBeGreaterThanOrEqual(AA_TEXT)
    })

    it("keeps the colours the org set", () => {
      expect(theme.palette.text.secondary).toBe(saved.text.secondary)
      expect(theme.palette.text.primary).toBe(saved.text.primary)
      expect(theme.palette.primary.contrastText).toBe("#ffffff")
    })
  },
)

describe("MEDRUNNER dark, rendered", () => {
  const theme = buildOrgTheme(fixture(), "dark")

  it("a contained button paints the brand fill, a text button the accent", () => {
    render(
      <ThemeProvider theme={theme}>
        <Button variant="contained">Shop</Button>
        <Button>All reviews</Button>
        <Link href="#c">Contractors</Link>
      </ThemeProvider>,
    )
    const filled = getComputedStyle(screen.getByText("Shop"))
    expect(filled.backgroundColor).toBe("#2c5278")
    expect(filled.color).toBe("#ffffff")
    const text = getComputedStyle(screen.getByText("All reviews")).color
    expect(text).toBe(theme.palette.text.accent)
    expect(onSurfaces(theme, text)).toBeGreaterThan(AA_TEXT)
    const link = getComputedStyle(screen.getByText("Contractors")).color
    expect(link).toBe(theme.palette.text.accent)
  })
})

describe("explicit role tokens", () => {
  it("are used as saved, even when they fail", () => {
    const data = fixture() as typeof MEDRUNNER
    const dark = data.dark.palette as Record<string, Record<string, string>>
    dark.text.accent = "#2c5278"
    dark.common = { focus: "#364153" }
    dark.outline.strong = "#364153"
    const theme = buildOrgTheme(data as never, "dark")
    expect(theme.palette.text.accent).toBe("#2c5278")
    expect(theme.palette.common.focus).toBe("#364153")
    expect(theme.palette.outline.strong).toBe("#364153")
  })
})

describe("the site themes", () => {
  it("keep their accent where it already passes (fill = text)", () => {
    expect(mainTheme.palette.primary.main).toBe("#10b881")
    expect(primaryFill(mainTheme)).toBe("#10b881")
    expect(mainTheme.palette.common.focus).toBe("#10b881")
    expect(mainTheme.palette.outline.strong).toBe("#58677e")
  })
})

describe("buildOrgTheme", () => {
  it("builds from the API's frozen answer without mutating it", () => {
    // RTK Query freezes responses; assigning `divider` into it threw, so a
    // first visit kept the site theme until a reload.
    const deepFreeze = <T,>(o: T): T => {
      Object.values(o as object).forEach(
        (v) => v && typeof v === "object" && deepFreeze(v),
      )
      return Object.freeze(o)
    }
    const data = deepFreeze(fixture() as typeof MEDRUNNER)
    const theme = buildOrgTheme(data as never, "dark")
    expect(primaryFill(theme)).toBe("#2c5278")
    expect(theme.palette.divider).toBe("#364153")
    expect("divider" in data.dark.palette).toBe(false)
  })
})

/**
 * Selected and disabled state tokens (../roles.ts): action.selected (the
 * tint), text.selected (label and indicator) and text.disabled, derived
 * from the org's other colours when it leaves them out. Run on MEDRUNNER as
 * saved, and as the owner's brief describes it (brighter heading grey, a
 * faint light-mode hover), which changes which rule tells selected from
 * hover in light mode.
 */
const MEDRUNNER_BRIEF = (() => {
  const data = structuredClone(MEDRUNNER)
  data.dark.palette.text.secondary = "#99a1af"
  data.light.palette.action.hover = "#263d5514"
  return data
})()

const DERIVED = {
  dark: {
    selected: "rgba(122, 146, 170, 0.2)",
    text: "#96a9bc",
    disabled: "#6c737c",
  },
  light: {
    selected: "rgba(38, 61, 85, 0.12)",
    text: "#263d55",
    disabled: "#929599",
  },
}

describe.each([
  ["as saved", MEDRUNNER],
  ["as briefed", MEDRUNNER_BRIEF],
] as const)("MEDRUNNER %s: selected and disabled tokens", (_label, data) => {
  describe.each(["dark", "light"] as const)("%s mode", (mode) => {
    const theme = buildOrgTheme(structuredClone(data) as never, mode)
    const { paper, page } = surfaces(theme)
    const { action, text } = theme.palette
    const fills = [
      flatten(action.selected, paper),
      flatten(action.selected, page),
    ]
    const hovers = [flatten(action.hover, paper), flatten(action.hover, page)]

    it("derives the documented values", () => {
      expect(action.selected).toBe(DERIVED[mode].selected)
      expect(text.selected).toBe(DERIVED[mode].text)
      expect(text.disabled).toBe(DERIVED[mode].disabled)
      // Disabled icons match the disabled label
      expect(action.disabled).toBe(text.disabled)
    })

    it("selected text reaches 4.5:1 on the selected fill and the surfaces", () => {
      expect(
        worst(text.selected, [...fills, paper, page]),
      ).toBeGreaterThanOrEqual(AA_TEXT)
    })

    it("a selected row can't pass for a hovered one (3:1)", () => {
      const indicator = worst(text.selected, hovers)
      const fill = Math.min(...fills.map((f, i) => contrast(f, hovers[i])))
      expect(Math.max(indicator, fill)).toBeGreaterThanOrEqual(AA_UI)
    })

    it("disabled text is legible (about 3:1) and clearly dimmer than body text", () => {
      const ratio = onSurfaces(theme, text.disabled)
      expect(ratio).toBeGreaterThanOrEqual(AA_UI)
      expect(ratio).toBeLessThan(AA_UI + 0.3)
      expect(ratio).toBeLessThan(onSurfaces(theme, text.primary) / 2)
    })

    it("the editor's contrast panel passes the new pairs", () => {
      const checks = themeContrastChecks(
        structuredClone(data[mode]) as never,
        mode,
      )
      for (const key of ["selectedText", "selectedVsHover", "disabledText"]) {
        const check = checks.find((c) => c.key === key)!
        expect(check.pass).toBe(true)
        expect(check.auto).toBe(true)
      }
    })
  })
})

describe("MEDRUNNER dark, selected and disabled, rendered", () => {
  const theme = buildOrgTheme(fixture(), "dark")
  const { text, action } = theme.palette

  it("a selected list row: the tint, the selected label and a rail", () => {
    render(
      <ThemeProvider theme={theme}>
        <ListItemButton selected>Roster</ListItemButton>
        <MenuItem disabled>Archived</MenuItem>
      </ThemeProvider>,
    )
    const row = getComputedStyle(screen.getByText("Roster"))
    expect(row.backgroundColor).toBe(action.selected)
    expect(row.color).toBe(text.selected)
    expect(row.boxShadow).toContain(text.selected)
    const off = getComputedStyle(screen.getByText("Archived"))
    expect(off.color).toBe(text.disabled)
    expect(off.opacity).toBe("1")
  })

  it("the active tab and its underline take the selected colour", () => {
    render(
      <ThemeProvider theme={theme}>
        <Tabs value={0}>
          <Tab label="Overview" />
          <Tab label="Reviews" />
        </Tabs>
      </ThemeProvider>,
    )
    expect(
      getComputedStyle(screen.getByRole("tab", { name: "Overview" })).color,
    ).toBe(text.selected)
  })

  it("a toggled chip on a fill under 3:1 gets a ring in the selected colour", () => {
    render(
      <ThemeProvider theme={theme}>
        <Chip color="primary" label="Escort" onClick={() => {}} />
      </ThemeProvider>,
    )
    const chip = screen.getByRole("button", { name: "Escort" })
    expect(getComputedStyle(chip).boxShadow).toContain(text.selected)
  })
})

describe("explicit selected and disabled tokens", () => {
  it("are used as saved", () => {
    const data = fixture() as typeof MEDRUNNER
    const dark = data.dark.palette as Record<string, Record<string, string>>
    dark.action.selected = "#334155"
    dark.text.selected = "#e2e8f0"
    dark.text.disabled = "#64748b"
    const theme = buildOrgTheme(data as never, "dark")
    expect(theme.palette.action.selected).toBe("#334155")
    expect(theme.palette.text.selected).toBe("#e2e8f0")
    expect(theme.palette.text.disabled).toBe("#64748b")
  })
})

describe("the site themes' selected state", () => {
  it("keeps the green where it already passes, darkens it on light", () => {
    expect(mainTheme.palette.text.selected).toBe("#10b881")
    expect(lightTheme.palette.text.selected).toBe("#0b7a56")
  })
})
