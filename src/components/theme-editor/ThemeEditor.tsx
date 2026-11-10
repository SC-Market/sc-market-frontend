import React, { useCallback, useMemo, useState } from "react"
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material"
import { SaveRounded, RestoreRounded } from "@mui/icons-material"
import { ThemePreview } from "./ThemePreview"
import { ResetThemeDialog } from "./ResetThemeDialog"
import { ThemePresetPicker } from "./ThemePresetPicker"
import { ThemeColorFields } from "./ThemeColorFields"
import { ThemeContrastPanel } from "./ThemeContrastPanel"
import {
  ContrastWarningDialog,
  useContrastGuardedSave,
} from "./ContrastWarningDialog"
import { ThemeBorderRadiusFields } from "./ThemeBorderRadiusFields"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import type { ThemeOptions } from "@mui/material"
import {
  ThemeModeData,
  setNestedValue,
  stripBackgroundOverlayKeys,
} from "./themeEditorFields"

interface ThemeEditorProps {
  initialThemeData: { light: ThemeModeData; dark: ThemeModeData }
  initialFaviconUrl: string | null
  onSave: (data: {
    theme_data: { light: ThemeModeData; dark: ThemeModeData }
    favicon_url: string | null
  }) => Promise<void>
  onReset: () => Promise<void>
  isSaving?: boolean
}

