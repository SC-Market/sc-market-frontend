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
 * Link text colour: the accent, or its dark shade on light themes (the
 * bright accent is under AA on white). MUI Link does the same through the
 * light theme's MuiLink override.
 */
export const linkColor = (theme: Theme) =>
  theme.palette.mode === "light"
    ? theme.palette.primary.dark
    : theme.palette.primary.main

/**
 * Navbar elevation shadow — uses the theme’s standard MUI shadow scale (same
 * idea as Paper elevation), not palette.background.overlay (overlay is for
 * modal/sheet scrims).
 */
export const navbarShadow = (theme: Theme) => theme.shadows[4]
