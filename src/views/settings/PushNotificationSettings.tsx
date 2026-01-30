import { FlatSection } from "../../components/paper/Section"
import React, { useCallback, useEffect, useState } from "react"
import { Grid, Alert } from "@mui/material"
import {
  useGetPushSubscriptionsQuery,
  useSubscribePushMutation,
  useGetPushPreferencesQuery,
  useUpdatePushPreferenceMutation,
  PushPreference,
} from "../../store/push-notifications"
import { EmailPreference } from "../../store/email"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useGetUserOrganizationsQuery } from "../../store/organizations"
import { useGetNotificationTypesQuery } from "../../store/email"
import { PreferenceSection } from "../../components/settings/PreferenceSection"
import { OrganizationPreferenceSelector } from "../../components/settings/OrganizationPreferenceSelector"
import {
  subscribeToPush,
  isPushNotificationSupported,
  getPushPermissionStatus,
} from "../../util/push-subscription"
import {
  isPWAInstalled,
  requiresPWAInstallationForPush,
  getPWAInstallationMessage,
} from "../../util/pwa-detection"
import {
  isAndroidDevice,
  isAndroidPushSupported,
  getAndroidPushErrorMessage,
} from "../../util/android-push-check"
import { VITE_VAPID_PUBLIC_KEY } from "../../util/constants"
import { PushNotificationStatus } from "../../components/settings/PushNotificationStatus"
import { PushNotificationSubscription } from "../../components/settings/PushNotificationSubscription"
import { PushNotificationErrorStates } from "../../components/settings/PushNotificationErrorStates"

/**
 * Push Notification Settings Component
 * Allows users to:
 * - Enable/disable push notifications
 * - Manage push notification preferences per notification type
 * - View and manage device subscriptions
 */
export function PushNotificationSettings() {
  const [isSubscribing, setIsSubscribing] = useState(false)
  const issueAlert = useAlertHook()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // RTK Query hooks
  const {
    data: preferences,
    isLoading: preferencesLoading,
    refetch: refetchPreferences,
  } = useGetPushPreferencesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })
  const { data: organizationsData, isLoading: organizationsLoading } =
    useGetUserOrganizationsQuery()
  const { data: notificationTypesData } = useGetNotificationTypesQuery()
  const [subscribePush] = useSubscribePushMutation()
  const [updatePreference] = useUpdatePushPreferenceMutation()

  // Check browser support
  const isSupported = isPushNotificationSupported()
  const permissionStatus = getPushPermissionStatus()

  // Check PWA installation status
  const pwaInstalled = isPWAInstalled()
  const requiresPWAInstall = requiresPWAInstallationForPush()
  const pwaInstallMessage = getPWAInstallationMessage()

  // Android-specific checks
  const isAndroid = isAndroidDevice()
  const androidPushSupported = isAndroidPushSupported()
  const androidErrorMessage = getAndroidPushErrorMessage()

  // Get VAPID public key from environment
  const vapidPublicKey = VITE_VAPID_PUBLIC_KEY

  // Handle subscribe
  const handleSubscribe = useCallback(async () => {
    if (!vapidPublicKey) {
      setError("Push notifications are not configured. Please contact support.")
      return
    }

    setIsSubscribing(true)
    setError(null)
    setSuccess(null)

    try {
      await subscribeToPush(vapidPublicKey, async (subscriptionData) => {
        await subscribePush(subscriptionData).unwrap()
      })
      setSuccess("Successfully subscribed to push notifications!")
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to subscribe to push notifications"
      setError(errorMessage)
    } finally {
      setIsSubscribing(false)
    }
  }, [vapidPublicKey, subscribePush])


  // Handle preference update
  const handlePreferenceChange = useCallback(
    async (
      preference: PushPreference | { action: string },
      enabled: boolean,
      contractorId?: string | null,
    ) => {
      const action =
        (preference as PushPreference).action ||
        (preference as { action: string }).action
      try {
        await updatePreference({
          action,
          enabled,
          contractor_id: contractorId ?? null,
        }).unwrap()
        issueAlert({
          message: `Preference updated for ${action}`,
          severity: "success",
        })
      } catch (error) {
        issueAlert({
          message:
            error instanceof Error
              ? error.message
              : "Failed to update preference",
          severity: "error",
        })
      }
    },
    [updatePreference, issueAlert],
  )

  // Handle batch preference update
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
        const pushPreferences = updates
          .map(({ preference, enabled }) => {
            const pushPref = preference as PushPreference & {
              contractor_id?: string | null
            }
            if (pushPref.action) {
              return {
                action: pushPref.action,
                enabled,
                contractor_id: pushPref.contractor_id ?? contractorId ?? null,
              }
            }
            return null
          })
          .filter((p): p is NonNullable<typeof p> => p !== null)

        if (pushPreferences.length > 0) {
          await updatePreference({
            preferences: pushPreferences,
          } as any).unwrap()
          issueAlert({
            message: `Updated ${pushPreferences.length} notification preference${pushPreferences.length !== 1 ? "s" : ""}`,
            severity: "success",
          })
        }
      } catch (error) {
        issueAlert({
          message:
            error instanceof Error
              ? error.message
              : "Failed to update preferences",
          severity: "error",
        })
      }
    },
    [updatePreference, issueAlert],
  )

  // Get available notification types formatted for display
  const availableNotificationTypes =
    notificationTypesData?.notificationTypes.map((type) => ({
      id: type.action_type_id,
      name: formatActionName(type.action),
      description: type.description,
      action: type.action, // Keep the action string for matching
    })) || []

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

  // Check if push notifications are configured
  const isConfigured = !!vapidPublicKey

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

  const isPermissionGranted = permissionStatus === "granted"

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FlatSection title="Push Notifications">
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
            title="Individual Notifications"
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

/**
 * Get user-friendly label for notification action type
 */
function formatActionName(action: string): string {
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
    actionLabels[action] ||
    action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .replace(/([A-Z])/g, " $1")
      .trim()
  )
}
