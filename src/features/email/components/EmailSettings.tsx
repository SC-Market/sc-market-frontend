import { FlatSection } from "../../../components/paper/Section"
import React, { useState } from "react"
import { Grid, Alert } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useGetUserOrganizationsQuery } from "../../../store/organizations"
import { useGetNotificationTypesQuery } from "../api/emailApi"
import { PreferenceSection } from "../../../components/settings/PreferenceSection"
import { OrganizationPreferenceSelector } from "../../../components/settings/OrganizationPreferenceSelector"
import { useEmailSettings } from "../hooks/useEmailSettings"
import { useEmailActions } from "../hooks/useEmailActions"
import { formatActionName } from "../domain/formatters"
import type { EmailPreference } from "../domain/types"
import type { PushPreference } from "../../push-notifications/domain/types"
import { EmailStatus } from "./EmailStatus"
import { AddEmailDialog } from "./AddEmailDialog"
import { EditEmailDialog } from "./EditEmailDialog"
import { DeleteEmailDialog } from "./DeleteEmailDialog"

/**
 * Email Settings Component
 * Allows users to:
 * - Add/update/delete email address
 * - Verify email address
 * - Manage email notification preferences per notification type
 */
export function EmailSettings() {
  const { t } = useTranslation()
  const [addEmailDialogOpen, setAddEmailDialogOpen] = useState(false)
  const [editEmailDialogOpen, setEditEmailDialogOpen] = useState(false)
  const [deleteEmailDialogOpen, setDeleteEmailDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [selectedNotificationTypes, setSelectedNotificationTypes] = useState<
    number[]
  >([])

  const { data: notificationTypesData } = useGetNotificationTypesQuery()
  const { data: organizationsData, isLoading: organizationsLoading } =
    useGetUserOrganizationsQuery()

  const {
    preferences,
    preferencesLoading,
    preferencesError,
    hasEmail,
    emailVerified,
    userEmail,
    handlePreferenceChange,
    handleBatchPreferenceChange,
    error: settingsError,
    success: settingsSuccess,
    setError: setSettingsError,
    setSuccess: setSettingsSuccess,
  } = useEmailSettings()

  const {
    handleAddEmail: addEmailAction,
    handleUpdateEmail: updateEmailAction,
    handleDeleteEmail: deleteEmailAction,
    handleRequestVerification,
    resendCooldown,
    error: actionsError,
    success: actionsSuccess,
    setError: setActionsError,
    setSuccess: setActionsSuccess,
  } = useEmailActions()

  // Combine errors and success from both hooks
  const error = settingsError || actionsError
  const success = settingsSuccess || actionsSuccess
  const setError = (err: string | null) => {
    setSettingsError(err)
    setActionsError(err)
  }
  const setSuccess = (msg: string | null) => {
    setSettingsSuccess(msg)
    setActionsSuccess(msg)
  }

  // Handle add email with dialog management
  const handleAddEmail = async () => {
    const result = await addEmailAction(newEmail, selectedNotificationTypes)
    if (result.success) {
      setNewEmail("")
      setSelectedNotificationTypes([])
      setAddEmailDialogOpen(false)
    }
  }

  // Handle update email with dialog management
  const handleUpdateEmail = async () => {
    const result = await updateEmailAction(newEmail)
    if (result.success) {
      setEditEmailDialogOpen(false)
      setNewEmail("")
    }
  }

  // Handle delete email with dialog management
  const handleDeleteEmail = async () => {
    const result = await deleteEmailAction()
    if (result.success) {
      setDeleteEmailDialogOpen(false)
    }
  }

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
        <FlatSection title={t("settings.email.emailAddress")}>
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
            onRequestVerification={async () => {
              await handleRequestVerification()
            }}
          />
        </FlatSection>
      </Grid>

      {/* Individual Preferences Section */}
      {hasEmail && (
        <Grid item xs={12}>
          <PreferenceSection
            title={t("settings.email.individualPreferences")}
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
