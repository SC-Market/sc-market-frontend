import { Box, Typography, Chip, Button, Alert } from "@mui/material"
import {
  getPushPermissionStatus,
  requestPushPermission,
} from "../../../util/push-subscription"
import { useState, useCallback } from "react"
import { useTranslation } from "react-i18next"

export function PushNotificationStatus() {
  const { t } = useTranslation()
  const permissionStatus = getPushPermissionStatus()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleRequestPermission = useCallback(async () => {
    setError(null)
    try {
      const permission = await requestPushPermission()
      if (permission === "granted") {
        setSuccess(t("settings.pushNotifications.permissionGrantedMessage"))
      } else {
        setError(
          t("settings.pushNotifications.permissionDeniedError", {
            status: permission,
          }),
        )
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to request permission",
      )
    }
  }, [t])

  const isPermissionGranted = permissionStatus === "granted"
  const isPermissionDenied = permissionStatus === "denied"

  return (
    <Box sx={{ mb: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {t("settings.pushNotifications.permissionStatus")}:
      </Typography>
      <Chip
        label={
          permissionStatus === "granted"
            ? t("settings.pushNotifications.granted")
            : permissionStatus === "denied"
              ? t("settings.pushNotifications.denied")
              : t("settings.pushNotifications.notRequested")
        }
        color={
          permissionStatus === "granted"
            ? "success"
            : permissionStatus === "denied"
              ? "error"
              : "default"
        }
        size="small"
        sx={{ mr: 1 }}
      />
      {!isPermissionGranted && !isPermissionDenied && (
        <Button
          size="small"
          variant="outlined"
          onClick={handleRequestPermission}
        >
          {t("settings.pushNotifications.requestPermission")}
        </Button>
      )}
      {isPermissionDenied && (
        <Typography
          variant="caption"
          color="error"
          display="block"
          sx={{ mt: 1 }}
        >
          {t("settings.pushNotifications.permissionDeniedMessage")}
        </Typography>
      )}
    </Box>
  )
}
