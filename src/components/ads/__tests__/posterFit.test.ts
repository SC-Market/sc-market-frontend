/**
 * Every SC Orgs poster's copy fits its card, in every locale, at every card
 * width the market grids produce: no line is cut, no word overflows, nothing
 * is pushed out of the 300px card. The poster has no clamps or ellipses, so
 * this is what keeps it whole.
 *
 * There is no layout engine in the test environment, so the copy is laid out
 * here with the poster's own box model and type scale (posterLayout.ts), and
 * glyph widths that err wide. Each glyph is the wider of:
 * - the poster's font: Exo 2 at 800 for the display lines (the title and
 *   brand are 800; the kicker and call to action 700, narrower), Sofia Sans
 *   at 400 for the tagline and disclaimer. Advances from the self-hosted
 *   files (public/fonts), Latin and Cyrillic, without kerning;
 * - its metric-matched fallback, shown until the font arrives: Arial *Bold*
 *   (wider than the regular face the fallback uses) x the fallback's
 *   size-adjust (src/fonts.css).
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
  POSTER_FONT,
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

/** The fallback: Arial Bold advance widths, em. */
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
/** The fallbacks' size-adjust (src/fonts.css, "Exo 2/Sofia Sans Fallback"). */
const FALLBACK_SCALE = { heading: 1.0231, body: 0.9657 }

/** The characters the font tables below cover, in order. */
const FONT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 \u00a0.,:;!?¿¡'’\"-–—&()/«»АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюяЁЄІЇҐёєіїґ"

function advances(units: number[]): Record<string, number> {
  const chars = [...FONT_CHARS]
  if (chars.length !== units.length) throw new Error("table length")
  return Object.fromEntries(chars.map((ch, i) => [ch, units[i] / 1000]))
}

/** Exo 2 at wght 800 (exo-2-v26-*-var.woff2), em. */
// prettier-ignore
const EXO_2_800 = advances([
  669, 651, 597, 693, 588, 566, 659, 704, 308, 390, 657, 547, 935, 731, 698,
  633, 698, 663, 599, 613, 696, 656, 991, 662, 635, 596, 581, 607, 519, 609,
  578, 416, 594, 612, 291, 292, 586, 344, 883, 612, 601, 611, 607, 440, 543,
  425, 605, 585, 864, 588, 585, 534, 646, 451, 591, 573, 649, 561, 600, 536,
  632, 600, 213, 213, 252, 249, 268, 268, 316, 529, 524, 299, 213, 217, 384,
  395, 543, 836, 763, 369, 369, 572, 537, 537, 669, 637, 654, 546, 763, 589,
  954, 578, 724, 724, 663, 697, 941, 710, 698, 707, 636, 597, 613, 609, 865,
  663, 724, 678, 999, 1026, 777, 930, 625, 600, 1000, 652, 584, 606, 584, 471,
  654, 579, 841, 526, 622, 622, 581, 608, 805, 618, 602, 611, 614, 520, 526,
  586, 766, 589, 644, 588, 856, 895, 671, 815, 552, 551, 853, 577, 589, 600,
  314, 308, 548, 579, 551, 296, 297, 486,
])
/**
 * Sofia Sans at wght 400 (sofia-sans-v20-*-var.woff2; Cyrillic in its
 * standard forms, src/fonts.css), em.
 */
// prettier-ignore
const SOFIA_SANS_400 = advances([
  560, 573, 633, 641, 533, 504, 653, 661, 255, 265, 595, 476, 769, 662, 642,
  545, 642, 604, 568, 535, 644, 584, 847, 551, 535, 545, 494, 536, 517, 543,
  519, 367, 517, 556, 235, 236, 491, 235, 845, 556, 536, 537, 541, 356, 464,
  385, 542, 496, 716, 477, 497, 464, 580, 454, 540, 548, 542, 522, 568, 529,
  576, 580, 210, 210, 232, 232, 232, 236, 231, 469, 465, 231, 185, 232, 325,
  490, 740, 880, 672, 270, 270, 372, 498, 498, 560, 566, 573, 475, 627, 533,
  857, 577, 658, 658, 580, 634, 769, 661, 642, 660, 545, 633, 535, 547, 823,
  551, 652, 630, 889, 895, 656, 816, 561, 604, 871, 608, 494, 545, 488, 385,
  507, 519, 699, 491, 544, 544, 484, 509, 626, 544, 536, 542, 537, 517, 430,
  497, 701, 477, 543, 522, 795, 800, 561, 701, 488, 509, 723, 506, 533, 608,
  255, 255, 475, 519, 518, 235, 235, 385,
])

