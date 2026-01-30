import { FlatSection } from "../../components/paper/Section"
import React, { useCallback, useEffect, useState } from "react"
import { Grid, Alert } from "@mui/material"
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
import { PushPreference } from "../../store/push-notifications"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useGetUserOrganizationsQuery } from "../../store/organizations"
import { PreferenceSection } from "../../components/settings/PreferenceSection"
import { OrganizationPreferenceSelector } from "../../components/settings/OrganizationPreferenceSelector"
import { EmailStatus } from "../../components/settings/EmailStatus"
import { AddEmailDialog } from "../../components/settings/AddEmailDialog"
import { EditEmailDialog } from "../../components/settings/EditEmailDialog"
import { DeleteEmailDialog } from "../../components/settings/DeleteEmailDialog"

/**
 * Email Settings Component
 * Allows users to:
 * - Add/update/delete email address
 * - Verify email address
 * - Manage email notification preferences per notification type
 */
export function EmailSettings() {
  const issueAlert = useAlertHook()
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
    refetch: refetchPreferences,
  } = useGetEmailPreferencesQuery(undefined, {
    // Refetch when component mounts to ensure fresh data after unsubscribe
    refetchOnMountOrArgChange: true,
  })
  const { data: notificationTypesData, isLoading: notificationTypesLoading } =
    useGetNotificationTypesQuery()
  const { data: organizationsData, isLoading: organizationsLoading } =
    useGetUserOrganizationsQuery()
  const [addEmail] = useAddEmailMutation()
  const [updateEmail] = useUpdateEmailMutation()
  const [deleteEmail] = useDeleteEmailMutation()
  const [requestVerification] = useRequestVerificationMutation()
  const [updatePreferences] = useUpdateEmailPreferencesMutation()

  // Check if user has email and if it's verified
  const hasEmail = !!preferences?.email
  const emailVerified = preferences?.email?.email_verified ?? false
  const userEmail = preferences?.email?.email || null

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
    async (
      preference:
        | EmailPreference
        | { action_type_id: number; action_name?: string },
      enabled: boolean,
      contractorId?: string | null,
    ) => {
      try {
        await updatePreferences({
          preferences: [
            {
              action_type_id: preference.action_type_id,
              enabled,
              frequency:
                (preference as EmailPreference).frequency || "immediate",
              digest_time: (preference as EmailPreference).digest_time || null,
              contractor_id: contractorId ?? null,
            },
          ],
        }).unwrap()
        issueAlert({
          message: `Preference updated for ${preference.action_name || (preference as EmailPreference).action_name || "notification"}`,
          severity: "success",
        })
      } catch (error: any) {
        issueAlert({
          message:
            error?.data?.error?.message ||
            error?.message ||
            "Failed to update preference",
          severity: "error",
        })
      }
    },
    [updatePreferences, issueAlert],
  )

  const handleBatchPreferenceChange = useCallback(
    async (
      updates: Array<{
        preference: EmailPreference | PushPreference
        enabled: boolean
      }>,
      contractorId?: string | null,
    ) => {
      try {
        // Use contractor_id from preference if available, otherwise use parameter
        const emailPreferences = updates
          .map(({ preference, enabled }) => {
            const emailPref = preference as EmailPreference
            if (emailPref.action_type_id) {
              return {
                action_type_id: emailPref.action_type_id,
                enabled,
                frequency: emailPref.frequency || "immediate",
                digest_time: emailPref.digest_time || null,
                contractor_id: emailPref.contractor_id ?? contractorId ?? null,
              }
            }
            return null
          })
          .filter((p): p is NonNullable<typeof p> => p !== null)

        if (emailPreferences.length > 0) {
          await updatePreferences({
            preferences: emailPreferences,
          }).unwrap()
          issueAlert({
            message: `Updated ${emailPreferences.length} notification preference${emailPreferences.length !== 1 ? "s" : ""}`,
            severity: "success",
          })
        }
      } catch (error: any) {
        issueAlert({
          message:
            error?.data?.error?.message ||
            error?.message ||
            "Failed to update preferences",
          severity: "error",
        })
      }
    },
    [updatePreferences, issueAlert],
  )

  // Get available notification types from API
  const availableNotificationTypes =
    notificationTypesData?.notificationTypes.map((type) => ({
      id: type.action_type_id,
      name: formatActionName(type.action),
      description: type.description || undefined,
      action: type.action, // Include for consistency with push preferences
    })) || []

  return (
    <Grid container spacing={2}>
      {error && (
        <Grid item xs={12}>
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      {success && (
        <Grid item xs={12}>
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        </Grid>
      )}

      {/* Email Status Section */}
      <Grid item xs={12}>
        <FlatSection title="Email Address">
          <EmailStatus
            email={userEmail}
            emailVerified={emailVerified}
            isLoading={preferencesLoading}
            isError={preferencesError}
            resendCooldown={resendCooldown}
            onAddEmail={() => setAddEmailDialogOpen(true)}
            onEditEmail={() => {
              setNewEmail(userEmail || "")
              setEditEmailDialogOpen(true)
            }}
            onDeleteEmail={() => setDeleteEmailDialogOpen(true)}
            onRequestVerification={handleRequestVerification}
          />
        </FlatSection>
      </Grid>

      {/* Individual Preferences Section */}
      {hasEmail && (
        <Grid item xs={12}>
          <PreferenceSection
            title="Individual Notifications"
            preferences={preferences?.preferences?.individual || []}
            notificationTypes={availableNotificationTypes}
            onPreferenceChange={(pref, enabled) =>
              handlePreferenceChange(pref as EmailPreference, enabled, null)
            }
            onBatchPreferenceChange={(updates) =>
              handleBatchPreferenceChange(updates, null)
            }
            type="email"
            contractorId={null}
            isLoading={preferencesLoading || !notificationTypesData}
          />
        </Grid>
      )}

      {/* Organization Selector and Preferences */}
      {hasEmail && organizationsData && organizationsData.length > 0 && (
        <Grid item xs={12}>
          <OrganizationPreferenceSelector
            organizations={organizationsData}
            preferences={preferences?.preferences?.organizations || []}
            notificationTypes={availableNotificationTypes}
            onPreferenceChange={(pref, enabled, contractorId) =>
              handlePreferenceChange(
                pref as EmailPreference,
                enabled,
                contractorId,
              )
            }
            onBatchPreferenceChange={(updates, contractorId) =>
              handleBatchPreferenceChange(updates, contractorId)
            }
            type="email"
            isLoading={organizationsLoading}
          />
        </Grid>
      )}

      {/* Add Email Dialog */}
      <AddEmailDialog
        open={addEmailDialogOpen}
        email={newEmail}
        selectedNotificationTypes={selectedNotificationTypes}
        availableNotificationTypes={availableNotificationTypes}
        onClose={() => setAddEmailDialogOpen(false)}
        onEmailChange={setNewEmail}
        onNotificationTypeToggle={(typeId) => {
          if (selectedNotificationTypes.includes(typeId)) {
            setSelectedNotificationTypes(
              selectedNotificationTypes.filter((id) => id !== typeId),
            )
          } else {
            setSelectedNotificationTypes([
              ...selectedNotificationTypes,
              typeId,
            ])
          }
        }}
        onSubmit={handleAddEmail}
      />

      {/* Edit Email Dialog */}
      <EditEmailDialog
        open={editEmailDialogOpen}
        email={newEmail}
        onClose={() => setEditEmailDialogOpen(false)}
        onEmailChange={setNewEmail}
        onSubmit={handleUpdateEmail}
      />

      {/* Delete Email Dialog */}
      <DeleteEmailDialog
        open={deleteEmailDialogOpen}
        onClose={() => setDeleteEmailDialogOpen(false)}
        onConfirm={handleDeleteEmail}
      />
    </Grid>
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
