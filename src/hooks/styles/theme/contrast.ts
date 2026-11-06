import type { Theme } from "@mui/material"
import { decomposeColor, hslToRgb, recomposeColor } from "@mui/material/styles"

/** WCAG AA minimums. */
export const AA_TEXT = 4.5
export const AA_UI = 3

/** Dark ink for text on bright accent fills (orange, red, purple). */
export const ON_ACCENT_DARK = "#0b0f1a"

type RGB = [number, number, number]

function toRgba(color: string): [number, number, number, number] {
  let c = decomposeColor(color)
  if (c.type === "hsl" || c.type === "hsla") {
    c = decomposeColor(hslToRgb(recomposeColor(c)))
  }
  if (c.type !== "rgb" && c.type !== "rgba") {
    throw new Error(`Unsupported colour for contrast maths: ${color}`)
  }
  const [r, g, b, a] = c.values as number[]
  return [r, g, b, a ?? 1]
}

function rgbString([r, g, b]: RGB): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

/** Solid colour of `fg` (possibly translucent) painted over solid `bg`. */
export function flatten(fg: string, bg: string): string {
  const [fr, fg_, fb, fa] = toRgba(fg)
  const [br, bgG, bb] = toRgba(bg)
  return rgbString([
    fr * fa + br * (1 - fa),
    fg_ * fa + bgG * (1 - fa),
    fb * fa + bb * (1 - fa),
  ])
}

/** `a` moved `t` (0..1) of the way towards `b`, in sRGB. */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = toRgba(a)
  const [br, bg, bb] = toRgba(b)
  return rgbString([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t])
}