export function ThemeEditor({
  initialThemeData,
  initialFaviconUrl,
  onSave,
  onReset,
  isSaving,
}: ThemeEditorProps) {
  const { t } = useTranslation()
  const labelIds = React.useId()
  const issueAlert = useAlertHook()
  const [editMode, setEditMode] = useState<"dark" | "light">("dark")
  const [themeData, setThemeData] = useState(initialThemeData)
  const [faviconUrl, setFaviconUrl] = useState(initialFaviconUrl ?? "")
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const currentMode = themeData[editMode]
  const components = currentMode?.components as
    | Record<string, { defaultProps?: Record<string, unknown> }>
    | undefined
  const paperVariant =
    (components?.MuiPaper?.defaultProps?.variant as string) ?? "outlined"
  const cardVariant =
    (components?.MuiCard?.defaultProps?.variant as string) ?? "outlined"
  const paperElevation =
    (components?.MuiPaper?.defaultProps?.elevation as number) ?? 4
  const cardElevation =
    (components?.MuiCard?.defaultProps?.elevation as number) ?? 4
  const navKind = (currentMode?.navKind as string) ?? "outlined"
  const borderRadiusUnit = (currentMode?.borderRadiusUnit as string) ?? "px"

  const updateValue = useCallback(
    (path: string[], value: unknown) => {
      setThemeData((prev) => ({
        ...prev,
        [editMode]: setNestedValue(prev[editMode], path, value),
      }))
    },
    [editMode],
  )

  const updateComponentVariant = useCallback(
    (component: string, variant: string) => {
      setThemeData((prev) => {
        const mode = prev[editMode]
        const prevComponents =
          (mode?.components as Record<
            string,
            { defaultProps?: Record<string, unknown> }
          >) || {}
        const prevElevation =
          prevComponents[component]?.defaultProps?.elevation ?? 4
        return {
          ...prev,
          [editMode]: {
            ...mode,
            components: {
              ...prevComponents,
              [component]: {
                defaultProps: {
                  variant,
                  ...(variant === "elevation"
                    ? { elevation: prevElevation }
                    : {}),
                },
              },
            },
          },
        }
      })
    },
    [editMode],
  )

  const updateComponentElevation = useCallback(
    (component: string, elevation: number) => {
      setThemeData((prev) => {
        const mode = prev[editMode]
        const prevComponents =
          (mode?.components as Record<
            string,
            { defaultProps?: Record<string, unknown> }
          >) || {}
        return {
          ...prev,
          [editMode]: {
            ...mode,
            components: {
              ...prevComponents,
              [component]: {
                defaultProps: {
                  ...prevComponents[component]?.defaultProps,
                  elevation,
                },
              },
            },
          },
        }
      })
    },
    [editMode],
  )

  const handleSave = async () => {
    try {
      await onSave({
        theme_data: stripBackgroundOverlayKeys(themeData),
        favicon_url: faviconUrl || null,
      })
      issueAlert({
        severity: "success",
        message: t("theme.saveSuccess", "Theme saved"),
      })
    } catch {
      issueAlert({
        severity: "error",
        message: t("theme.saveError", "Failed to save theme"),
      })
    }
  }

  const contrastGuard = useContrastGuardedSave(themeData, handleSave)

  const handleReset = async () => {
    setIsResetting(true)
    try {
      await onReset()
      setThemeData({ light: {}, dark: {} })
      setFaviconUrl("")
      issueAlert({
        severity: "success",
        message: t("theme.resetSuccess", "Theme reset to default"),
      })
    } catch {
      issueAlert({
        severity: "error",
        message: t("theme.resetError", "Failed to reset theme"),
      })
    } finally {
      setIsResetting(false)
      setResetDialogOpen(false)
    }
  }

  const previewThemeOptions = useMemo(
    () => themeData[editMode] as ThemeOptions,
    [themeData, editMode],
  )

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Tabs value={editMode} onChange={(_, v) => setEditMode(v)}>
          <Tab value="dark" label={t("theme.darkMode", "Dark Mode")} />
          <Tab value="light" label={t("theme.lightMode", "Light Mode")} />
        </Tabs>
      </Grid>

      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 2 }}>
          {/* Presets from custom themes */}
          <ThemePresetPicker
            onApply={(preset) =>
              setThemeData((prev) => ({ ...prev, [editMode]: preset }))
            }
          />

          {/* Colors */}
          <ThemeColorFields currentMode={currentMode} onChange={updateValue} />

          <ThemeContrastPanel
            modeData={currentMode}
            mode={editMode}
            onChange={updateValue}
          />

          {/* Style */}
          <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 1 }}>
            {t("theme.style", "Style")}
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel id={`${labelIds}-paperStyle`}>
                  {t("theme.paperStyle", "Paper Style")}
                </InputLabel>
                <Select
                  labelId={`${labelIds}-paperStyle`}
                  value={paperVariant}
                  label={t("theme.paperStyle", "Paper Style")}
                  onChange={(e) =>
                    updateComponentVariant("MuiPaper", e.target.value)
                  }
                >
                  <MenuItem value="outlined">
                    {t("theme.outlined", "Outlined")}
                  </MenuItem>
                  <MenuItem value="elevation">
                    {t("theme.elevation", "Elevation")}
                  </MenuItem>
                </Select>
              </FormControl>
              {paperVariant === "elevation" && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    {t("theme.elevationLevel", "Elevation Level")}
                  </Typography>
                  <Slider
                    size="small"
                    aria-label={t("appUi.themeEditor.paperElevation")}
                    min={0}
                    max={24}
                    value={paperElevation}
                    onChange={(_, v) =>
                      updateComponentElevation("MuiPaper", v as number)
                    }
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel id={`${labelIds}-cardStyle`}>
                  {t("theme.cardStyle", "Card Style")}
                </InputLabel>
                <Select
                  labelId={`${labelIds}-cardStyle`}
                  value={cardVariant}
                  label={t("theme.cardStyle", "Card Style")}
                  onChange={(e) =>
                    updateComponentVariant("MuiCard", e.target.value)
                  }
                >
                  <MenuItem value="outlined">
                    {t("theme.outlined", "Outlined")}
                  </MenuItem>
                  <MenuItem value="elevation">
                    {t("theme.elevation", "Elevation")}
                  </MenuItem>
                </Select>
              </FormControl>
              {cardVariant === "elevation" && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    {t("theme.elevationLevel", "Elevation Level")}
                  </Typography>
                  <Slider
                    size="small"
                    aria-label={t("appUi.themeEditor.cardElevation")}
                    min={0}
                    max={24}
                    value={cardElevation}
                    onChange={(_, v) =>
                      updateComponentElevation("MuiCard", v as number)
                    }
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel id={`${labelIds}-navStyle`}>
                  {t("theme.navStyle", "Nav Style")}
                </InputLabel>
                <Select
                  labelId={`${labelIds}-navStyle`}
                  value={navKind}
                  label={t("theme.navStyle", "Nav Style")}
                  onChange={(e) => updateValue(["navKind"], e.target.value)}
                >
                  <MenuItem value="outlined">
                    {t("theme.outlined", "Outlined")}
                  </MenuItem>
                  <MenuItem value="elevation">
                    {t("theme.elevation", "Elevation")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Border Radius */}
          <ThemeBorderRadiusFields
            currentMode={currentMode}
            borderRadiusUnit={borderRadiusUnit}
            onChange={updateValue}
          />

          {/* Favicon */}
          <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 1 }}>
            {t("theme.favicon", "Favicon")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {faviconUrl && (
              <img
                src={faviconUrl}
                alt={t("appUi.themeEditor.faviconAlt")}
                style={{ width: 24, height: 24 }}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            )}
            <TextField
              fullWidth
              size="small"
              placeholder="https://example.com/favicon.ico"
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
            />
          </Box>
        </Paper>
      </Grid>

      {/* Live preview */}
      <Grid item xs={12} md={5}>
        <Typography variant="subtitle2" gutterBottom>
          {t("theme.preview", "Preview")}
        </Typography>
        <ThemePreview
          themeData={previewThemeOptions}
          mode={editMode}
          faviconUrl={faviconUrl || null}
        />
      </Grid>

      {/* Actions */}
      <Grid item xs={12}>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button
            startIcon={
              isResetting ? <CircularProgress size={16} /> : <RestoreRounded />
            }
            onClick={() => setResetDialogOpen(true)}
            color="error"
            disabled={isResetting}
          >
            {t("theme.reset", "Reset to Default")}
          </Button>
          <Button
            variant="contained"
            startIcon={
              isSaving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveRounded />
              )
            }
            onClick={contrastGuard.requestSave}
            disabled={isSaving}
          >
            {isSaving
              ? t("theme.saving", "Saving...")
              : t("theme.save", "Save Theme")}
          </Button>
        </Box>
      </Grid>

      {/* Failing contrast: say which pairs, then save if they want */}
      <ContrastWarningDialog {...contrastGuard.dialog} />

      {/* Reset confirmation dialog */}
      <ResetThemeDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleReset}
        isResetting={isResetting}
      />
    </Grid>
  )
}
