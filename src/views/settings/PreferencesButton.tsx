import { useTheme } from "@mui/material/styles"
import {
  Box,
  Fab,
  Grid,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Divider,
  Autocomplete,
  TextField,
} from "@mui/material"
import { SettingsRounded } from "@mui/icons-material"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import i18n, { languages } from "../../util/i18n"
import {
  useProfileUpdateLocale,
  useGetUserProfileQuery,
} from "../../store/profile"
import { useLightTheme } from "../../hooks/styles/LightTheme"

export function PreferencesButton() {
  const theme = useTheme()
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [lightTheme, setLightTheme] = useLightTheme()
  const [updateLocale] = useProfileUpdateLocale()
  const { data: userProfile } = useGetUserProfileQuery()

  const open = Boolean(anchorEl)

  // Initialize language from user profile if available
  useEffect(() => {
    if (userProfile?.locale && userProfile.locale !== i18n.language) {
      i18n.changeLanguage(userProfile.locale)
    }
  }, [userProfile?.locale])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

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
    <>
      <Fab
        aria-label={t("preferences.page_settings")}
        sx={{
          position: "absolute",
          right: theme.spacing(2),
          bottom: theme.spacing(2),
        }}
        color={"primary"}
        onClick={handleClick}
      >
        <SettingsRounded />
      </Fab>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        PaperProps={{
          variant: "outlined",
          sx: {
            borderRadius: 3,
            borderColor: theme.palette.outline.main,
          },
        }}
      >
        <Box sx={{ padding: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("preferences.theme")}
              </Typography>
              <ToggleButtonGroup
                value={lightTheme}
                exclusive
                onChange={(e, newChoice) =>
                  newChoice && setLightTheme(newChoice)
                }
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
              </ToggleButtonGroup>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
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
                getOptionLabel={(option) =>
                  `${option.endonym} (${option.exonym})`
                }
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
                isOptionEqualToValue={(option, value) =>
                  option.code === value.code
                }
              />
            </Grid>
          </Grid>
        </Box>
      </Popover>
    </>
  )
}
