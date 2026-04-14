import React, { useCallback, useMemo, useState } from "react"
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material"
import { SaveRounded, RestoreRounded } from "@mui/icons-material"
import { ThemePreview } from "./ThemePreview"
import { useTranslation } from "react-i18next"
import type { ThemeOptions } from "@mui/material"

interface ThemeEditorProps {
  initialThemeData: { light: Record<string, any>; dark: Record<string, any> }
  initialFaviconUrl: string | null
  onSave: (data: {
    theme_data: { light: Record<string, any>; dark: Record<string, any> }
    favicon_url: string | null
  }) => void
  onReset: () => void
  isSaving?: boolean
}

interface ColorField {
  key: string
  label: string
  path: string[] // path into ThemeOptions, e.g. ["palette", "primary", "main"]
}

const COLOR_FIELDS: ColorField[] = [
  { key: "primary", label: "Primary", path: ["palette", "primary", "main"] },
  { key: "secondary", label: "Secondary", path: ["palette", "secondary", "main"] },
  { key: "bgDefault", label: "Background", path: ["palette", "background", "default"] },
  { key: "bgPaper", label: "Paper", path: ["palette", "background", "paper"] },
  { key: "bgSidebar", label: "Sidebar", path: ["palette", "background", "sidebar"] },
  { key: "bgNavbar", label: "Navbar", path: ["palette", "background", "navbar"] },
]

function getNestedValue(obj: Record<string, any>, path: string[]): string {
  let current: any = obj
  for (const key of path) {
    if (!current || typeof current !== "object") return ""
    current = current[key]
  }
  return typeof current === "string" ? current : ""
}

function setNestedValue(
  obj: Record<string, any>,
  path: string[],
  value: string,
): Record<string, any> {
  const result = { ...obj }
  let current: any = result
  for (let i = 0; i < path.length - 1; i++) {
    current[path[i]] = { ...(current[path[i]] || {}) }
    current = current[path[i]]
  }
  current[path[path.length - 1]] = value
  return result
}

export function ThemeEditor({
  initialThemeData,
  initialFaviconUrl,
  onSave,
  onReset,
  isSaving,
}: ThemeEditorProps) {
  const { t } = useTranslation()
  const [editMode, setEditMode] = useState<"dark" | "light">("dark")
  const [themeData, setThemeData] = useState(initialThemeData)
  const [faviconUrl, setFaviconUrl] = useState(initialFaviconUrl ?? "")

  // Paper variant and navKind
  const currentMode = themeData[editMode] as Record<string, any>
  const paperVariant =
    currentMode?.components?.MuiPaper?.defaultProps?.variant ?? "outlined"
  const navKind = currentMode?.navKind ?? "outlined"

  const updateColor = useCallback(
    (path: string[], value: string) => {
      setThemeData((prev) => ({
        ...prev,
        [editMode]: setNestedValue(prev[editMode], path, value),
      }))
    },
    [editMode],
  )

  const updatePaperVariant = useCallback(
    (variant: string) => {
      setThemeData((prev) => ({
        ...prev,
        [editMode]: {
          ...prev[editMode],
          components: {
            MuiPaper: { defaultProps: { variant } },
            MuiCard: { defaultProps: { variant } },
          },
        },
      }))
    },
    [editMode],
  )

  const updateNavKind = useCallback(
    (value: string) => {
      setThemeData((prev) => ({
        ...prev,
        [editMode]: { ...prev[editMode], navKind: value },
      }))
    },
    [editMode],
  )

  const handleSave = () => {
    onSave({
      theme_data: themeData,
      favicon_url: faviconUrl || null,
    })
  }

  const previewThemeOptions = useMemo(
    () => themeData[editMode] as ThemeOptions,
    [themeData, editMode],
  )

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Tabs
          value={editMode}
          onChange={(_, v) => setEditMode(v)}
        >
          <Tab value="dark" label={t("theme.darkMode", "Dark Mode")} />
          <Tab value="light" label={t("theme.lightMode", "Light Mode")} />
        </Tabs>
      </Grid>

      {/* Color pickers */}
      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 2 }}>
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
                    onChange={(e) => updateColor(field.path, e.target.value)}
                    style={{ width: 32, height: 32, border: "none", cursor: "pointer" }}
                  />
                  <Box>
                    <Typography variant="caption" display="block">
                      {field.label}
                    </Typography>
                    <TextField
                      size="small"
                      value={getNestedValue(currentMode, field.path)}
                      onChange={(e) => updateColor(field.path, e.target.value)}
                      sx={{ "& input": { fontSize: 12, py: 0.5, px: 1 } }}
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            {t("theme.style", "Style")}
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("theme.paperStyle", "Paper Style")}</InputLabel>
                <Select
                  value={paperVariant}
                  label={t("theme.paperStyle", "Paper Style")}
                  onChange={(e) => updatePaperVariant(e.target.value)}
                >
                  <MenuItem value="outlined">Outlined (border)</MenuItem>
                  <MenuItem value="elevation">Elevation (shadow)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("theme.navStyle", "Nav Style")}</InputLabel>
                <Select
                  value={navKind}
                  label={t("theme.navStyle", "Nav Style")}
                  onChange={(e) => updateNavKind(e.target.value)}
                >
                  <MenuItem value="outlined">Outlined</MenuItem>
                  <MenuItem value="elevation">Elevation</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            {t("theme.favicon", "Favicon")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="https://example.com/favicon.ico"
            value={faviconUrl}
            onChange={(e) => setFaviconUrl(e.target.value)}
          />
        </Paper>
      </Grid>

      {/* Live preview */}
      <Grid item xs={12} md={5}>
        <Typography variant="subtitle2" gutterBottom>
          {t("theme.preview", "Preview")}
        </Typography>
        <ThemePreview themeData={previewThemeOptions} mode={editMode} />
      </Grid>

      {/* Actions */}
      <Grid item xs={12}>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button
            startIcon={<RestoreRounded />}
            onClick={onReset}
            color="error"
          >
            {t("theme.reset", "Reset to Default")}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveRounded />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {t("theme.save", "Save Theme")}
          </Button>
        </Box>
      </Grid>
    </Grid>
  )
}
