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
import { useCallback } from "react"
import {
  useGetPushSubscriptionsQuery,
  useUnsubscribePushMutation,
} from "../../features/push-notifications"
import { unsubscribeFromPush } from "../../util/push-subscription"
import { getCurrentPushSubscription } from "../../util/push-subscription"
import { useState, useEffect } from "react"

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
          <Typography
            variant="body2"
            color="success.main"
            gutterBottom
          >
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
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
          >
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
                Subscribing...
              </>
            ) : (
              "Enable Push Notifications"
            )}
          </Button>
        </Box>
      )}

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
    </Box>
  )
}
