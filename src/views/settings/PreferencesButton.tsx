import React, { useState } from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Fab, Popover, useMediaQuery } from "@mui/material"
import { SettingsRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { PreferencesControls } from "../../components/settings/PreferencesControls"

export function PreferencesButton() {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
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
          // On mobile, position above bottom nav (64px height + 16px spacing)
          bottom: isMobile ? theme.spacing(10) : theme.spacing(2),
          zIndex: theme.zIndex.drawer + 2, // Above bottom nav
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
            borderRadius: (theme) => theme.spacing(theme.borderRadius.topLevel),
            borderColor: theme.palette.outline.main,
          },
        }}
      >
        <PreferencesControls />
      </Popover>
    </>
  )
}
