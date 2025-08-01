import { useLightTheme } from "../../hooks/styles/LightTheme"
import {
  Box,
  Fab,
  Grid,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { SettingsRounded } from "@mui/icons-material"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

export function PreferencesButton() {
  const [lightTheme, setLightTheme] = useLightTheme()
  const theme = useTheme()
  const { t } = useTranslation()

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

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
              <Typography>{t("preferences.theme")}</Typography>
              <ToggleButtonGroup
                value={lightTheme}
                exclusive
                onChange={(e, newChoice) =>
                  newChoice && setLightTheme(newChoice)
                }
              >
                <ToggleButton value={"light"} color={"primary"}>
                  {t("preferences.light")}
                </ToggleButton>
                <ToggleButton value={"dark"} color={"primary"}>
                  {t("preferences.dark")}
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Box>
      </Popover>
    </>
  )
}