const FONT_WIDTHS = { heading: EXO_2_800, body: SOFIA_SANS_400 }

const isCjk = (ch: string) =>
  /[\u3000-\u30ff\u3400-\u9fff\uf900-\ufaff\uff00-\uffef]/.test(ch)

/** The fallback's advance (Arial Bold), em. */
function fallbackAdvance(base: string): number | undefined {
  return LATIN[base] ?? LATIN[LOOKALIKE[base] ?? ""] ?? CYRILLIC[base]
}

/** One glyph's advance in `font`, em: the font or its fallback, the wider. */
function advance(ch: string, font: PosterFont): number {
  if (isCjk(ch)) return 1
  const base = ch.normalize("NFD")[0]
  const real = FONT_WIDTHS[font][base]
  const fallback = fallbackAdvance(base)
  if (real === undefined || fallback === undefined)
    throw new Error(`no width for "${ch}"`)
  return Math.max(real, fallback * FALLBACK_SCALE[font])
}

type PosterFont = "heading" | "body"

interface Style {
  font: PosterFont
  size: number
  letterSpacing?: number
  upper?: boolean
}

/** Width of a run of text, px (letter-spacing follows every glyph). */
function textWidth(text: string, style: Style): number {
  const spacing = (style.letterSpacing ?? 0) * style.size
  return [...text].reduce(
    (sum, ch) => sum + advance(ch, style.font) * style.size + spacing,
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
    { ...T.cta, font: POSTER_FONT.cta, upper: true },
    T.cta.lineHeight,
    ctaInner,
  )
  const blocks = {
    kicker: block(
      copy.kicker,
      { ...T.kicker, font: POSTER_FONT.kicker, upper: true },
      T.kicker.lineHeight,
    ),
    title: block(
      copy.title,
      {
        font: POSTER_FONT.title,
        size: titleSize,
        letterSpacing: T.title.letterSpacing,
        upper: true,
      },
      T.title.lineHeight,
    ),
    rule: { lines: 0, height: POSTER_RULE.height + 3 * POSTER_GAP },
    tagline: block(
      copy.tagline,
      { font: POSTER_FONT.tagline, size: taglineSize },
      T.tagline.lineHeight,
    ),
    spacer: { lines: 0, height: POSTER_MIN_SPACER },
    cta: {
      lines: cta.lines,
      height: cta.height + 2 * (T.cta.padY + T.cta.border),
    },
    brand: block(
      "SC Orgs",
      { ...T.brand, font: POSTER_FONT.brand, upper: true },
      T.brand.lineHeight,
    ),
    gap: { lines: 0, height: POSTER_GAP },
    disclaimer: block(
      disclaimer,
      { ...T.disclaimer, font: POSTER_FONT.disclaimer },
      T.disclaimer.lineHeight,
    ),
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
    const heading = { font: "heading", size: 10 } as const
    // "WWWW" at 10px: Exo 2's W (0.991em) is wider than the fallback's
    // (0.944em x 1.0231 = 0.966em): 4 x 9.91 = 39.64px.
    expect(textWidth("WWWW", heading)).toBeCloseTo(39.64, 1)
    // "iiii" in Sofia Sans: its i (0.235em) is narrower than the fallback's
    // (0.278em x 0.9657 = 0.268em), so the fallback counts: 10.74px.
    expect(textWidth("iiii", { font: "body", size: 10 })).toBeCloseTo(10.74, 1)
    expect(wrap("one two three", 1000, heading)).toHaveLength(1)
    expect(wrap("one two three", 30, heading)).toHaveLength(3)
    expect(wrap("组织组织", 20, heading)).toHaveLength(2)
    expect(() => wrap("organisation", 20, heading)).toThrow(/wider/)
  })
})
