/**
 * Every SC Orgs poster's copy fits its card, in every locale, at every card
 * width the market grids produce: no line is cut, no word overflows, nothing
 * is pushed out of the 300px card. The poster has no clamps or ellipses, so
 * this is what keeps it whole.
 *
 * There is no layout engine in the test environment, so the copy is laid out
 * here with the poster's own box model and type scale (posterLayout.ts), and
 * glyph widths that err wide:
 * - Latin: Electrolize, the theme font. Its advances are Arial's x 1.0263
 *   (the size-adjust of its metric-matched fallback, src/fonts.css), taken
 *   here from Arial *Bold*, which is wider than the regular face the poster's
 *   synthesised bold keeps.
 * - Cyrillic: the system fallback (Arial, Roboto, Segoe UI), Arial Bold
 *   widths, the same x 1.0263 margin.
 * - CJK and full-width punctuation: 1em, as in every CJK system font.
 * Lines break at spaces and after hyphens, and between any two CJK
 * characters, greedily, as browsers do.
 */
import { describe, expect, it } from "vitest"
import en from "../../../locales/en/english.json"
import de from "../../../locales/de/de.json"
import es from "../../../locales/es/es.json"
import fr from "../../../locales/fr/fr.json"
import ja from "../../../locales/ja/ja.json"
import uk from "../../../locales/uk/ukrainian.json"
import zhHans from "../../../locales/zh/zh_Hans.json"
import zhHant from "../../../locales/zh/zh_Hant.json"
import { MARKET_ADS } from "../adConfig"
import type { PosterAdConfig } from "../types"
import {
  AD_CARD_HEIGHT,
  POSTER_GAP,
  POSTER_MIN_SPACER,
  POSTER_PADDING,
  POSTER_RULE,
  POSTER_TYPE,
  fluidSize,
} from "../posterLayout"

/**
 * Card widths, px. The narrowest is a lg (1200px) window with the nav drawer
 * (280px) and the filter panel (300px) open: four columns of about 135px.
 * Two-column phones (360-430px) give 170-205px; the widest are a
 * two-column row just under the sm breakpoint (599px) and a three-column one
 * just under md (899px), both about 290px. Every 5px from 130 to 380 covers
 * them with room to spare.
 */
const CARD_WIDTHS = Array.from({ length: 51 }, (_, i) => 130 + i * 5)

const LOCALES = { en, de, es, fr, ja, uk, zhHans, zhHant }

/** Arial Bold advance widths, em. */
// prettier-ignore
const LATIN: Record<string, number> = {
  A: 0.722, B: 0.722, C: 0.722, D: 0.722, E: 0.667, F: 0.611, G: 0.778,
  H: 0.722, I: 0.278, J: 0.556, K: 0.722, L: 0.611, M: 0.833, N: 0.722,
  O: 0.778, P: 0.667, Q: 0.778, R: 0.722, S: 0.667, T: 0.611, U: 0.722,
  V: 0.667, W: 0.944, X: 0.667, Y: 0.667, Z: 0.611,
  a: 0.556, b: 0.611, c: 0.556, d: 0.611, e: 0.556, f: 0.333, g: 0.611,
  h: 0.611, i: 0.278, j: 0.278, k: 0.556, l: 0.278, m: 0.889, n: 0.611,
  o: 0.611, p: 0.611, q: 0.611, r: 0.389, s: 0.556, t: 0.333, u: 0.611,
  v: 0.556, w: 0.778, x: 0.556, y: 0.556, z: 0.5,
  " ": 0.278, "\u00a0": 0.278, ".": 0.278, ",": 0.278, ":": 0.333,
  ";": 0.333, "!": 0.333, "?": 0.611, "¿": 0.611, "¡": 0.333, "'": 0.238,
  "’": 0.278, "-": 0.333, "–": 0.556, "—": 1, "&": 0.722, "(": 0.333,
  ")": 0.333, "/": 0.278, "«": 0.556, "»": 0.556,
}
/** Arial Bold Cyrillic, em: the letters without a Latin look-alike. */
// prettier-ignore
const CYRILLIC: Record<string, number> = {
  Б: 0.722, Г: 0.611, Ґ: 0.611, Д: 0.778, Є: 0.722, Ж: 1, З: 0.667,
  И: 0.722, Й: 0.722, І: 0.278, Ї: 0.278, Л: 0.722, П: 0.722, Ф: 0.833,
  Ц: 0.778, Ч: 0.667, Ш: 1, Щ: 1.056, Ъ: 0.833, Ы: 0.944, Ь: 0.722,
  Э: 0.722, Ю: 1, Я: 0.722,
  б: 0.611, г: 0.444, ґ: 0.444, д: 0.611, є: 0.556, ж: 0.833, з: 0.5,
  и: 0.611, й: 0.611, і: 0.278, ї: 0.278, л: 0.611, п: 0.611, ф: 0.833,
  ц: 0.611, ч: 0.556, ш: 0.889, щ: 0.889, ъ: 0.722, ы: 0.833, ь: 0.611,
  э: 0.556, ю: 0.833, я: 0.556,
}
/** Cyrillic letters drawn as their Latin look-alike. */
// prettier-ignore
const LOOKALIKE: Record<string, string> = {
  А: "A", В: "B", Е: "E", К: "K", М: "M", Н: "H", О: "O", Р: "P", С: "C",
  Т: "T", Х: "X", У: "Y",
  а: "a", в: "b", е: "e", к: "k", м: "m", н: "n", о: "o", р: "p", с: "c",
  т: "t", х: "x", у: "y",
}
const ELECTROLIZE = 1.0263

