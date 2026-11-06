/**
 * The theme's two font families (self-hosted in src/fonts.css). Components
 * read them from the theme, `theme.typography.fontFamilyHeading` and
 * `theme.typography.fontFamilyBody`, so a font change is one line here.
 *
 * - Heading (Exo 2): h1-h6, the brand, navigation, buttons, tabs and chips.
 * - Body (Sofia Sans): everything else, inputs and tables included.
 *
 * Each stack starts with `--sc-custom-font`, the font picker's choice
 * (components/settings/PreferencesControls.tsx), which replaces both. Then
 * the font, its metric-matched fallbacks (src/fonts.css) so the swap doesn't
 * reflow the page, and the system fonts.
 */

const SYSTEM_STACK = `"Roboto", Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`

export const HEADING_FONT = "Exo 2"
export const BODY_FONT = "Sofia Sans"

function stack(font: string): string {
  return `var(--sc-custom-font, "${font}"), "${font} Fallback", "${font} Fallback Roboto", ${SYSTEM_STACK}`
}

export const FONT_FAMILY_HEADING = stack(HEADING_FONT)
export const FONT_FAMILY_BODY = stack(BODY_FONT)

/**
 * Prices and stats: the body font (even on a heading variant such as the
 * card price's h6) with same-width digits, so amounts line up in columns and
 * don't jiggle when they change. Spread into `sx` (MUI resolves
 * "fontFamilyBody" from theme.typography).
 */
export const NUMERIC_SX = {
  fontFamily: "fontFamilyBody",
  fontVariantNumeric: "tabular-nums",
} as const
