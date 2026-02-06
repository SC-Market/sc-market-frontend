import React, { useEffect, useState } from "react"
import { Snackbar, Alert } from "@mui/material"
import { subscribe, getRegistrationState } from "../../util/pwa"
import type { ServiceWorkerRegistrationState } from "../../util/pwa"

export function OfflineIndicator() {
  const [offline, setOffline] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      // Get initial state
      const state = getRegistrationState()
      setOffline(state.offline)
      setOpen(state.offline)

      // Subscribe to state changes
      const unsubscribe = subscribe((state) => {
        setOffline(state.offline)
        setOpen(state.offline)
      })

      return unsubscribe
    } catch (error) {
      console.warn("OfflineIndicator setup failed:", error)
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

  if (!offline) {
    return null
  }

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      autoHideDuration={null}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity="warning"
        variant="filled"
        sx={{ width: "100%" }}
      >
        You&apos;re offline. Some features may be limited.
      </Alert>
    </Snackbar>
  )
}