function luminance(color: string): number {
  const [r, g, b] = toRgba(color).map((v, i) => {
    if (i === 3) return v
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Unrounded WCAG contrast ratio of two solid colours. */
export function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

function worst(color: string, backgrounds: string[]): number {
  return Math.min(...backgrounds.map((bg) => contrast(color, bg)))
}

/**
 * `color`, nudged towards white or black (whichever contrasts more with the
 * backgrounds) in 5% steps until it reaches `min` against every background.
 * A colour that already passes comes back unchanged.
 */
export function ensureContrast(
  color: string,
  backgrounds: string[],
  min: number,
): string {
  if (worst(color, backgrounds) >= min) return color
  const pole =
    worst("#ffffff", backgrounds) >= worst("#000000", backgrounds)
      ? "#ffffff"
      : "#000000"
  for (let i = 1; i <= 20; i++) {
    const candidate = mix(color, pole, i / 20)
    if (worst(candidate, backgrounds) >= min) return candidate
  }
  return pole
}

/**
 * The first candidate that reaches `min` on every background, or the one
 * with the best worst-case ratio when none does.
 */
export function pickReadable(
  candidates: string[],
  backgrounds: string[],
  min: number,
): string {
  const passing = candidates.find((c) => worst(c, backgrounds) >= min)
  if (passing) return passing
  return candidates.reduce((best, c) =>
    worst(c, backgrounds) > worst(best, backgrounds) ? c : best,
  )
}

/**
 * The two surfaces controls sit on, as solid colours: Paper (flattened over
 * the page) and the page background (flattened over black or white).
 */
export function surfaces(theme: Theme): { paper: string; page: string } {
  const base = theme.palette.mode === "dark" ? "#000000" : "#ffffff"
  const page = flatten(theme.palette.background.default, base)
  const paper = flatten(theme.palette.background.paper, page)
  return { paper, page }
}

/**
 * Run a colour computation against the theme. Custom themes can carry
 * values the contrast maths can't read (gradients, url(), CSS variables);
 * those keep MUI's stock styling instead of crashing the render.
 */
export function withContrast<T extends object>(compute: () => T): Partial<T> {
  try {
    return compute()
  } catch {
    return {}
  }
}

function cached<K extends string, V>(compute: (theme: Theme, key: K) => V) {
  const cache = new WeakMap<Theme, Map<K, V>>()
  return (theme: Theme, key: K): V => {
    let byKey = cache.get(theme)
    if (!byKey) {
      byKey = new Map()
      cache.set(theme, byKey)
    }
    if (!byKey.has(key)) byKey.set(key, compute(theme, key))
    return byKey.get(key) as V
  }
}

/** Palette colours whose filled buttons and chips take dark text. */
export const ACCENT_FILLS = ["secondary", "warning", "error"] as const
export type AccentFill = (typeof ACCENT_FILLS)[number]

export function isAccentFill(color: unknown): color is AccentFill {
  return (ACCENT_FILLS as readonly unknown[]).includes(color)
}

/**
 * Text and hover fill for a filled (contained button / filled chip) accent.
 * Dark ink when it reaches AA on the fill, otherwise the most readable of
 * the palette's contrastText, white and black. The hover fill is the first
 * of dark / light / main that keeps that text at AA.
 */
export const accentFill = cached((theme: Theme, color: AccentFill) => {
  const { paper } = surfaces(theme)
  const c = theme.palette[color]
  const fill = flatten(c.main, paper)
  const text = pickReadable(
    [ON_ACCENT_DARK, flatten(c.contrastText, fill), "#ffffff", "#000000"],
    [fill],
    AA_TEXT,
  )
  const hover =
    [c.dark, c.light].find(
      (bg) => contrast(text, flatten(bg, paper)) >= AA_TEXT,
    ) ?? c.main
  const deleteIcon = ensureContrast(
    mix(fill, text, 0.7),
    [fill, flatten(hover, paper)],
    AA_UI,
  )
  return { fill, text, hover, deleteIcon }
})

/**
 * Disabled button colours: a muted label that still reads at AA on Paper,
 * the page and the disabled fill, and an outline at 3:1.
 */
export const disabledButton = cached((theme: Theme) => {
  const { paper, page } = surfaces(theme)
  const base = flatten(theme.palette.text.primary, paper)
  const fill = mix(paper, base, 0.12)
  const text = ensureContrast(
    mix(paper, base, 0.55),
    [paper, page, fill],
    AA_TEXT,
  )
  const border = ensureContrast(mix(paper, base, 0.4), [paper, page], AA_UI)
  return { text, fill, border }
})

/**
 * Selected ToggleButton: a stronger tint of the accent (the palette colour,
 * or the high-emphasis text colour for "standard"), a 1px inset ring at 3:1
 * against the surface, and a label at AA on the tint. Unselected labels use
 * text.primary at AA.
 */
export const selectedToggle = cached((theme: Theme, color: string) => {
  const { paper, page } = surfaces(theme)
  const entry = (theme.palette as unknown as Record<string, { main?: string }>)[
    color
  ]
  const accent = flatten(
    color !== "standard" && typeof entry?.main === "string"
      ? entry.main
      : theme.palette.text.secondary,
    paper,
  )
  const fill = mix(paper, accent, 0.24)
  const hover = mix(paper, accent, 0.32)
  const ring = ensureContrast(accent, [paper, page], AA_UI)
  const text = ensureContrast(accent, [fill, hover], AA_TEXT)
  // Unselected label: text.primary at AA (MUI's default is action.active).
  const idle = ensureContrast(
    flatten(theme.palette.text.primary, paper),
    [paper, page],
    AA_TEXT,
  )
  return { fill, hover, ring, text, idle }
})

/**
 * AA floors for the palette's disabled colours, applied to every built
 * theme: action.disabled (disabled icons, IconButtons, checkbox and input
 * outlines) reaches 3:1 and text.disabled (disabled input text and labels)
 * 4.5:1, on both Paper and the page. Values that already pass are kept as
 * they are; surfaces the maths can't read leave MUI's values alone.
 */
export function applyContrastFloors(theme: Theme): Theme {
  try {
    const { paper, page } = surfaces(theme)
    const floor = (color: string, min: number) => {
      const solid = flatten(color, paper)
      return worst(solid, [paper, page]) >= min
        ? color
        : ensureContrast(solid, [paper, page], min)
    }
    theme.palette.action.disabled = floor(theme.palette.action.disabled, AA_UI)
    theme.palette.text.disabled = floor(theme.palette.text.disabled, AA_TEXT)
  } catch {
    // unreadable surface colour (gradient, url(), CSS variable)
  }
  return theme
}

/**
 * Outlined input borders. Resting: MUI's 23% ink, raised to 3:1 on Paper
 * and the page. Hover (text.primary) and focus (the input's palette colour)
 * are raised to at least the resting ratio, so neither is ever weaker.
 */
export const outlinedInput = cached((theme: Theme, color: string) => {
  const { paper, page } = surfaces(theme)
  const bgs = [paper, page]
  const ink = theme.palette.mode === "dark" ? "255, 255, 255" : "0, 0, 0"
  const restingRaw = flatten(`rgba(${ink}, 0.23)`, paper)
  const resting = ensureContrast(restingRaw, bgs, AA_UI)
  const floor = Math.max(AA_UI, worst(resting, bgs))
  const entry = (theme.palette as unknown as Record<string, { main?: string }>)[
    color
  ]
  const focusBase =
    typeof entry?.main === "string" ? entry.main : theme.palette.primary.main
  const hover = ensureContrast(
    flatten(theme.palette.text.primary, paper),
    bgs,
    floor,
  )
  const focus = ensureContrast(flatten(focusBase, paper), bgs, floor)
  return { resting, hover, focus }
})
