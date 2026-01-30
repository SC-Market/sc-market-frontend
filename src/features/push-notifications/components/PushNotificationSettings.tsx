import { FlatSection } from "../../../components/paper/Section"
import React from "react"
import { Grid, Alert } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useGetUserOrganizationsQuery } from "../../../store/organizations"
import { useGetNotificationTypesQuery } from "../../email/api/emailApi"
import { PreferenceSection } from "../../../components/settings/PreferenceSection"
import { OrganizationPreferenceSelector } from "../../../components/settings/OrganizationPreferenceSelector"
import {
  isPWAInstalled,
  requiresPWAInstallationForPush,
  getPWAInstallationMessage,
} from "../../../util/pwa-detection"
import {
  isAndroidDevice,
  isAndroidPushSupported,
  getAndroidPushErrorMessage,
} from "../../../util/android-push-check"
import { isPushNotificationSupported } from "../../../util/push-subscription"
import { usePushSettings } from "../hooks/usePushSettings"
import { usePushSubscription } from "../hooks/usePushSubscription"
import { formatActionName } from "../domain/formatters"
import type { PushPreference } from "../domain/types"
import type { EmailPreference } from "../../email/domain/types"
import { PushNotificationStatus } from "./PushNotificationStatus"
import { PushNotificationSubscription } from "./PushNotificationSubscription"
import { PushNotificationErrorStates } from "./PushNotificationErrorStates"

/**
 * Push Notification Settings Component
 * Allows users to:
 * - Enable/disable push notifications
 * - Manage push notification preferences per notification type
 * - View and manage device subscriptions
 */
export function PushNotificationSettings() {
  const { t } = useTranslation()
  const { data: organizationsData, isLoading: organizationsLoading } =
    useGetUserOrganizationsQuery()
  const { data: notificationTypesData } = useGetNotificationTypesQuery()

  const {
    preferences,
    preferencesLoading,
    handlePreferenceChange,
    handleBatchPreferenceChange,
    error: settingsError,
    success: settingsSuccess,
    setError: setSettingsError,
    setSuccess: setSettingsSuccess,
  } = usePushSettings()

  const {
    isSupported,
    isPermissionGranted,
    isConfigured,
    error: subscriptionError,
    success: subscriptionSuccess,
    setError: setSubscriptionError,
    setSuccess: setSubscriptionSuccess,
    handleSubscribe,
    isSubscribing,
  } = usePushSubscription()

  // Check PWA installation status
  const pwaInstalled = isPWAInstalled()
  const requiresPWAInstall = requiresPWAInstallationForPush()
  const pwaInstallMessage = getPWAInstallationMessage()

  // Android-specific checks
  const isAndroid = isAndroidDevice()
  const androidErrorMessage = getAndroidPushErrorMessage()

  // Combine errors and success from both hooks
  const error = settingsError || subscriptionError
  const success = settingsSuccess || subscriptionSuccess
  const setError = (err: string | null) => {
    setSettingsError(err)
    setSubscriptionError(err)
  }
  const setSuccess = (msg: string | null) => {
    setSettingsSuccess(msg)
    setSubscriptionSuccess(msg)
  }

  // Get available notification types formatted for display
  const availableNotificationTypes =
    notificationTypesData?.notificationTypes.map((type) => ({
      id: type.action_type_id,
      name: formatActionName(type.action),
      description: type.description || undefined,
      action: type.action, // Keep the action string for matching
    })) || []

  // Check for error states first
  if (
    !isSupported ||
    (isAndroid && androidErrorMessage) ||
    !isConfigured ||
    requiresPWAInstall
  ) {
    return (
      <PushNotificationErrorStates
        isSupported={isSupported}
        isAndroid={isAndroid}
        androidErrorMessage={androidErrorMessage}
        pwaInstalled={pwaInstalled}
        requiresPWAInstall={requiresPWAInstall}
        pwaInstallMessage={pwaInstallMessage}
        isConfigured={isConfigured}
      />
    )
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FlatSection title={t("settings.pushNotifications.title")}>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
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

          <PushNotificationStatus />
          <PushNotificationSubscription
            onSubscribe={handleSubscribe}
            isSubscribing={isSubscribing}
            isPermissionGranted={isPermissionGranted}
            isConfigured={isConfigured}
            requiresPWAInstall={requiresPWAInstall}
          />
        </FlatSection>
      </Grid>

      {/* Individual Preferences Section */}
      {isPermissionGranted && (
        <Grid item xs={12}>
          <PreferenceSection
            title={t("settings.pushNotifications.individualPreferences")}
            preferences={preferences?.preferences?.individual || []}
            notificationTypes={availableNotificationTypes}
            onPreferenceChange={(pref, enabled) =>
              handlePreferenceChange(pref as PushPreference, enabled, null)
            }
            onBatchPreferenceChange={(updates) =>
              handleBatchPreferenceChange(updates, null)
            }
            type="push"
            contractorId={null}
            isLoading={preferencesLoading || !notificationTypesData}
          />
        </Grid>
      )}

      {/* Organization Selector and Preferences */}
      {isPermissionGranted &&
        organizationsData &&
        organizationsData.length > 0 && (
          <Grid item xs={12}>
            <OrganizationPreferenceSelector
              organizations={organizationsData}
              preferences={preferences?.preferences?.organizations || []}
              notificationTypes={availableNotificationTypes}
              onPreferenceChange={(pref, enabled, contractorId) =>
                handlePreferenceChange(
                  pref as PushPreference,
                  enabled,
                  contractorId,
                )
              }
              onBatchPreferenceChange={(updates, contractorId) =>
                handleBatchPreferenceChange(updates, contractorId)
              }
              type="push"
              isLoading={organizationsLoading}
            />
          </Grid>
        )}
    </Grid>
  )
}
