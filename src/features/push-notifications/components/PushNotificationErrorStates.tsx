import { FlatSection } from "../../../components/paper/Section"
import { Alert, Typography, Box, Button } from "@mui/material"
import { GetAppRounded } from "@mui/icons-material"
import { usePWAInstallPrompt } from "../../../hooks/pwa/usePWAInstallPrompt"
import { useState } from "react"

interface PushNotificationErrorStatesProps {
  isSupported: boolean
  isAndroid: boolean
  androidErrorMessage: string | null
  pwaInstalled: boolean
  requiresPWAInstall: boolean
  pwaInstallMessage: string
  isConfigured: boolean
}

export function PushNotificationErrorStates({
  isSupported,
  isAndroid,
  androidErrorMessage,
  pwaInstalled,
  requiresPWAInstall,
  pwaInstallMessage,
  isConfigured,
}: PushNotificationErrorStatesProps) {
  const { canInstall, triggerInstall } = usePWAInstallPrompt()
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isSupported) {
    return (
      <FlatSection title="Push Notifications">
        <Alert severity="warning">
          Push notifications are not supported in this browser.
        </Alert>
      </FlatSection>
    )
  }

  if (isAndroid && androidErrorMessage) {
    return (
      <FlatSection title="Push Notifications">
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Android Push Notification Requirements
          </Typography>
          <Typography variant="body2">{androidErrorMessage}</Typography>
        </Alert>
        {!pwaInstalled && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please install this app as a PWA to enable push notifications on
              Android.
            </Typography>
            {canInstall && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<GetAppRounded />}
                onClick={async () => {
                  const success = await triggerInstall()
                  if (success) {
                    setSuccess(
                      "App installed! You can now enable push notifications.",
                    )
                  } else {
                    setError(
                      "Installation was cancelled or failed. Please try again.",
                    )
                  }
                }}
              >
                Install App
              </Button>
            )}
          </Box>
        )}
      </FlatSection>
    )
  }

  if (!isConfigured) {
    return (
      <FlatSection title="Push Notifications">
        <Alert severity="warning" sx={{ mb: 2 }}>
          Push notifications are not configured on this server. Please contact
          support if you believe this is an error.
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Push notification functionality requires server configuration. The
          feature is currently disabled.
        </Typography>
      </FlatSection>
    )
  }

  if (requiresPWAInstall) {
    return (
      <FlatSection title="Push Notifications">
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Installation Required
          </Typography>
          <Typography variant="body2">{pwaInstallMessage}</Typography>
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Once installed, you can return here to enable push notifications.
          </Typography>
          {canInstall && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<GetAppRounded />}
              onClick={async () => {
                const success = await triggerInstall()
                if (success) {
                  setSuccess(
                    "App installed! You can now enable push notifications.",
                  )
                } else {
                  setError(
                    "Installation was cancelled or failed. Please try again.",
                  )
                }
              }}
              sx={{ mb: 2 }}
            >
              Install App
            </Button>
          )}
          {!pwaInstalled && (
            <Typography variant="body2" color="text.secondary">
              Current status: Not installed as PWA
            </Typography>
          )}
        </Box>
      </FlatSection>
    )
  }

  return null
}
