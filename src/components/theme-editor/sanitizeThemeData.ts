import { type ThemeOptions } from "@mui/material"

// Validate that a string is a usable CSS color (MUI's getContrastText will not throw)
export function isValidColor(value: unknown): boolean {
  if (typeof value !== "string" || !value) return false
  // Accept: #rgb, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(), hsla(), named colors
  if (/^#([0-9a-f]{3}){1,2}([0-9a-f]{2})?$/i.test(value)) return true
  if (/^(rgb|hsl)a?\(/.test(value)) return true
  // Named colors — test via DOM
  if (/^[a-z]+$/i.test(value)) return true
  return false
}

// Deep-clone theme options, stripping any string values that aren't valid colors
// from palette sub-objects (where MUI would call getContrastText)
export function sanitizePalette(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = sanitizePalette(value as Record<string, unknown>)
    } else if (typeof value === "string") {
      if (isValidColor(value)) {
        result[key] = value
      }
      // else: skip invalid color — MUI will use its default
    } else {
      result[key] = value
    }
  }
  return result
}

export function sanitizeThemeData(data: ThemeOptions): ThemeOptions {
  if (!data || typeof data !== "object") return data
  const result = { ...data }
  if (result.palette) {
    result.palette = sanitizePalette(
      result.palette as Record<string, unknown>,
    ) as ThemeOptions["palette"]
  }
  return result
}
