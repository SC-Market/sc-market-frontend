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
import { useTestNotification } from "../../features/admin/hooks/useTestNotification"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { UserSearch } from "../../components/search/UserSearch"
import { User } from "../../datatypes/User"
import { useGetUserOrganizationsQuery } from "../../features/contractor/api/organizationsApi"
import type { AdminTestNotificationType } from "../../store/api/v2/market"

const NOTIFICATION_TYPES: readonly AdminTestNotificationType[] = [
  "order_create",
  "order_assigned",
  "order_message",
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
  const [notificationType, setNotificationType] = useState<
    AdminTestNotificationType | ""
  >("")
  const [targetUser, setTargetUser] = useState<User | null>(null)
  const [contractorId, setContractorId] = useState<string>("")
  const {
    run: runTest,
    isTesting,
    testResult,
    testError,
  } = useTestNotification()
  const { data: organizationsData } = useGetUserOrganizationsQuery()

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

  const handleTest = () =>
    runTest(notificationType, targetUser?.username, contractorId)

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
              <InputLabel id="admin-notification-test-type-label">
                {t(
                  "admin.notificationTest.notificationType",
                  "Notification Type",
                )}
              </InputLabel>
              <Select
                labelId="admin-notification-test-type-label"
                value={notificationType}
                onChange={(e) =>
                  setNotificationType(
                    NOTIFICATION_TYPES.find((n) => n === e.target.value) ?? "",
                  )
                }
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

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="admin-notification-test-contractor-label">
                {t(
                  "admin.notificationTest.contractor",
                  "Contractor (Optional - for org-scoped testing)",
                )}
              </InputLabel>
              <Select
                labelId="admin-notification-test-contractor-label"
                value={contractorId}
                onChange={(e) => setContractorId(e.target.value)}
                label={t(
                  "admin.notificationTest.contractor",
                  "Contractor (Optional - for org-scoped testing)",
                )}
              >
                <MenuItem value="">
                  <em>{t("adminUi.notificationTest.noneIndividual")}</em>
                </MenuItem>
                {organizationsData?.map((org) => (
                  <MenuItem key={org.contractor_id} value={org.contractor_id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
