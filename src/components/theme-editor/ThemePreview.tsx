import React from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  ThemeProvider,
  Typography,
  createTheme,
  responsiveFontSizes,
  type ThemeOptions,
} from "@mui/material"
import { themeBase, mainThemeOptions, lightThemeOptions } from "../../hooks/styles/Theme"

// Validate that a string is a usable CSS color (MUI's getContrastText will not throw)
function isValidColor(value: unknown): boolean {
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
function sanitizePalette(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = sanitizePalette(value)
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

function sanitizeThemeData(data: ThemeOptions): ThemeOptions {
  if (!data || typeof data !== "object") return data
  const result = { ...data }
  if (result.palette) {
    result.palette = sanitizePalette(result.palette as Record<string, any>) as any
  }
  return result
}

interface ThemePreviewProps {
  themeData: ThemeOptions
  mode: "light" | "dark"
}

export function ThemePreview({ themeData, mode }: ThemePreviewProps) {
  const sanitized = sanitizeThemeData(themeData)
  const base =
    mode === "light"
      ? [themeBase, mainThemeOptions, lightThemeOptions, sanitized]
      : [themeBase, mainThemeOptions, sanitized]

  let previewTheme
  try {
    previewTheme = responsiveFontSizes(createTheme(...base))
  } catch {
    previewTheme = responsiveFontSizes(
      createTheme(themeBase, mainThemeOptions),
    )
  }

  return (
    <ThemeProvider theme={previewTheme}>
      <Paper
        sx={{
          p: 2,
          bgcolor: "background.default",
          minHeight: 200,
          overflow: "hidden",
        }}
      >
        {/* Navbar preview */}
        <Paper
          sx={{
            p: 1,
            mb: 1.5,
            bgcolor: "background.navbar",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography variant="subtitle2" color="text.primary" sx={{ flex: 1 }}>
            Navbar
          </Typography>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "primary.main",
            }}
          />
        </Paper>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          {/* Sidebar preview */}
          <Paper
            sx={{
              p: 1,
              bgcolor: "background.sidebar",
              width: 80,
              flexShrink: 0,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Sidebar
            </Typography>
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                sx={{
                  height: 6,
                  bgcolor: "action.hover",
                  borderRadius: 0.5,
                  mt: 0.5,
                }}
              />
            ))}
          </Paper>

          {/* Content preview */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            <Card>
              <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                <Typography variant="caption" color="text.primary">
                  Card content
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Secondary text
                </Typography>
              </CardContent>
            </Card>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Button variant="contained" size="small" sx={{ fontSize: 10, py: 0.25, px: 1, minWidth: 0 }}>
                Primary
              </Button>
              <Button variant="outlined" size="small" color="secondary" sx={{ fontSize: 10, py: 0.25, px: 1, minWidth: 0 }}>
                Secondary
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </ThemeProvider>
  )
}
