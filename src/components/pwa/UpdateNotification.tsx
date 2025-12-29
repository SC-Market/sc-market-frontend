import React, { useEffect, useState } from "react"
import { Box, Snackbar, Alert, Button, Stack, Typography } from "@mui/material"
import { RefreshRounded } from "@mui/icons-material"
import {
  subscribe,
  getRegistrationState,
  reloadForUpdate,
} from "../../util/pwa"
import type { ServiceWorkerRegistrationState } from "../../util/pwa"

export function UpdateNotification() {
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
              Update
            </Button>
            <Button color="inherit" size="small" onClick={handleClose}>
              Later
            </Button>
          </Stack>
        }
      >
        <Typography variant="body2">
          A new version is available. Update now to get the latest features.
        </Typography>
      </Alert>
    </Snackbar>
  )
}
