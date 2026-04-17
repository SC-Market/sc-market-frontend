import React from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
  responsiveFontSizes,
  useTheme,
  type ThemeOptions,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  themeBase,
  mainThemeOptions,
  lightThemeOptions,
  navbarShadow,
} from "../../hooks/styles/Theme"
import type { ExtendedTheme } from "../../hooks/styles/Theme"

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
  faviconUrl?: string | null
}

const PLACEHOLDER_IMG =
  "https://media.starcitizen.tools/thumb/9/93/Placeholderv2.png/399px-Placeholderv2.png.webp"

function ThemePreviewInner({ faviconUrl }: { faviconUrl?: string | null }) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const navKind = theme.navKind ?? "outlined"
  const br = theme.borderRadius
  const outline =
    theme.palette.outline?.main ?? theme.palette.divider ?? "currentColor"

  const navSx = {
    p: 1,
    mb: 1.5,
    bgcolor: "background.navbar",
    display: "flex",
    alignItems: "center",
    gap: 1,
    borderRadius: 0,
    boxSizing: "border-box" as const,
    ...(navKind === "outlined"
      ? {
          border: 1,
          borderColor: outline,
          boxShadow: "none",
        }
      : {
          border: "none",
          boxShadow: navbarShadow(theme),
        }),
  }

  return (
    <>
      {/* Navbar — navKind + navbar bg + favicon */}
      <Box sx={navSx}>
        {faviconUrl ? (
          <Box
            component="img"
            src={faviconUrl}
            alt=""
            sx={{ width: 18, height: 18, flexShrink: 0 }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        ) : (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "primary.main",
              flexShrink: 0,
            }}
          />
        )}
        <Typography variant="subtitle2" color="text.primary" sx={{ flex: 1 }}>
          {t("theme.previewNavbar", "Navbar")}
        </Typography>
      </Box>

      {/* Paper surface (distinct from default bg) */}
      <Paper
        sx={{
          p: 1,
          mb: 1.5,
          bgcolor: "background.paper",
          border: 1,
          borderColor: outline,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {t("theme.previewPaperSurface", "Paper surface")}
        </Typography>
      </Paper>

      <Box sx={{ display: "flex", gap: 1.5 }}>
        {/* Sidebar */}
        <Paper
          sx={{
            p: 1,
            bgcolor: "background.sidebar",
            width: 80,
            flexShrink: 0,
            border: 1,
            borderColor: outline,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("theme.previewSidebar", "Sidebar")}
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

        {/* Main column */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          <Card>
            <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
              <Typography variant="caption" color="text.primary">
                {t("theme.previewCardContent", "Card content")}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("theme.previewSecondaryText", "Secondary text")}
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="small"
              sx={{
                fontSize: 10,
                py: 0.25,
                px: 1,
                minWidth: 0,
                borderRadius: theme.spacing(br.button),
              }}
            >
              {t("theme.previewPrimaryBtn", "Primary")}
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              sx={{
                fontSize: 10,
                py: 0.25,
                px: 1,
                minWidth: 0,
                borderRadius: theme.spacing(br.button),
              }}
            >
              {t("theme.previewSecondaryBtn", "Secondary")}
            </Button>
          </Box>

          {/* Outline / border — matches Border color in editor */}
          <TextField
            size="small"
            variant="outlined"
            label={t("theme.previewOutlinedInput", "Border / input")}
            placeholder={t("theme.previewOutlineHint", "Uses border color")}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: 11,
              },
            }}
          />

          {/* Action hover swatch */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 22,
                borderRadius: 0.5,
                bgcolor: "action.hover",
                border: 1,
                borderColor: outline,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {t("theme.previewActionHover", "Button hover")}
            </Typography>
          </Box>

          {/* Overlay on media — matches Overlay token */}
          <Box
            sx={{
              position: "relative",
              borderRadius: theme.spacing(br.image),
              overflow: "hidden",
              height: 72,
              border: 1,
              borderColor: outline,
            }}
          >
            <Box
              component="img"
              src={PLACEHOLDER_IMG}
              alt=""
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "background.overlay",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: (th) => {
                    try {
                      return th.palette.getContrastText(
                        th.palette.background.overlay,
                      )
                    } catch {
                      return th.palette.text.primary
                    }
                  },
                  fontWeight: 600,
                  textShadow: "0 1px 2px rgba(0,0,0,0.45)",
                }}
              >
                {t("theme.previewOverlay", "Overlay")}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export function ThemePreview({
  themeData,
  mode,
  faviconUrl,
}: ThemePreviewProps) {
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
        <ThemePreviewInner faviconUrl={faviconUrl} />
      </Paper>
    </ThemeProvider>
  )
}
