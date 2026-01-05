import { FlatSection } from "../../components/paper/Section"
import React, { useCallback, useEffect, useState } from "react"
import {
  Button,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
  Alert,
  CircularProgress,
  Box,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import EmailIcon from "@mui/icons-material/Email"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import {
  useGetEmailPreferencesQuery,
  useGetNotificationTypesQuery,
  useUpdateEmailPreferencesMutation,
  useAddEmailMutation,
  useUpdateEmailMutation,
  useDeleteEmailMutation,
  useRequestVerificationMutation,
  EmailPreference,
} from "../../store/email"
import { useTranslation } from "react-i18next"

/**
 * Email Settings Component
 * Allows users to:
 * - Add/update/delete email address
 * - Verify email address
 * - Manage email notification preferences per notification type
 */
export function EmailSettings() {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [addEmailDialogOpen, setAddEmailDialogOpen] = useState(false)
  const [editEmailDialogOpen, setEditEmailDialogOpen] = useState(false)
  const [deleteEmailDialogOpen, setDeleteEmailDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [selectedNotificationTypes, setSelectedNotificationTypes] = useState<
    number[]
  >([])
  const [resendCooldown, setResendCooldown] = useState<number>(0)

  // RTK Query hooks
  const {
    data: preferences,
    isLoading: preferencesLoading,
    isError: preferencesError,
  } = useGetEmailPreferencesQuery()
  const {
    data: notificationTypesData,
    isLoading: notificationTypesLoading,
  } = useGetNotificationTypesQuery()
  const [addEmail] = useAddEmailMutation()
  const [updateEmail] = useUpdateEmailMutation()
  const [deleteEmail] = useDeleteEmailMutation()
  const [requestVerification] = useRequestVerificationMutation()
  const [updatePreferences] = useUpdateEmailPreferencesMutation()

  // Check if user has email and if it's verified
  const hasEmail = !!preferences?.email
  const emailVerified = preferences?.email?.email_verified ?? false
  const userEmail = preferences?.email?.email || null

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  // Handle add email
  const handleAddEmail = useCallback(async () => {
    if (!newEmail || !newEmail.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const result = await addEmail({
        email: newEmail,
        notificationTypeIds: selectedNotificationTypes,
      }).unwrap()

      setSuccess(result.message || "Email added successfully!")
      setNewEmail("")
      setSelectedNotificationTypes([])
      setAddEmailDialogOpen(false)
    } catch (error: any) {
      setError(
        error?.data?.error?.message ||
          error?.message ||
          "Failed to add email address",
      )
      // Don't close dialog on error so user can retry
    }
  }, [newEmail, selectedNotificationTypes, addEmail])

  // Handle update email
  const handleUpdateEmail = useCallback(async () => {
    if (!newEmail || !newEmail.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const result = await updateEmail({ email: newEmail }).unwrap()
      setSuccess(result.message || "Email updated successfully!")
      setEditEmailDialogOpen(false)
      setNewEmail("")
    } catch (error: any) {
      setError(
        error?.data?.error?.message ||
          error?.message ||
          "Failed to update email address",
      )
    }
  }, [newEmail, updateEmail])

  // Handle delete email
  const handleDeleteEmail = useCallback(async () => {
    setError(null)
    setSuccess(null)

    try {
      const result = await deleteEmail().unwrap()
      setSuccess(result.message || "Email removed successfully!")
      setDeleteEmailDialogOpen(false)
    } catch (error: any) {
      setError(
        error?.data?.error?.message ||
          error?.message ||
          "Failed to remove email address",
      )
    }
  }, [deleteEmail])

  // Handle request verification with cooldown
  const handleRequestVerification = useCallback(async () => {
    if (resendCooldown > 0) {
      return // Still in cooldown
    }

    setError(null)
    setSuccess(null)

    // Set cooldown to 60 seconds
    setResendCooldown(60)

    try {
      const result = await requestVerification().unwrap()
      setSuccess(result.message || "Verification email sent!")
    } catch (error: any) {
      setError(
        error?.data?.error?.message ||
          error?.message ||
          "Failed to send verification email",
      )
      // Reset cooldown on error so user can retry
      setResendCooldown(0)
    }
  }, [requestVerification, resendCooldown])

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [resendCooldown])

  // Handle preference update or creation
  const handlePreferenceChange = useCallback(
    async (preference: EmailPreference | { action_type_id: number; action_name?: string }, enabled: boolean) => {
      setError(null)
      try {
        await updatePreferences({
          preferences: [
            {
              action_type_id: preference.action_type_id,
              enabled,
              frequency: (preference as EmailPreference).frequency || "immediate",
              digest_time: (preference as EmailPreference).digest_time || null,
            },
          ],
        }).unwrap()
        setSuccess(`Preference updated for ${preference.action_name || (preference as EmailPreference).action_name || "notification"}`)
        setTimeout(() => setSuccess(null), 2000)
      } catch (error: any) {
        setError(
          error?.data?.error?.message ||
            error?.message ||
            "Failed to update preference",
        )
      }
    },
    [updatePreferences],
  )

  // Get available notification types from API
  const availableNotificationTypes =
    notificationTypesData?.notificationTypes.map((type) => ({
      id: type.action_type_id,
      name: formatActionName(type.action),
      description: type.description,
    })) || []

  return (
    <FlatSection title="Email Notifications">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* Email Status Section */}
      <Grid item xs={12}>
        {preferencesLoading ? (
          <CircularProgress />
        ) : preferencesError ? (
          <Alert severity="error">
            Failed to load email settings. Please try again later.
          </Alert>
        ) : !hasEmail ? (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              You haven't added an email address yet. Add one to receive email
              notifications.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EmailIcon />}
              onClick={() => setAddEmailDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Add Email Address
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Email Address
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <EmailIcon color="action" />
              <Typography variant="body1">
                {userEmail || "Email configured"}
              </Typography>
              <Chip
                icon={
                  emailVerified ? (
                    <CheckCircleIcon />
                  ) : (
                    <CancelIcon color="error" />
                  )
                }
                label={emailVerified ? "Verified" : "Not Verified"}
                color={emailVerified ? "success" : "warning"}
                size="small"
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setEditEmailDialogOpen(true)}
              >
                Update Email
              </Button>
              {!emailVerified && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRequestVerification}
                  disabled={resendCooldown > 0}
                >
                  {resendCooldown > 0
                    ? `Resend Verification (${resendCooldown}s)`
                    : "Resend Verification"}
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteEmailDialogOpen(true)}
              >
                Remove Email
              </Button>
            </Box>
          </Box>
        )}
      </Grid>

      {/* Preferences Section */}
      {hasEmail && (
        <>
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which types of notifications you want to receive via email.
            </Typography>
          </Grid>

          {preferencesLoading || !notificationTypesData ? (
            <Grid item xs={12}>
              <CircularProgress />
            </Grid>
          ) : (
            // Show all available notification types, with existing preferences merged in
            availableNotificationTypes.map((type) => {
              const existingPreference = preferences?.preferences?.find(
                (pref) => pref.action_type_id === type.id,
              )
              const enabled = existingPreference?.enabled ?? false
              const frequency = existingPreference?.frequency ?? "immediate"
              const digestTime = existingPreference?.digest_time ?? null

              return (
                <Grid item xs={12} key={type.id}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={enabled}
                        onChange={(e) => {
                          // If preference doesn't exist, create it; otherwise update
                          if (existingPreference) {
                            handlePreferenceChange(existingPreference, e.target.checked)
                          } else {
                            // Create new preference
                            handlePreferenceChange(
                              {
                                preference_id: "",
                                action_type_id: type.id,
                                action_name: type.name,
                                enabled: false,
                                frequency: "immediate",
                                digest_time: null,
                                created_at: "",
                                updated_at: "",
                              },
                              e.target.checked,
                            )
                          }
                        }}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">
                          {type.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Frequency: {frequency}
                          {digestTime && ` at ${digestTime}`}
                        </Typography>
                      </Box>
                    }
                    labelPlacement="start"
                    sx={{ width: "100%", justifyContent: "space-between" }}
                  />
                </Grid>
              )
            })
          )}
        </>
      )}

      {/* Add Email Dialog */}
      <Dialog
        open={addEmailDialogOpen}
        onClose={() => setAddEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Email Address</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select which notification types you want to enable:
          </Typography>
          <FormGroup>
            {availableNotificationTypes.map((type) => (
              <FormControlLabel
                key={type.id}
                control={
                  <Checkbox
                    checked={selectedNotificationTypes.includes(type.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNotificationTypes([
                          ...selectedNotificationTypes,
                          type.id,
                        ])
                      } else {
                        setSelectedNotificationTypes(
                          selectedNotificationTypes.filter((id) => id !== type.id),
                        )
                      }
                    }}
                  />
                }
                label={type.name}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddEmail} variant="contained" color="primary">
            Add Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Email Dialog */}
      <Dialog
        open={editEmailDialogOpen}
        onClose={() => setEditEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Email Address</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            You will need to verify your new email address after updating.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateEmail} variant="contained" color="primary">
            Update Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Email Dialog */}
      <Dialog
        open={deleteEmailDialogOpen}
        onClose={() => setDeleteEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Remove Email Address</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to remove your email address? You will no
            longer receive email notifications.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteEmailDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteEmail}
            variant="contained"
            color="error"
          >
            Remove Email
          </Button>
        </DialogActions>
      </Dialog>
    </FlatSection>
  )
}

