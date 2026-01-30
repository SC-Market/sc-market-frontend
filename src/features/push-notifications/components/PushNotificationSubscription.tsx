import {
  Box,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive"
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff"
import { useCallback, useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  useGetPushSubscriptionsQuery,
  useUnsubscribePushMutation,
} from "../api/pushApi"
import {
  unsubscribeFromPush,
  getCurrentPushSubscription,
} from "../../../util/push-subscription"

interface PushNotificationSubscriptionProps {
  onSubscribe: () => Promise<void>
  isSubscribing: boolean
  isPermissionGranted: boolean
  isConfigured: boolean
  requiresPWAInstall: boolean
}

export function PushNotificationSubscription({
  onSubscribe,
  isSubscribing,
  isPermissionGranted,
  isConfigured,
  requiresPWAInstall,
}: PushNotificationSubscriptionProps) {
  const { t } = useTranslation()
  const { data: subscriptions, isLoading: subscriptionsLoading } =
    useGetPushSubscriptionsQuery()
  const [unsubscribePush] = useUnsubscribePushMutation()
  const [currentDeviceSubscribed, setCurrentDeviceSubscribed] = useState<
    boolean | null
  >(null)
  const [currentSubscriptionId, setCurrentSubscriptionId] = useState<
    string | null
  >(null)

  useEffect(() => {
    const checkCurrentDeviceSubscription = async () => {
      if (!subscriptions) {
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
        setCurrentDeviceSubscribed(false)
        setCurrentSubscriptionId(null)
      }
    }

    checkCurrentDeviceSubscription()
  }, [subscriptions])

  const handleUnsubscribe = useCallback(
    async (subscriptionId: string) => {
      try {
        await unsubscribeFromPush(subscriptionId, async (id) => {
          await unsubscribePush(id).unwrap()
        })
      } catch (error) {
        console.error("Failed to unsubscribe:", error)
      }
    },
    [unsubscribePush],
  )

  const hasSubscriptions = subscriptions && subscriptions.length > 0
  const isCurrentDeviceSubscribed = currentDeviceSubscribed === true

  return (
    <Box sx={{ mb: 2 }}>
      {subscriptionsLoading || currentDeviceSubscribed === null ? (
        <CircularProgress size={24} />
      ) : isCurrentDeviceSubscribed ? (
        <Box>
          <Typography variant="body2" color="success.main" gutterBottom>
            <NotificationsActiveIcon sx={{ verticalAlign: "middle", mr: 1 }} />
            {t("settings.pushNotifications.enabledOnDevice")}
            {hasSubscriptions && subscriptions.length > 1 && (
              <>
                {" "}
                (
                {t("settings.pushNotifications.totalDevices", {
                  count: subscriptions.length,
                })}
                )
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
              {t("settings.pushNotifications.disableOnDevice")}
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <NotificationsOffIcon sx={{ verticalAlign: "middle", mr: 1 }} />
            {t("settings.pushNotifications.notEnabledOnDevice")}
            {hasSubscriptions && (
              <>
                {" "}
                (
                {t("settings.pushNotifications.otherDevices", {
                  count: subscriptions.length,
                })}{" "}
                {t("settings.pushNotifications.connected")})
              </>
            )}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={onSubscribe}
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
                {t("settings.pushNotifications.subscribing")}
              </>
            ) : (
              t("settings.pushNotifications.enablePushNotifications")
            )}
          </Button>
        </Box>
      )}

      {hasSubscriptions && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t("settings.pushNotifications.connectedDevices")}
          </Typography>
          <List dense>
            {subscriptions.map((subscription) => (
              <ListItem key={subscription.subscription_id}>
                <ListItemText
                  primary={
                    subscription.user_agent ||
                    t("settings.pushNotifications.unknownDevice")
                  }
                  secondary={t("settings.pushNotifications.subscribedOn", {
                    date: new Date(
                      subscription.created_at,
                    ).toLocaleDateString(),
                  })}
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
    </Box>
  )
}
