/**
 * Utility functions for displaying game item attributes
 */

/**
 * Map color names to hex values
 */
const COLOR_MAP: Record<string, string> = {
  red: "#d32f2f",
  blue: "#1976d2",
  green: "#388e3c",
  yellow: "#fbc02d",
  orange: "#f57c00",
  purple: "#7b1fa2",
  pink: "#c2185b",
  black: "#212121",
  white: "#fafafa",
  gray: "#757575",
  grey: "#757575",
  brown: "#5d4037",
  tan: "#bcaaa4",
  beige: "#d7ccc8",
  gold: "#ffd700",
  silver: "#c0c0c0",
  bronze: "#cd7f32",
  copper: "#b87333",
  camo: "#78866b",
  camouflage: "#78866b",
  desert: "#c19a6b",
  urban: "#808080",
  woodland: "#4a5d23",
}

/**
 * Get hex color value from color name
 */
export function getColorHex(colorName: string): string {
  const normalized = colorName.toLowerCase().trim()
  return COLOR_MAP[normalized] || "#757575" // Default to gray
}

/**
 * Determine if we should use light or dark text on a color background
 */
export function getContrastColor(colorName: string): string {
  const hex = getColorHex(colorName)
  
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? "#000000" : "#ffffff"
}

/**
 * Check if an item is a component (has component-related attributes)
 */
export function isComponentItem(attributes?: Record<string, string> | null): boolean {
  if (!attributes) return false
  
  const componentKeys = [
    "component_size",
    "component_grade",
    "component_class",
    "component_type",
    "manufacturer",
  ]
  
  return componentKeys.some((key) => key in attributes)
}

/**
 * Check if an item is armor (has armor-related attributes)
 */
export function isArmorItem(attributes?: Record<string, string> | null): boolean {
  if (!attributes) return false
  return "armor_class" in attributes
}
