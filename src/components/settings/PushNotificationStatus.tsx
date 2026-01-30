import { Box, Typography, Chip, Button, Alert } from "@mui/material"
import { getPushPermissionStatus, requestPushPermission } from "../../util/push-subscription"
import { useState, useCallback } from "react"

export function PushNotificationStatus() {
  const permissionStatus = getPushPermissionStatus()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleRequestPermission = useCallback(async () => {
    setError(null)
    try {
      const permission = await requestPushPermission()
      if (permission === "granted") {
        setSuccess("Permission granted! You can now subscribe to push notifications.")
      } else {
        setError(
          `Permission ${permission}. Please enable notifications in your browser settings.`,
        )
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to request permission",
      )
    }
  }, [])

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
        Permission Status:
      </Typography>
      <Chip
        label={
          permissionStatus === "granted"
            ? "Granted"
            : permissionStatus === "denied"
              ? "Denied"
              : "Not Requested"
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
          Request Permission
        </Button>
      )}
      {isPermissionDenied && (
        <Typography
          variant="caption"
          color="error"
          display="block"
          sx={{ mt: 1 }}
        >
          Please enable notifications in your browser settings to use push
          notifications.
        </Typography>
      )}
    </Box>
  )
}
