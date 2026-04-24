import {
  Box,
  Grid,
  Divider,
  Autocomplete,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { languages } from "../../util/i18n"
import { useLightTheme, ThemeChoice } from "../../hooks/styles/LightTheme"
import { CUSTOM_THEMES } from "../../hooks/styles/custom_themes"
import {
  useProfileUpdateLocale,
  useGetUserProfileQuery,
} from "../../store/profile"
import { useEffect, useMemo, useCallback, useState } from "react"

const FONT_OPTIONS = [
  { label: "Default (Roboto)", value: "" },
  { label: "Electrolize (SC-style)", value: "Electrolize", url: "https://fonts.googleapis.com/css2?family=Electrolize&display=swap" },
  { label: "Orbitron", value: "Orbitron", url: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap" },
  { label: "Rajdhani", value: "Rajdhani", url: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;700&display=swap" },
  { label: "Exo 2", value: "Exo 2", url: "https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&display=swap" },
  { label: "Jura", value: "Jura", url: "https://fonts.googleapis.com/css2?family=Jura:wght@400;500;700&display=swap" },
  { label: "Share Tech Mono", value: "Share Tech Mono", url: "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" },
  { label: "JetBrains Mono", value: "JetBrains Mono", url: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" },
]

function loadFont(fontValue: string) {
  const opt = FONT_OPTIONS.find((f) => f.value === fontValue)
  if (!opt?.url) return
  const id = `font-${fontValue.replace(/\s/g, "-")}`
  if (document.getElementById(id)) return
  const link = document.createElement("link")
  link.id = id
  link.rel = "stylesheet"
  link.href = opt.url
  document.head.appendChild(link)
}

function applyFont(fontValue: string) {
  if (!fontValue) {
    document.documentElement.style.removeProperty("--sc-custom-font")
    document.body.style.fontFamily = ""
    return
  }
  loadFont(fontValue)
  const stack = `"${fontValue}", "Roboto", Arial, sans-serif`
  document.documentElement.style.setProperty("--sc-custom-font", stack)
  document.body.style.fontFamily = stack
}

function getStoredFont(): string {
  try { return localStorage.getItem("sc-admin-font") || "" } catch { return "" }
}

/** Cyberbunk-style theme preset swatch */
function ThemePresetSwatch({ name, onClick, isActive }: { name: string; onClick: () => void; isActive: boolean }) {
  const themeObj = CUSTOM_THEMES.get(name)
  const primary = themeObj?.palette?.primary?.main || "#888"
  const bg = themeObj?.palette?.background?.default || "#1A1A2E"

  return (
    <Tooltip title={name.replace(/_/g, " ")} placement="top">
      <Box
        onClick={onClick}
        sx={{
          width: 22,
          height: 22,
          borderRadius: 0.5,
          cursor: "pointer",
          border: isActive ? "2px solid" : "1px solid",
          borderColor: isActive ? "primary.main" : "divider",
          background: `linear-gradient(to right, ${primary} 50%, ${bg} 50%)`,
          transition: "transform 0.15s, box-shadow 0.15s",
          "&:hover": { transform: "scale(1.2)", boxShadow: `0 0 8px ${primary}` },
          flexShrink: 0,
        }}
      />
    </Tooltip>
  )
}

export function PreferencesControls() {
  const theme = useTheme<ExtendedTheme>()
  const { t, i18n } = useTranslation()
  const [lightTheme, setLightTheme] = useLightTheme()
  const [updateLocale] = useProfileUpdateLocale()
  const { data: userProfile } = useGetUserProfileQuery()
  const isDev = import.meta.env.DEV || import.meta.env.MODE === "development"
  const isAdmin = userProfile?.role === "admin"

  const [selectedFont, setSelectedFont] = useState(getStoredFont)

  // Apply stored font on mount
  useEffect(() => { if (selectedFont) applyFont(selectedFont) }, [])

  const handleFontChange = useCallback((value: string) => {
    setSelectedFont(value)
    try { localStorage.setItem("sc-admin-font", value) } catch {}
    applyFont(value)
  }, [])

  const themeNames = useMemo(() => Array.from(CUSTOM_THEMES.keys()), [])

  // Initialize language from user profile if available
  useEffect(() => {
    if (userProfile?.locale && userProfile.locale !== i18n.language) {
      i18n.changeLanguage(userProfile.locale)
    }
  }, [userProfile?.locale, i18n])

  const handleLanguageChange = async (language: string) => {
    try {
      // Update the backend with the new locale
      await updateLocale({ locale: language }).unwrap()
      // Update the frontend i18n
      i18n.changeLanguage(language)
    } catch (error) {
      console.error("Failed to update locale:", error)
      // Still update the frontend even if backend fails
      i18n.changeLanguage(language)
    }
  }

  const currentLanguage = i18n.language

  // Add exonyms to the languages array dynamically
  const languagesWithExonyms = languages.map((lang) => ({
    ...lang,
    exonym: t(`languages.${lang.code}`),
  }))

  return (
    <Box sx={{ padding: 1.5 }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {t("preferences.theme")}
          </Typography>
          {isDev || isAdmin ? (
            <>
              {/* Base theme toggle */}
              <ToggleButtonGroup
                value={["light", "dark", "system"].includes(lightTheme) ? lightTheme : null}
                exclusive
                onChange={(e, v) => v && setLightTheme(v)}
                size="small"
                fullWidth
                sx={{ mb: 1 }}
              >
                <ToggleButton value="light">{t("preferences.light")}</ToggleButton>
                <ToggleButton value="dark">{t("preferences.dark")}</ToggleButton>
                <ToggleButton value="system">{t("preferences.system", "System")}</ToggleButton>
              </ToggleButtonGroup>

              {/* Cyberbunk-style preset swatches */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxWidth: 240 }}>
                {themeNames.map((name) => (
                  <ThemePresetSwatch
                    key={name}
                    name={name}
                    isActive={lightTheme === name}
                    onClick={() => setLightTheme(name as ThemeChoice)}
                  />
                ))}
              </Box>
            </>
          ) : (
            <ToggleButtonGroup
              value={lightTheme}
              exclusive
              onChange={(e, newChoice) => newChoice && setLightTheme(newChoice)}
              size="small"
              sx={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                "& .MuiToggleButton-root": {
                  border: "none",
                  borderRadius: 0,
                  color: theme.palette.text.primary,
                  backgroundColor: "transparent",
                  "&:first-of-type": {
                    borderTopLeftRadius: theme.shape.borderRadius,
                    borderBottomLeftRadius: theme.shape.borderRadius,
                  },
                  "&:last-of-type": {
                    borderTopRightRadius: theme.shape.borderRadius,
                    borderBottomRightRadius: theme.shape.borderRadius,
                  },
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  },
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                  "&.Mui-disabled": {
                    backgroundColor: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled,
                  },
                },
              }}
            >
              <ToggleButton value={"light"} color={"primary"}>
                {t("preferences.light")}
              </ToggleButton>
              <ToggleButton value={"dark"} color={"primary"}>
                {t("preferences.dark")}
              </ToggleButton>
              <ToggleButton value={"system"} color={"primary"}>
                {t("preferences.system", "System")}
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 0.5 }} />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {t("preferences.language")}
          </Typography>
          <Autocomplete
            value={
              languagesWithExonyms.find(
                (lang) => lang.code === currentLanguage,
              ) || null
            }
            onChange={(event, newValue) => {
              if (newValue) {
                handleLanguageChange(newValue.code)
              }
            }}
            options={languagesWithExonyms}
            getOptionLabel={(option) => `${option.endonym} (${option.exonym})`}
            slotProps={{
              popper: {
                disablePortal: true,
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder={t("preferences.select_language")}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {option.endonym}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.exonym}
                  </Typography>
                </Box>
              </Box>
            )}
            isOptionEqualToValue={(option, value) => option.code === value.code}
          />
        </Grid>

        {/* Font selector — admin only */}
        {(isDev || isAdmin) && (
          <>
            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {t("preferences.font", "Font")}
              </Typography>
              <Autocomplete
                value={FONT_OPTIONS.find((f) => f.value === selectedFont) || FONT_OPTIONS[0]}
                onChange={(_, v) => v && handleFontChange(v.value)}
                options={FONT_OPTIONS}
                getOptionLabel={(o) => o.label}
                isOptionEqualToValue={(a, b) => a.value === b.value}
                renderInput={(params) => (
                  <TextField {...params} size="small" placeholder="Select font" />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ fontFamily: option.value ? `"${option.value}", sans-serif` : undefined }}>
                    {option.label}
                  </Box>
                )}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  )
}
