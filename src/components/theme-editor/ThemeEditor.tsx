import React, { useCallback, useMemo, useState } from "react"
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import type { ThemeOptions } from "@mui/material"

interface ThemeEditorProps {
  initialThemeData: { light: Record<string, any>; dark: Record<string, any> }
  initialFaviconUrl: string | null
  onSave: (data: {
    theme_data: { light: Record<string, any>; dark: Record<string, any> }
    favicon_url: string | null
  }) => Promise<any>
  onReset: () => Promise<any>
  isSaving?: boolean
}

interface ColorField {
  key: string
  labelKey: string
  fallback: string
  path: string[]
  /** Short note under the control — where this token is used in the app */
  usageNoteKey?: string
  usageNoteFallback?: string
}

const COLOR_FIELDS: ColorField[] = [
  { key: "primary", labelKey: "theme.primary", fallback: "Primary", path: ["palette", "primary", "main"] },
  { key: "primaryContrast", labelKey: "theme.primaryContrast", fallback: "Button Text", path: ["palette", "primary", "contrastText"] },
  {
    key: "primaryDark",
    labelKey: "theme.primaryDark",
    fallback: "Primary hover (filled buttons)",
    path: ["palette", "primary", "dark"],
    usageNoteKey: "theme.usagePrimaryDark",
    usageNoteFallback:
      "MUI uses this for contained primary buttons on hover — not the “Menu & list hover” color.",
  },
  { key: "secondary", labelKey: "theme.secondary", fallback: "Secondary", path: ["palette", "secondary", "main"] },
  { key: "bgDefault", labelKey: "theme.bgDefault", fallback: "Background", path: ["palette", "background", "default"] },
  { key: "bgPaper", labelKey: "theme.bgPaper", fallback: "Paper", path: ["palette", "background", "paper"] },
  {
    key: "bgSidebar",
    labelKey: "theme.bgSidebar",
    fallback: "Sidebar",
    path: ["palette", "background", "sidebar"],
    usageNoteKey: "theme.usageSidebar",
    usageNoteFallback:
      "Dark-mode listing thumbnails and photo-picker surfaces (e.g. SelectPhotosArea) fade toward this color.",
  },
  { key: "bgNavbar", labelKey: "theme.bgNavbar", fallback: "Navbar", path: ["palette", "background", "navbar"] },
  { key: "textPrimary", labelKey: "theme.textPrimary", fallback: "Text", path: ["palette", "text", "primary"] },
  { key: "textSecondary", labelKey: "theme.textSecondary", fallback: "Text Secondary", path: ["palette", "text", "secondary"] },
  { key: "outline", labelKey: "theme.outline", fallback: "Border Color", path: ["palette", "outline", "main"] },
  {
    key: "actionHover",
    labelKey: "theme.actionHover",
    fallback: "Menu & list hover",
    path: ["palette", "action", "hover"],
    usageNoteKey: "theme.usageActionHover",
    usageNoteFallback:
      "Sidebar rows, menus, autocomplete — and Skeleton “wave”. Not filled primary buttons.",
  },
]

const BORDER_RADIUS_FIELDS = [
  { key: "topLevel", labelKey: "theme.borderRadiusTopLevel", fallback: "Cards", path: ["borderRadius", "topLevel"] },
  { key: "button", labelKey: "theme.borderRadiusButton", fallback: "Buttons", path: ["borderRadius", "button"] },
  { key: "image", labelKey: "theme.borderRadiusImage", fallback: "Images", path: ["borderRadius", "image"] },
]

function getNestedValue(obj: Record<string, any>, path: string[]): any {
  let current: any = obj
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined
    current = current[key]
  }
  return current
}

function setNestedValue(obj: Record<string, any>, path: string[], value: any): Record<string, any> {
  const result = { ...obj }
  let current: any = result
  for (let i = 0; i < path.length - 1; i++) {
    current[path[i]] = { ...(current[path[i]] || {}) }
    current = current[path[i]]
  }
  current[path[path.length - 1]] = value
  return result
}

