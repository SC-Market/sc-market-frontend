/**
 * Colours that must stay exactly as they are whatever the theme: another
 * product's colour we match, and artwork that is not themed. Everything else
 * comes from the theme (theme.palette.*) or an `@mui/material/colors` shade;
 * hex literals outside src/hooks/styles are a lint warning
 * (scm-style/no-hex-colors).
 */

/** MUI Rating's filled-star colour (StaticRatingStars draws the same stars). */
export const RATING_STAR = "#faaf00"

/**
 * The dark theme's paper colour (mainTheme background.paper), used as the
 * dark text on the light quality colours (util/qualityColor, checked >= 4.5:1).
 */
export const QUALITY_DARK_TEXT = "#111828"

/** The in-universe ad posters (components/ads/AdCard): a night-sky billboard. */
export const AD_POSTER = {
  text: "#e8eef7",
  skyTop: "#0d1626",
  skyMiddle: "#0a101c",
  skyBottom: "#06090f",
} as const

/** What a colour input shows for an unset value (it needs #rrggbb). */
export const COLOR_INPUT_EMPTY = "#000000"
