import type { Theme } from "@mui/material"

/**
 * Gradient overlay that fades from transparent to the sidebar background.
 * Used on listing cards, skeletons, and similar image-overlay patterns.
 */
export const cardFadeGradient = (theme: Theme, startPct = 50, midPct = 60) =>
  `linear-gradient(to bottom, transparent, transparent ${startPct}%, ${theme.palette.background.sidebar}AA ${midPct}%, ${theme.palette.background.sidebar} 100%)`

/**
 * Gradient overlay that fades from transparent to the default background.
 * Used on banner areas, contractor cards, and profile headers.
 */
export const bannerFadeGradient = (theme: Theme) =>
  `linear-gradient(to bottom, transparent, ${theme.palette.background.default}99 60%, ${theme.palette.background.default} 100%)`

/**
 * Radial glow gradient using primary + secondary colors.
 * Used on landing page and its skeleton.
 */
export const radialGlowGradient = (theme: Theme) =>
  `radial-gradient(at 100% 0%, ${theme.palette.primary.main}80 0px, transparent 60%),radial-gradient(at 0% 0%, ${theme.palette.secondary.main}80 0px, transparent 60%)`

/**
 * Navbar box-shadow derived from the theme overlay token.
 */
export const navbarShadow = (theme: Theme) =>
  `0px 5px 5px 0px ${theme.palette.background.overlay}`
