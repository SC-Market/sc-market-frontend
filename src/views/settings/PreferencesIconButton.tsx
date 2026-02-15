import React, { useState } from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { IconButton, Popover, Tooltip } from "@mui/material"
import { SettingsRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { PreferencesControls } from "../../components/settings/PreferencesControls"

export function PreferencesIconButton() {
  const theme = useTheme<ExtendedTheme>()
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
      <Tooltip title={t("preferences.page_settings")}>
        <IconButton
          aria-label={t("preferences.page_settings")}
          color="inherit"
          onClick={handleClick}
        >
          <SettingsRounded />
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
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
