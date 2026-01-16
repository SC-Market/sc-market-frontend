import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Box,
  Paper,
  Alert,
  CircularProgress,
  MenuProps,
} from "@mui/material"
import { useTestNotificationMutation } from "../../store/admin"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { UserSearch } from "../../components/search/UserSearch"
import { User } from "../../datatypes/User"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

const NOTIFICATION_TYPES = [
  "order_create",
  "order_assigned",
  "order_message",
  "order_comment",
  "order_review",
  "order_status_fulfilled",
  "order_status_in_progress",
  "order_status_not_started",
  "order_status_cancelled",
  "offer_create",
  "counter_offer_create",
  "offer_message",
  "market_item_bid",
  "market_item_offer",
  "contractor_invite",
  "admin_alert",
  "order_review_revision_requested",
]

export function AdminNotificationTestView() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [notificationType, setNotificationType] = useState<string>("")
  const [targetUser, setTargetUser] = useState<User | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [testError, setTestError] = useState<string>("")

  const [testNotification, { isLoading: isTesting }] =
    useTestNotificationMutation()

  const issueAlert = useAlertHook()

  const handleUserSelect = (user: User) => {
    setTargetUser(user)
  }

  // Custom menu props for 2-column layout
  const menuProps: Partial<MenuProps> = {
    PaperProps: {
      style: {
        maxHeight: 400,
        width: 500,
      },
    },
    MenuListProps: {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0,
      },
    },
  }

  const handleTest = async () => {
    if (!notificationType || !targetUser || !targetUser.username) {
      issueAlert({
        message: t(
          "admin.notificationTest.fillAllFields",
          "Please fill all fields",
        ),
        severity: "error",
      })
      return
    }

    setTestResult(null)
    setTestError("")

    try {
      const result = await testNotification({
        notification_type: notificationType,
        target_username: targetUser.username,
      }).unwrap()

      setTestResult(result)
      issueAlert({
        message: t(
          "admin.notificationTest.success",
          "Notification test completed successfully",
        ),
        severity: "success",
      })
    } catch (error: any) {
      // Handle error response structure: { error: { code, message } }
      let errorMessage: string
      if (error?.data?.error) {
        if (typeof error.data.error === "string") {
          errorMessage = error.data.error
        } else if (error.data.error?.message) {
          errorMessage = error.data.error.message
        } else {
          errorMessage = JSON.stringify(error.data.error)
        }
      } else if (error?.message) {
        errorMessage = error.message
      } else {
        errorMessage = t(
          "admin.notificationTest.error",
          "Failed to test notification",
        )
      }
      setTestError(errorMessage)
      issueAlert({
        message: errorMessage,
        severity: "error",
      })
    }
  }

  return (
    <Box>
      <HeaderTitle>
        {t("admin.notificationTest.title", "Test Notifications")}
      </HeaderTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t(
          "admin.notificationTest.description",
          "Test any notification type using real data from the database. The system will find the first available entity and trigger the notification, which will be created and dispatched (sent via push notifications and email) to the selected user.",
        )}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>
                {t(
                  "admin.notificationTest.notificationType",
                  "Notification Type",
                )}
              </InputLabel>
              <Select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                label={t(
                  "admin.notificationTest.notificationType",
                  "Notification Type",
                )}
                MenuProps={menuProps}
              >
                {NOTIFICATION_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {t("admin.notificationTest.targetUser", "Target User")}
              </Typography>
              <UserSearch
                onUserSelect={handleUserSelect}
                placeholder={t(
                  "admin.notificationTest.selectUser",
                  "Search for a user to receive the test notification",
                )}
              />
              {targetUser && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  {t(
                    "admin.notificationTest.selectedUser",
                    "Selected: {{username}}",
                    {
                      username: targetUser.display_name || targetUser.username,
                    },
                  )}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleTest}
              disabled={
                isTesting ||
                !notificationType ||
                !targetUser ||
                !targetUser.username
              }
              startIcon={isTesting ? <CircularProgress size={20} /> : null}
            >
              {isTesting
                ? t("admin.notificationTest.testing", "Testing...")
                : t("admin.notificationTest.test", "Test Notification")}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {testError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {testError}
        </Alert>
      )}

      {testResult && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t("admin.notificationTest.result", "Test Result")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {testResult.message}
          </Typography>
          {testResult.data && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t("admin.notificationTest.entityData", "Entity Data Used:")}
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 1,
                  overflow: "auto",
                  fontSize: "0.875rem",
                }}
              >
                {JSON.stringify(testResult.data, null, 2)}
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  )
}
