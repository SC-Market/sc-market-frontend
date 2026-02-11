import { FlatSection } from "../../../components/paper/Section"
import React from "react"
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

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import { useTheme } from '@mui/material/styles';
import MaterialLink from '@mui/material/Link';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRounded from '@mui/icons-material/MarkEmailUnreadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import UpdateRounded from '@mui/icons-material/UpdateRounded';
import GetAppRounded from '@mui/icons-material/GetAppRounded';

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