const isCjk = (ch: string) =>
  /[\u3000-\u30ff\u3400-\u9fff\uf900-\ufaff\uff00-\uffef]/.test(ch)

/** One glyph's advance, em. */
function advance(ch: string): number {
  if (isCjk(ch)) return 1
  const base = ch.normalize("NFD")[0]
  const latin = LATIN[base] ?? LATIN[LOOKALIKE[base] ?? ""]
  const width = latin ?? CYRILLIC[base]
  if (width === undefined) throw new Error(`no width for "${ch}"`)
  return width * ELECTROLIZE
}

interface Style {
  size: number
  letterSpacing?: number
  upper?: boolean
}

/** Width of a run of text, px (letter-spacing follows every glyph). */
function textWidth(text: string, style: Style): number {
  const spacing = (style.letterSpacing ?? 0) * style.size
  return [...text].reduce(
    (sum, ch) => sum + advance(ch) * style.size + spacing,
    0,
  )
}

/**
 * Break points: a space (dropped at a line end), after a hyphen, and
 * either side of a CJK character. Returns the unbreakable pieces, each with
 * the space that precedes it.
 */
function pieces(text: string): { lead: string; body: string }[] {
  const out: { lead: string; body: string }[] = []
  let lead = ""
  let body = ""
  const flush = () => {
    if (body) out.push({ lead, body })
    lead = ""
    body = ""
  }
  for (const ch of text) {
    if (ch === " ") {
      flush()
      lead = " "
    } else if (isCjk(ch)) {
      flush()
      // Closing punctuation stays on the line of the character before it.
      if (/[、。，．：；！？」』）]/.test(ch) && out.length > 0) {
        out[out.length - 1].body += ch
      } else {
        out.push({ lead, body: ch })
        lead = ""
      }
    } else {
      body += ch
      if (ch === "-") flush()
    }
  }
  flush()
  return out
}

/** Lays `text` out greedily in `width` px; returns the lines' widths. */
function wrap(text: string, width: number, style: Style): number[] {
  const shown = style.upper ? text.toUpperCase() : text
  const lines: number[] = []
  let line = -1
  for (const { lead, body } of pieces(shown)) {
    const w = textWidth(body, style)
    if (w > width) throw new Error(`"${body}" is wider than ${width}px`)
    if (line >= 0 && line + textWidth(lead, style) + w <= width) {
      line += textWidth(lead, style) + w
    } else {
      if (line >= 0) lines.push(line)
      line = w
    }
  }
  if (line >= 0) lines.push(line)
  return lines
}

