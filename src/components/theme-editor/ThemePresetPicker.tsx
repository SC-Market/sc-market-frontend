import { Box, Tooltip, Typography } from "@mui/material"
import { grey } from "@mui/material/colors"
import { useTranslation } from "react-i18next"
import { CUSTOM_THEMES } from "../../hooks/styles/custom_themes"
import type { ThemeModeData } from "./themeEditorFields"

/** "Load Preset": a swatch per built-in custom theme. */
export function ThemePresetPicker({
  onApply,
}: {
  onApply: (preset: ThemeModeData) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Presets from custom themes */}
      <Typography variant="subtitle2" gutterBottom>
        {t("theme.presets", "Load Preset")}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
        {Array.from(CUSTOM_THEMES.entries()).map(([name, themeObj]) => {
          const primary = themeObj.palette?.primary?.main || grey[600]
          const bg = themeObj.palette?.background?.default || grey[900]
          return (
            <Tooltip key={name} title={name.replace(/_/g, " ")} placement="top">
              <Box
                onClick={() => {
                  const p = themeObj.palette
                  const mode = p?.mode || "dark"
                  const bg = p?.background as
                    | {
                        default?: string
                        paper?: string
                        sidebar?: string
                        navbar?: string
                      }
                    | undefined
                  const outline = (
                    p as { outline?: { main?: string } } | undefined
                  )?.outline
                  const thm = themeObj as unknown as ThemeModeData
                  const preset: ThemeModeData = {
                    palette: {
                      mode,
                      ...(p?.primary?.main && {
                        primary: {
                          main: p.primary.main,
                          contrastText: p.primary.contrastText,
                        },
                      }),
                      ...(p?.secondary?.main && {
                        secondary: {
                          main: p.secondary.main,
                          contrastText: p.secondary.contrastText,
                        },
                      }),
                      background: {
                        default: bg?.default,
                        paper: bg?.paper,
                        sidebar: bg?.sidebar,
                        navbar: bg?.navbar,
                      },
                      text: {
                        primary: p?.text?.primary,
                        secondary: p?.text?.secondary,
                      },
                      ...(outline?.main && {
                        outline: { main: outline.main },
                      }),
                      action: { hover: p?.action?.hover },
                    },
                    navKind: thm.navKind,
                  }
                  onApply(preset)
                }}
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: 0.5,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: "divider",
                  background: `linear-gradient(to right, ${primary} 50%, ${bg} 50%)`,
                  transition: "transform 0.15s, box-shadow 0.15s",
                  "&:hover": {
                    transform: "scale(1.2)",
                    boxShadow: `0 0 8px ${primary}`,
                  },
                  flexShrink: 0,
                }}
              />
            </Tooltip>
          )
        })}
      </Box>
    </>
  )
}
