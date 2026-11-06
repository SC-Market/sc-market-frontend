/**
 * The SC Orgs poster's box model and type scale, in px. PosterCreative
 * (AdCard.tsx) draws with these, and the fit test (__tests__/posterFit.test.ts)
 * lays every locale's copy out with them at every card width the market grids
 * produce, so a change that makes copy spill out of the card fails there.
 *
 * Sizes that grow with the card are `{ min, perWidth, max }`: CSS
 * `clamp(min, perWidth * 100cqi, max)`, the poster being its own inline-size
 * container (cqi = 1% of the card's width).
 */

import { LISTING_CARD_HEIGHT } from "../../features/market/v2/marketSearchLayout"

/** Every ad is the listing card's height. */
export const AD_CARD_HEIGHT = LISTING_CARD_HEIGHT

export const POSTER_SPINE_WIDTH = 8

export const POSTER_PADDING = { left: 14, right: 8, top: 10, bottom: 10 }

export interface FluidSize {
  min: number
  perWidth: number
  max: number
}

export const POSTER_TYPE = {
  kicker: { size: 11, lineHeight: 1.25, letterSpacing: 0.14 },
  title: {
    size: { min: 13, perWidth: 0.1, max: 34 } as FluidSize,
    lineHeight: 1,
    letterSpacing: 0.01,
  },
  tagline: {
    size: { min: 11, perWidth: 0.046, max: 14 } as FluidSize,
    lineHeight: 1.3,
  },
  cta: {
    size: 11,
    lineHeight: 1.25,
    letterSpacing: 0.04,
    padX: 7,
    padY: 4,
    border: 1,
  },
  brand: { size: 11, lineHeight: 1.25, letterSpacing: 0.22 },
  disclaimer: { size: 9.5, lineHeight: 1.25 },
} as const

/**
 * Which theme font each line is set in: the display lines in the heading
 * font (Exo 2), the running text in the body font (Sofia Sans). The fit test
 * measures each line in its font.
 */
export const POSTER_FONT = {
  kicker: "heading",
  title: "heading",
  tagline: "body",
  cta: "heading",
  brand: "heading",
  disclaimer: "body",
} as const

/** Vertical gaps: kicker → title → rule → tagline, and CTA → brand line. */
export const POSTER_GAP = 7
/** The accent rule under the title. */
export const POSTER_RULE = { width: 40, height: 3 }
/** Least space between the tagline and the call to action. */
export const POSTER_MIN_SPACER = 6

/** A fluid size at a given card width, in px. */
export function fluidSize(size: FluidSize, cardWidth: number): number {
  return Math.min(size.max, Math.max(size.min, size.perWidth * cardWidth))
}

/** The same size as a CSS value. */
export function fluidCss(size: FluidSize): string {
  return `clamp(${size.min}px, ${+(size.perWidth * 100).toFixed(2)}cqi, ${size.max}px)`
}