type Copy = { kicker: string; title: string; tagline: string; cta: string }

/**
 * The poster's content laid out at `cardWidth`: each block's line count and
 * height (px), top to bottom. Throws if a word is wider than its line.
 */
function posterLayout(copy: Copy, disclaimer: string, cardWidth: number) {
  const T = POSTER_TYPE
  const inner = cardWidth - POSTER_PADDING.left - POSTER_PADDING.right
  const titleSize = fluidSize(T.title.size, cardWidth)
  const taglineSize = fluidSize(T.tagline.size, cardWidth)
  const ctaInner = inner - 2 * (T.cta.padX + T.cta.border)
  const block = (
    text: string,
    style: Style,
    lineHeight: number,
    width = inner,
  ) => {
    const lines = wrap(text, width, style).length
    return { lines, height: lines * style.size * lineHeight }
  }
  const cta = block(
    copy.cta,
    { ...T.cta, upper: true },
    T.cta.lineHeight,
    ctaInner,
  )
  const blocks = {
    kicker: block(
      copy.kicker,
      { ...T.kicker, upper: true },
      T.kicker.lineHeight,
    ),
    title: block(
      copy.title,
      { size: titleSize, letterSpacing: T.title.letterSpacing, upper: true },
      T.title.lineHeight,
    ),
    rule: { lines: 0, height: POSTER_RULE.height + 3 * POSTER_GAP },
    tagline: block(copy.tagline, { size: taglineSize }, T.tagline.lineHeight),
    spacer: { lines: 0, height: POSTER_MIN_SPACER },
    cta: {
      lines: cta.lines,
      height: cta.height + 2 * (T.cta.padY + T.cta.border),
    },
    brand: block("SC Orgs", { ...T.brand, upper: true }, T.brand.lineHeight),
    gap: { lines: 0, height: POSTER_GAP },
    disclaimer: block(disclaimer, T.disclaimer, T.disclaimer.lineHeight),
  }
  const height = Object.values(blocks).reduce((sum, b) => sum + b.height, 0)
  return { height, blocks }
}

const posters = MARKET_ADS.filter(
  (ad): ad is PosterAdConfig => ad.kind === "poster",
)
const room = AD_CARD_HEIGHT - POSTER_PADDING.top - POSTER_PADDING.bottom

function copyOf(locale: object, ad: PosterAdConfig): Copy {
  const scOrgs = (locale as { ads: { scOrgs: Record<string, Copy> } }).ads
    .scOrgs
  return scOrgs[ad.copyKey.split(".").pop()!]
}

describe("SC Orgs poster copy fits its card", () => {
  for (const [name, locale] of Object.entries(LOCALES)) {
    const disclaimer = (locale as { ads: { scOrgs: { disclaimer: string } } })
      .ads.scOrgs.disclaimer
    it.each(posters.map((ad) => [ad.id] as const))(
      `%s (${name}) at every card width`,
      (id) => {
        const copy = copyOf(locale, posters.find((p) => p.id === id)!)
        for (const width of CARD_WIDTHS) {
          const { height, blocks } = posterLayout(copy, disclaimer, width)
          const lines = Object.entries(blocks)
            .filter(([, b]) => b.lines > 0)
            .map(([k, b]) => `${k} ${b.lines}`)
            .join(", ")
          expect(
            height,
            `${id} ${name} at ${width}px: ${Math.round(height)}px of ${room}px (lines: ${lines})`,
          ).toBeLessThanOrEqual(room)
        }
      },
    )
  }

  it("measures what it is given (a check on the model)", () => {
    // "WWWW" at 10px: 4 x 0.944em x 1.0263 = 38.75px.
    expect(textWidth("WWWW", { size: 10 })).toBeCloseTo(38.75, 1)
    expect(wrap("one two three", 1000, { size: 10 })).toHaveLength(1)
    expect(wrap("one two three", 30, { size: 10 })).toHaveLength(3)
    expect(wrap("组织组织", 20, { size: 10 })).toHaveLength(2)
    expect(() => wrap("organisation", 20, { size: 10 })).toThrow(/wider/)
  })
})
