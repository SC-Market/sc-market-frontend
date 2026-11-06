import { Box, Grid, TextField, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { COLOR_INPUT_EMPTY } from "../../hooks/styles/fixedColors"
import {
  COLOR_FIELDS,
  getNestedValue,
  type ThemeModeData,
} from "./themeEditorFields"

/** The Colors grid: a colour picker and hex field per theme colour. */
export function ThemeColorFields({
  currentMode,
  onChange,
}: {
  currentMode: ThemeModeData
  onChange: (path: string[], value: unknown) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Colors */}
      <Typography variant="subtitle2" gutterBottom>
        {t("theme.colors", "Colors")}
      </Typography>
      <Grid container spacing={1.5}>
        {COLOR_FIELDS.map((field) => (
          <Grid item xs={6} sm={4} key={field.key}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <input
                type="color"
                aria-label={t(field.labelKey, field.fallback)}
                value={
                  (getNestedValue(currentMode, field.path) as string) ||
                  COLOR_INPUT_EMPTY
                }
                onChange={(e) => onChange(field.path, e.target.value)}
                style={{
                  width: 32,
                  height: 32,
                  border: "none",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" display="block" noWrap>
                  {t(field.labelKey, field.fallback)}
                </Typography>
                <TextField
                  size="small"
                  inputProps={{
                    "aria-label": t("appUi.themeEditor.hexAria", {
                      label: t(field.labelKey, field.fallback),
                    }),
                  }}
                  value={getNestedValue(currentMode, field.path) ?? ""}
                  onChange={(e) => onChange(field.path, e.target.value)}
                  sx={{ "& input": { fontSize: 11, py: 0.5, px: 0.75 } }}
                />
                {field.usageNoteKey && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5, lineHeight: 1.35 }}
                  >
                    {t(field.usageNoteKey, field.usageNoteFallback ?? "")}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </>
  )
}