/**
 * Get user-friendly label for notification action type
 */
function formatActionName(actionName: string): string {
  if (!actionName) return "Unknown Notification"
  
  const actionLabels: Record<string, string> = {
    // Order notifications
    order_create: "New Order Created",
    order_assigned: "Order Assigned to You",
    order_status_fulfilled: "Order Fulfilled",
    order_status_in_progress: "Order In Progress",
    order_status_not_started: "Order Not Started",
    order_status_cancelled: "Order Cancelled",
    order_comment: "Order Comments",
    order_message: "Order Messages",
    order_review: "Order Reviews",
    order_review_revision_requested: "Review Revision Requested",
    order_contractor_applied: "Contractor Applied to Order",
    public_order_create: "New Public Order",

    // Market notifications
    market_item_bid: "Market Item Bids",
    market_item_offer: "Market Item Offers",
    market_bid_accepted: "Market Bid Accepted",
    market_bid_declined: "Market Bid Declined",
    market_offer_accepted: "Market Offer Accepted",
    market_offer_declined: "Market Offer Declined",

    // Offer notifications
    offer_create: "New Offers",
    offer_message: "Offer Messages",
    counter_offer_create: "Counter Offers",

    // Contractor notifications
    contractor_invite: "Contractor Invitations",

    // Admin notifications
    admin_alert: "Admin Alerts",
  }

  return (
    actionLabels[actionName] ||
    actionName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  )
}
