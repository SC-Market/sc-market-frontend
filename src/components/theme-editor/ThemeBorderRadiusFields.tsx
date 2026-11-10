import React from "react"
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { MISSING_IMAGE_URL } from "../../hooks/styles/Theme"
import {
  BORDER_RADIUS_FIELDS,
  getNestedValue,
  type ThemeModeData,
} from "./themeEditorFields"

/** Border Radius: the unit picker and a slider per radius. */
export function ThemeBorderRadiusFields({
  currentMode,
  borderRadiusUnit,
  onChange,
}: {
  currentMode: ThemeModeData
  borderRadiusUnit: string
  onChange: (path: string[], value: unknown) => void
}) {
  const { t } = useTranslation()
  const labelIds = React.useId()
  return (
    <>
      {/* Border Radius */}
      <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 1 }}>
        {t("theme.borderRadius", "Border Radius")}
      </Typography>
      <Box sx={{ mb: 1 }}>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id={`${labelIds}-unit`}>
            {t("theme.unit", "Unit")}
          </InputLabel>
          <Select
            labelId={`${labelIds}-unit`}
            value={borderRadiusUnit}
            label={t("theme.unit", "Unit")}
            onChange={(e) => onChange(["borderRadiusUnit"], e.target.value)}
          >
            <MenuItem value="px">px</MenuItem>
            <MenuItem value="rem">rem</MenuItem>
            <MenuItem value="em">em</MenuItem>
            <MenuItem value="%">%</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Grid container spacing={1.5}>
        {BORDER_RADIUS_FIELDS.map((field) => (
          <Grid item xs={4} key={field.key}>
            <Typography variant="caption">
              {t(field.labelKey, field.fallback)}
            </Typography>
            <Slider
              size="small"
              aria-label={t(field.labelKey, field.fallback)}
              min={0}
              max={
                borderRadiusUnit === "px"
                  ? 32
                  : borderRadiusUnit === "%"
                    ? 50
                    : 3
              }
              step={
                borderRadiusUnit === "px"
                  ? 1
                  : borderRadiusUnit === "%"
                    ? 1
                    : 0.125
              }
              value={
                (getNestedValue(currentMode, field.path) as number) ??
                (borderRadiusUnit === "px" ? 3 : 0.375)
              }
              onChange={(_, v) => onChange(field.path, v as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}${borderRadiusUnit}`}
            />
            {field.key === "image" && (
              <Box
                component="img"
                src={MISSING_IMAGE_URL}
                alt={t("appUi.themeEditor.imageRadiusPreview")}
                sx={{
                  width: "100%",
                  height: 80,
                  objectFit: "cover",
                  borderRadius: `${getNestedValue(currentMode, field.path) ?? 3}${borderRadiusUnit}`,
                  mt: 0.5,
                }}
              />
            )}
          </Grid>
        ))}
      </Grid>
    </>
  )
}