/** Scrim overlays use app defaults; strip so saved theme_data does not keep old custom overlay keys. */
function stripBackgroundOverlayKeys(themeData: {
  light: Record<string, unknown>
  dark: Record<string, unknown>
}) {
  const clone = {
    light: structuredClone(themeData.light) as Record<string, unknown>,
    dark: structuredClone(themeData.dark) as Record<string, unknown>,
  }
  for (const mode of ["light", "dark"] as const) {
    const palette = clone[mode].palette as Record<string, unknown> | undefined
    if (!palette || typeof palette !== "object") continue
    const bg = palette.background as Record<string, unknown> | undefined
    if (!bg || typeof bg !== "object") continue
    delete bg.overlay
    delete bg.overlayDark
  }
  return clone
}

export function ThemeEditor({
  initialThemeData,
  initialFaviconUrl,
  onSave,
  onReset,
  isSaving,
}: ThemeEditorProps) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [editMode, setEditMode] = useState<"dark" | "light">("dark")
  const [themeData, setThemeData] = useState(initialThemeData)
  const [faviconUrl, setFaviconUrl] = useState(initialFaviconUrl ?? "")
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const currentMode = themeData[editMode] as Record<string, any>
  const paperVariant = currentMode?.components?.MuiPaper?.defaultProps?.variant ?? "outlined"
  const cardVariant = currentMode?.components?.MuiCard?.defaultProps?.variant ?? "outlined"
  const paperElevation = currentMode?.components?.MuiPaper?.defaultProps?.elevation ?? 4
  const cardElevation = currentMode?.components?.MuiCard?.defaultProps?.elevation ?? 4
  const navKind = currentMode?.navKind ?? "outlined"
  const borderRadiusUnit = currentMode?.borderRadiusUnit ?? "px"

  const updateValue = useCallback(
    (path: string[], value: any) => {
      setThemeData((prev) => ({
        ...prev,
        [editMode]: setNestedValue(prev[editMode], path, value),
      }))
    },
    [editMode],
  )

  const updateComponentVariant = useCallback(
    (component: string, variant: string) => {
      setThemeData((prev) => ({
        ...prev,
        [editMode]: {
          ...prev[editMode],
          components: {
            ...(prev[editMode] as any)?.components,
            [component]: {
              defaultProps: {
                variant,
                ...(variant === "elevation" ? { elevation: (prev[editMode] as any)?.components?.[component]?.defaultProps?.elevation ?? 4 } : {}),
              },
            },
          },
        },
      }))
    },
    [editMode],
  )

  const updateComponentElevation = useCallback(
    (component: string, elevation: number) => {
      setThemeData((prev) => ({
        ...prev,
        [editMode]: {
          ...prev[editMode],
          components: {
            ...(prev[editMode] as any)?.components,
            [component]: {
              defaultProps: {
                ...(prev[editMode] as any)?.components?.[component]?.defaultProps,
                elevation,
              },
            },
          },
        },
      }))
    },
    [editMode],
  )

  const handleSave = async () => {
    try {
      await onSave({
        theme_data: stripBackgroundOverlayKeys(themeData),
        favicon_url: faviconUrl || null,
      })
      issueAlert({ severity: "success", message: t("theme.saveSuccess", "Theme saved successfully") })
    } catch {
      issueAlert({ severity: "error", message: t("theme.saveError", "Failed to save theme") })
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      await onReset()
      setThemeData({ light: {}, dark: {} })
      setFaviconUrl("")
      issueAlert({ severity: "success", message: t("theme.resetSuccess", "Theme reset to default") })
    } catch {
      issueAlert({ severity: "error", message: t("theme.resetError", "Failed to reset theme") })
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
                    value={getNestedValue(currentMode, field.path) || "#000000"}
                    onChange={(e) => updateValue(field.path, e.target.value)}
                    style={{ width: 32, height: 32, border: "none", cursor: "pointer", flexShrink: 0 }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" display="block" noWrap>
                      {t(field.labelKey, field.fallback)}
                    </Typography>
                    <TextField
                      size="small"
                      value={getNestedValue(currentMode, field.path) ?? ""}
                      onChange={(e) => updateValue(field.path, e.target.value)}
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

          {/* Style */}
          <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 1 }}>
            {t("theme.style", "Style")}
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("theme.paperStyle", "Paper Style")}</InputLabel>
                <Select
                  value={paperVariant}
                  label={t("theme.paperStyle", "Paper Style")}
                  onChange={(e) => updateComponentVariant("MuiPaper", e.target.value)}
                >
                  <MenuItem value="outlined">{t("theme.outlined", "Outlined")}</MenuItem>
                  <MenuItem value="elevation">{t("theme.elevation", "Elevation")}</MenuItem>
                </Select>
              </FormControl>
              {paperVariant === "elevation" && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">{t("theme.elevationLevel", "Elevation Level")}</Typography>
                  <Slider size="small" min={0} max={24} value={paperElevation} onChange={(_, v) => updateComponentElevation("MuiPaper", v as number)} valueLabelDisplay="auto" />
                </Box>
              )}
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("theme.cardStyle", "Card Style")}</InputLabel>
                <Select
                  value={cardVariant}
                  label={t("theme.cardStyle", "Card Style")}
                  onChange={(e) => updateComponentVariant("MuiCard", e.target.value)}
                >
                  <MenuItem value="outlined">{t("theme.outlined", "Outlined")}</MenuItem>
                  <MenuItem value="elevation">{t("theme.elevation", "Elevation")}</MenuItem>
                </Select>
              </FormControl>
              {cardVariant === "elevation" && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">{t("theme.elevationLevel", "Elevation Level")}</Typography>
                  <Slider size="small" min={0} max={24} value={cardElevation} onChange={(_, v) => updateComponentElevation("MuiCard", v as number)} valueLabelDisplay="auto" />
                </Box>
              )}
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("theme.navStyle", "Nav Style")}</InputLabel>
                <Select
                  value={navKind}
                  label={t("theme.navStyle", "Nav Style")}
                  onChange={(e) => updateValue(["navKind"], e.target.value)}
                >
                  <MenuItem value="outlined">{t("theme.outlined", "Outlined")}</MenuItem>
                  <MenuItem value="elevation">{t("theme.elevation", "Elevation")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Border Radius */}
          <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 1 }}>
            {t("theme.borderRadius", "Border Radius")}
          </Typography>
          <Box sx={{ mb: 1 }}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>{t("theme.unit", "Unit")}</InputLabel>
              <Select
                value={borderRadiusUnit}
                label={t("theme.unit", "Unit")}
                onChange={(e) => updateValue(["borderRadiusUnit"], e.target.value)}
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
                  min={0}
                  max={borderRadiusUnit === "px" ? 32 : borderRadiusUnit === "%" ? 50 : 3}
                  step={borderRadiusUnit === "px" ? 1 : borderRadiusUnit === "%" ? 1 : 0.125}
                  value={getNestedValue(currentMode, field.path) ?? (borderRadiusUnit === "px" ? 3 : 0.375)}
                  onChange={(_, v) => updateValue(field.path, v as number)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v}${borderRadiusUnit}`}
                />
                {field.key === "image" && (
                  <Box
                    component="img"
                    src="https://media.starcitizen.tools/thumb/9/93/Placeholderv2.png/399px-Placeholderv2.png.webp"
                    alt="Image radius preview"
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

          {/* Favicon */}
          <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 1 }}>
            {t("theme.favicon", "Favicon")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {faviconUrl && (
              <img
                src={faviconUrl}
                alt="favicon"
                style={{ width: 24, height: 24 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
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
            startIcon={isResetting ? <CircularProgress size={16} /> : <RestoreRounded />}
            onClick={() => setResetDialogOpen(true)}
            color="error"
            disabled={isResetting}
          >
            {t("theme.reset", "Reset to Default")}
          </Button>
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveRounded />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? t("theme.saving", "Saving...") : t("theme.save", "Save Theme")}
          </Button>
        </Box>
      </Grid>

      {/* Reset confirmation dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>{t("theme.resetConfirmTitle", "Reset Theme?")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("theme.resetConfirmMessage", "This will remove all custom theme settings and revert to the default theme. This action cannot be undone.")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button onClick={handleReset} color="error" disabled={isResetting}>
            {t("theme.reset", "Reset to Default")}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
