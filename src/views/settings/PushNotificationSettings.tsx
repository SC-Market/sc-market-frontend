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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive"
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff"
import {
  useGetPushSubscriptionsQuery,
  useSubscribePushMutation,
  useUnsubscribePushMutation,
  useGetPushPreferencesQuery,
  useUpdatePushPreferenceMutation,
} from "../../store/push-notifications"
import {
  subscribeToPush,
  unsubscribeFromPush,
  isPushNotificationSupported,
  getPushPermissionStatus,
  requestPushPermission,
  getCurrentPushSubscription,
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
import { useTranslation } from "react-i18next"
import { VITE_VAPID_PUBLIC_KEY } from "../../util/constants"

// Type guard for PushSubscription
type PushSubscription = globalThis.PushSubscription

/**
 * Push Notification Settings Component
 * Allows users to:
 * - Enable/disable push notifications
 * - Manage push notification preferences per notification type
 * - View and manage device subscriptions
 */
export function PushNotificationSettings() {
  const { t } = useTranslation()
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // RTK Query hooks
  const { data: subscriptions, isLoading: subscriptionsLoading } =
    useGetPushSubscriptionsQuery()
  const { data: preferences, isLoading: preferencesLoading } =
    useGetPushPreferencesQuery()
  const [subscribePush] = useSubscribePushMutation()
  const [unsubscribePush] = useUnsubscribePushMutation()
  const [updatePreference] = useUpdatePushPreferenceMutation()

  // Check if current device is subscribed
  const [currentDeviceSubscribed, setCurrentDeviceSubscribed] = React.useState<
    boolean | null
  >(null)
  const [currentSubscriptionId, setCurrentSubscriptionId] = React.useState<
    string | null
  >(null)

  // Check browser support
  const isSupported = isPushNotificationSupported()
  const permissionStatus = getPushPermissionStatus()

  // Check if current device is subscribed
  React.useEffect(() => {
    const checkCurrentDeviceSubscription = async () => {
      if (!isSupported || !subscriptions) {
        setCurrentDeviceSubscribed(false)
        return
      }

      try {
        const currentSubscription = await getCurrentPushSubscription()
        if (!currentSubscription) {
          setCurrentDeviceSubscribed(false)
          setCurrentSubscriptionId(null)
          return
        }

        // Check if current device's endpoint matches any subscription
        const matchingSubscription = subscriptions.find(
          (sub) => sub.endpoint === currentSubscription.endpoint,
        )

        if (matchingSubscription) {
          setCurrentDeviceSubscribed(true)
          setCurrentSubscriptionId(matchingSubscription.subscription_id)
        } else {
          setCurrentDeviceSubscribed(false)
          setCurrentSubscriptionId(null)
        }
      } catch (error) {
        console.error("Failed to check current device subscription:", error)
        setCurrentDeviceSubscribed(false)
        setCurrentSubscriptionId(null)
      }
    }

    checkCurrentDeviceSubscription()
  }, [isSupported, subscriptions])

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

  // Handle unsubscribe
  const handleUnsubscribe = useCallback(
    async (subscriptionId: string) => {
      setError(null)
      setSuccess(null)

      try {
        await unsubscribeFromPush(subscriptionId, async (id) => {
          await unsubscribePush(id).unwrap()
        })
        setSuccess("Successfully unsubscribed from push notifications")
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to unsubscribe from push notifications"
        setError(errorMessage)
      }
    },
    [unsubscribePush],
  )

  // Handle permission request
  const handleRequestPermission = useCallback(async () => {
    setError(null)
    try {
      const permission = await requestPushPermission()
      if (permission === "granted") {
        setSuccess(
          "Permission granted! You can now subscribe to push notifications.",
        )
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

  // Handle preference update
  const handlePreferenceChange = useCallback(
    async (action: string, enabled: boolean) => {
      setError(null)
      try {
        await updatePreference({ action, enabled }).unwrap()
        setSuccess(`Preference updated for ${action}`)
        // Clear success message after 2 seconds
        setTimeout(() => setSuccess(null), 2000)
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to update preference",
        )
      }
    },
    [updatePreference],
  )

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

  if (!isSupported) {
    return (
      <FlatSection title="Push Notifications">
        <Alert severity="warning">
          Push notifications are not supported in this browser.
        </Alert>
      </FlatSection>
    )
  }

  // Show Android-specific error if applicable
  if (isAndroid && androidErrorMessage) {
    return (
      <FlatSection title="Push Notifications">
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Android Push Notification Requirements
          </Typography>
          <Typography variant="body2">{androidErrorMessage}</Typography>
        </Alert>
        {!pwaInstalled && (
          <Typography variant="body2" color="text.secondary">
            Please install this app as a PWA to enable push notifications on
            Android.
          </Typography>
        )}
      </FlatSection>
    )
  }

  if (!isConfigured) {
    return (
      <FlatSection title="Push Notifications">
        <Alert severity="warning" sx={{ mb: 2 }}>
          Push notifications are not configured on this server. Please contact
          support if you believe this is an error.
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Push notification functionality requires server configuration. The
          feature is currently disabled.
        </Typography>
      </FlatSection>
    )
  }

  // Check if PWA installation is required
  if (requiresPWAInstall) {
    return (
      <FlatSection title="Push Notifications">
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Installation Required
          </Typography>
          <Typography variant="body2">{pwaInstallMessage}</Typography>
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Once installed, you can return here to enable push notifications.
          </Typography>
          {!pwaInstalled && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Current status: Not installed as PWA
            </Typography>
          )}
        </Box>
      </FlatSection>
    )
  }

  const hasSubscriptions = subscriptions && subscriptions.length > 0
  const isCurrentDeviceSubscribed = currentDeviceSubscribed === true
  const isPermissionGranted = permissionStatus === "granted"
  const isPermissionDenied = permissionStatus === "denied"

  return (
    <FlatSection title="Push Notifications">
      {/* Status and Subscription Section */}
      <Grid item xs={12}>
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

        {/* Permission Status */}
        <Box sx={{ mb: 2 }}>
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

        {/* Subscription Toggle */}
        <Box sx={{ mb: 2 }}>
          {subscriptionsLoading || currentDeviceSubscribed === null ? (
            <CircularProgress size={24} />
          ) : isCurrentDeviceSubscribed ? (
            <Box>
              <Typography variant="body2" color="success.main" gutterBottom>
                <NotificationsActiveIcon
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />
                Push notifications are enabled on this device
                {hasSubscriptions && subscriptions.length > 1 && (
                  <>
                    {" "}
                    ({subscriptions.length} total device
                    {subscriptions.length !== 1 ? "s" : ""})
                  </>
                )}
              </Typography>
              {currentSubscriptionId && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleUnsubscribe(currentSubscriptionId)}
                  sx={{ mt: 1 }}
                >
                  Disable on This Device
                </Button>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <NotificationsOffIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                Push notifications are not enabled on this device
                {hasSubscriptions && (
                  <>
                    {" "}
                    ({subscriptions.length} other device
                    {subscriptions.length !== 1 ? "s" : ""} connected)
                  </>
                )}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubscribe}
                disabled={
                  isSubscribing ||
                  !isPermissionGranted ||
                  !isConfigured ||
                  requiresPWAInstall
                }
                sx={{ mt: 1 }}
              >
                {isSubscribing ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Subscribing...
                  </>
                ) : (
                  "Enable Push Notifications"
                )}
              </Button>
            </Box>
          )}
        </Box>

        {/* Device List */}
        {hasSubscriptions && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Connected Devices:
            </Typography>
            <List dense>
              {subscriptions.map((subscription) => (
                <ListItem key={subscription.subscription_id}>
                  <ListItemText
                    primary={subscription.user_agent || "Unknown Device"}
                    secondary={`Subscribed ${new Date(
                      subscription.created_at,
                    ).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() =>
                        handleUnsubscribe(subscription.subscription_id)
                      }
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Grid>

      {/* Preferences Section */}
      {isCurrentDeviceSubscribed && (
        <>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which types of notifications you want to receive via push
              notifications.
            </Typography>
          </Grid>

          {preferencesLoading ? (
            <Grid item xs={12}>
              <CircularProgress />
            </Grid>
          ) : preferences?.preferences && preferences.preferences.length > 0 ? (
            preferences.preferences.map((pref) => (
              <Grid item xs={12} key={pref.action}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={pref.enabled}
                      onChange={(e) =>
                        handlePreferenceChange(pref.action, e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {formatActionName(pref.action)}
                    </Typography>
                  }
                  labelPlacement="start"
                  sx={{ width: "100%", justifyContent: "space-between" }}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                No preferences available
              </Typography>
            </Grid>
          )}
        </>
      )}
    </FlatSection>
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
