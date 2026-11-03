import React from "react"
import { Alert, Snackbar, SnackbarCloseReason } from "@mui/material"
import { AlertInterface } from "../../datatypes/Alert"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"

/** How long a non-error popup stays up. Errors stay until dismissed. */
export const ALERT_AUTO_HIDE_MS = 5000

/**
 * The popup's distance from the bottom: on phones it clears the bottom nav
 * (0 while the keyboard hides it) and the home-indicator safe area.
 */
export function alertBottomOffset(bottomNavHeight: number) {
  return {
    xs: `calc(${bottomNavHeight + 8}px + env(safe-area-inset-bottom))`,
    sm: "calc(24px + env(safe-area-inset-bottom))",
  }
}

/**
 * The site's shared alert popup (useAlertHook).
 *
 * It sits bottom-center, sized to its message, above the phone's bottom nav
 * and the safe area. Only the alert itself takes clicks: the Snackbar's
 * root spans the screen's width on phones, and without `pointer-events:
 * none` on it the empty space around the alert swallowed clicks on the
 * page's controls underneath (Price Alerts' remove button).
 *
 * Success, info and warning messages close themselves; errors stay until
 * the visitor closes them. A click elsewhere on the page dismisses neither.
 */
export function AlertSnackbar(props: {
  alert: AlertInterface | null
  onClose: () => void
}) {
  const { alert, onClose } = props
  const bottomNavHeight = useBottomNavHeight()
  const isError = alert?.severity === "error"

  // A new message restarts the auto-hide timer: MUI only restarts it when
  // `open` changes, so key the Snackbar on each message.
  const seq = React.useRef(0)
  const last = React.useRef<AlertInterface | null>(null)
  if (alert && alert !== last.current) seq.current += 1
  last.current = alert

  const handleClose = (
    _event: React.SyntheticEvent | Event | null,
    reason?: SnackbarCloseReason,
  ) => {
    // Clicks pass through to the page, so a click elsewhere is not a
    // dismissal (and would close a message the same click just issued).
    if (reason === "clickaway") return
    onClose()
  }

  return (
    <Snackbar
      key={seq.current}
      open={!!alert}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      autoHideDuration={isError ? null : ALERT_AUTO_HIDE_MS}
      onClose={handleClose}
      data-testid="alert-snackbar"
      sx={{
        bottom: alertBottomOffset(bottomNavHeight),
        pointerEvents: "none",
      }}
    >
      <Alert
        onClose={() => onClose()}
        severity={alert?.severity}
        variant="filled"
        sx={{
          pointerEvents: "auto",
          width: "fit-content",
          maxWidth: { xs: "100%", sm: 560 },
          mx: "auto",
        }}
      >
        {alert?.message}
      </Alert>
    </Snackbar>
  )
}
