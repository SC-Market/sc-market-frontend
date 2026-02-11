import { FlatSection } from "../../../components/paper/Section"
import React, { useState } from "react"
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

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Breakpoint from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';

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
            setSelectedNotificationTypes([...selectedNotificationTypes, typeId])
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
