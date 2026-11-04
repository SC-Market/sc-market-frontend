import { useTranslation } from "react-i18next"
import React, { useEffect, useState } from "react"
import { Snackbar, Alert, Button, Stack, Typography } from "@mui/material"
import { RefreshRounded } from "@mui/icons-material"
import {
  subscribe,
  getRegistrationState,
  reloadForUpdate,
} from "../../util/pwa"

export function UpdateNotification() {
  const { t } = useTranslation()
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      // Get initial state
      const state = getRegistrationState()
      setUpdateAvailable(state.updateAvailable)
      setOpen(state.updateAvailable)

      // Subscribe to state changes
      const unsubscribe = subscribe((state) => {
        setUpdateAvailable(state.updateAvailable)
        setOpen(state.updateAvailable)
      })

      return unsubscribe
    } catch (error) {
      console.warn("UpdateNotification setup failed:", error)
      return () => {}
    }
  }, [])

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return
    }
    setOpen(false)
  }

  const handleReload = () => {
    reloadForUpdate()
  }

  if (!updateAvailable) {
    return null
  }

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      autoHideDuration={null}
      onClose={handleClose}
    >
      <Alert
        severity="info"
        variant="filled"
        sx={{ width: "100%" }}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              color="inherit"
              size="small"
              onClick={handleReload}
              startIcon={<RefreshRounded />}
            >
              {t("ui.pwaUpdate")}
            </Button>
            <Button color="inherit" size="small" onClick={handleClose}>
              {t("ui.pwaLater")}
            </Button>
          </Stack>
        }
      >
        <Typography variant="body2">{t("ui.pwaUpdateBody")}</Typography>
      </Alert>
    </Snackbar>
  )
}
