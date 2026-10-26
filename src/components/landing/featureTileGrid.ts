import type { SxProps } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

/*
 * Kept out of LandingFeatures.tsx so its skeleton (the Suspense fallback of
 * the lazy-loaded section) doesn't pull the section into the page chunk.
 */

/** Narrowest a 16:9 feature tile may get before the blocks go one per row. */
export const MIN_FEATURE_TILE_WIDTH = 360

/**
 * The feature blocks sit two per row only when the section itself is wide
 * enough for two tiles of at least MIN_FEATURE_TILE_WIDTH plus the gap. This
 * is a container query, not a viewport breakpoint: with the sidebar open at a
 * ~900px window the section is only ~530px wide, and the old md breakpoint put
 * two ~250px tiles side by side.
 */
export function featureTileGrid(theme: ExtendedTheme): {
  container: SxProps
  grid: SxProps
} {
  const gap = parseFloat(theme.spacing(theme.layoutSpacing.layout * 4))
  return {
    container: { containerType: "inline-size" },
    grid: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr)",
      gap: `${gap}px`,
      [`@container (min-width: ${MIN_FEATURE_TILE_WIDTH * 2 + gap}px)`]: {
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      },
    },
  }
}
