import { ExtendedTheme } from "../hooks/styles/Theme"

/**
 * Helper functions for standardized spacing and border radius
 *
 * Usage examples:
 * - Spacing: <Grid container spacing={theme.layoutSpacing.layout}>
 * - Border radius: sx={{ borderRadius: (theme) => theme.spacing((theme as ExtendedTheme).borderRadius.topLevel) }}
 */

/**
 * Get standardized spacing value
 * @param theme - The theme object
 * @param type - Type of spacing (layout, component, text, compact)
 * @returns Spacing value in theme spacing units
 */
export const getLayoutSpacing = (
  theme: ExtendedTheme,
  type: "layout" | "component" | "text" | "compact",
): number => {
  return theme.layoutSpacing[type]
}

/**
 * Get standardized border radius value (spacing multiplier)
 * @param theme - The theme object
 * @param type - Type of border radius (topLevel, image, button, input, minimal)
 * @returns Border radius spacing multiplier (use with theme.spacing())
 */
export const getBorderRadius = (
  theme: ExtendedTheme,
  type: "topLevel" | "image" | "button" | "input" | "minimal",
): number => {
  return theme.borderRadius[type]
}

/**
 * Get border radius as a CSS value (already multiplied by theme spacing)
 * @param theme - The theme object
 * @param type - Type of border radius
 * @returns CSS value like "8px"
 */
export const getBorderRadiusValue = (
  theme: ExtendedTheme,
  type: "topLevel" | "image" | "button" | "input" | "minimal",
): string => {
  return theme.spacing(theme.borderRadius[type])
}
