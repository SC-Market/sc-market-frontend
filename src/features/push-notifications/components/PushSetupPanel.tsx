import React, { useCallback, useEffect, useState } from "react"
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material"
import {
  AddBoxOutlined,
  DeleteRounded,
  GetAppRounded,
  IosShareRounded,
  NotificationsActiveRounded,
  NotificationsOffRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { usePWAInstallPrompt } from "../../../hooks/pwa/usePWAInstallPrompt"
import {
  isIOSDevice,
  notificationHelpPlatform,
  type NotificationHelpPlatform,
} from "../../../util/pwa-detection"
import {
  getCurrentPushSubscription,
  unsubscribeFromPush,
} from "../../../util/push-subscription"
import {
  useGetPushSubscriptionsQuery,
  useUnsubscribePushMutation,
} from "../api/pushApi"
import { usePushSubscription } from "../hooks/usePushSubscription"

import { useFormatters } from "../../../util/format"
/** This device's push state, most blocking first. */
export type PushDeviceState =
  | "checking"
  | "unconfigured"
  | "ios-install"
  | "unsupported"
  | "denied"
  | "off"
  | "on"

/**
 * Picks the device state from what the browser reports. Pure, so the
 * ordering is tested on its own.
 */
export function pushDeviceState(input: {
  ready: boolean
  isConfigured: boolean
  isSupported: boolean
  isIOS: boolean
  isInstalled: boolean
  permission: NotificationPermission
  subscribedHere: boolean | null
}): PushDeviceState {
  if (!input.ready) return "checking"
  if (!input.isConfigured) return "unconfigured"
  // iOS only exposes Web Push to a Home Screen app (iOS 16.4+).
  if (input.isIOS && !input.isInstalled) return "ios-install"
  if (!input.isSupported) return "unsupported"
  if (input.permission === "denied") return "denied"
  if (input.permission === "granted" && input.subscribedHere === null) {
    return "checking"
  }
  if (input.permission === "granted" && input.subscribedHere) return "on"
  return "off"
}

/** getCurrentPushSubscription, but give up if no service worker is active. */
async function currentEndpoint(): Promise<string | null> {
  const timeout = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), 5000),
  )
  const sub = await Promise.race([getCurrentPushSubscription(), timeout])
  return sub?.endpoint ?? null
}

const DENIED_HELP: Record<NotificationHelpPlatform, [string, string]> = {
  "ios-app": [
    "settings.pushNotifications.deniedHelp.ios",
    "Open the Settings app, go to Notifications, choose SC Market and turn on Allow Notifications.",
  ],
  android: [
    "settings.pushNotifications.deniedHelp.android",
    "In Chrome, open the ⋮ menu, then Settings, Site settings, Notifications, and allow sc-market.space. For the installed app, long-press its icon, then App info, Notifications.",
  ],
  safari: [
    "settings.pushNotifications.deniedHelp.safari",
    "In Safari, open Settings, then Websites, Notifications, and set sc-market.space to Allow.",
  ],
  firefox: [
    "settings.pushNotifications.deniedHelp.firefox",
    "Click the icon left of the address bar, clear the blocked Notifications permission, then reload this page.",
  ],
  chromium: [
    "settings.pushNotifications.deniedHelp.chromium",
    "Click the icon left of the address bar, open Site settings, set Notifications to Allow, then reload this page.",
  ],
}

/**
 * Settings -> Notifications -> Push: installs the app and turns on push for
 * this device, with one clear state at a time (on, off, blocked, iOS needs
 * the Home Screen app, unsupported), then lists the subscribed devices.
 * The service worker stays push-only; this only subscribes it.
 */
export function PushSetupPanel() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const push = usePushSubscription()
  const install = usePWAInstallPrompt()
  const { data: subscriptions, isLoading: subscriptionsLoading } =
    useGetPushSubscriptionsQuery()
  const [unsubscribePush] = useUnsubscribePushMutation()

  // Platform facts are browser-only: read after mount.
  const [platform, setPlatform] = useState<{
    isIOS: boolean
    help: NotificationHelpPlatform
  } | null>(null)
  useEffect(() => {
    setPlatform({ isIOS: isIOSDevice(), help: notificationHelpPlatform() })
  }, [])

  const [endpoint, setEndpoint] = useState<string | null | undefined>(undefined)
  const [installMessage, setInstallMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!push.isSupported || push.permissionStatus !== "granted") {
      setEndpoint(null)
      return
    }
    let cancelled = false
    currentEndpoint().then((e) => {
      if (!cancelled) setEndpoint(e)
    })
    return () => {
      cancelled = true
    }
  }, [push.isSupported, push.permissionStatus, subscriptions])

  const currentSubscription =
    endpoint && subscriptions
      ? subscriptions.find((s) => s.endpoint === endpoint)
      : undefined
  const subscribedHere =
    endpoint === undefined || (endpoint && subscriptionsLoading)
      ? null
      : !!currentSubscription

  const state = pushDeviceState({
    ready: platform !== null,
    isConfigured: push.isConfigured,
    isSupported: push.isSupported,
    isIOS: platform?.isIOS ?? false,
    isInstalled: install.isInstalled,
    permission: push.permissionStatus,
    subscribedHere,
  })

  const handleUnsubscribe = useCallback(
    async (subscriptionId: string) => {
      try {
        await unsubscribeFromPush(subscriptionId, async (id) => {
          await unsubscribePush(id).unwrap()
        })
      } catch {
        push.setError(
          t(
            "settings.pushNotifications.unsubscribeFailed",
            "Couldn't remove that device. Try again.",
          ),
        )
      }
    },
    [unsubscribePush, push, t],
  )

  const handleInstall = async () => {
    const accepted = await install.triggerInstall()
    setInstallMessage(
      accepted
        ? t(
            "settings.pushNotifications.installAccepted",
            "Installing SC Market. You can turn on push notifications here or in the app.",
          )
        : null,
    )
  }

  const status: Record<
    PushDeviceState,
    {
      label: string
      color: "success" | "warning" | "error" | "default"
      icon: React.ReactNode
    }
  > = {
    checking: {
      label: t("settings.pushNotifications.state.checking", "Checking…"),
      color: "default",
      icon: <CircularProgress size={18} />,
    },
    unconfigured: {
      label: t("settings.pushNotifications.state.unavailable", "Unavailable"),
      color: "default",
      icon: <NotificationsOffRounded />,
    },
    "ios-install": {
      label: t(
        "settings.pushNotifications.state.needsInstall",
        "Needs the app",
      ),
      color: "warning",
      icon: <NotificationsOffRounded />,
    },
    unsupported: {
      label: t("settings.pushNotifications.state.unsupported", "Not supported"),
      color: "default",
      icon: <NotificationsOffRounded />,
    },
    denied: {
      label: t("settings.pushNotifications.state.blocked", "Blocked"),
      color: "error",
      icon: <NotificationsOffRounded />,
    },
    off: {
      label: t("settings.pushNotifications.state.off", "Off on this device"),
      color: "warning",
      icon: <NotificationsOffRounded />,
    },
    on: {
      label: t("settings.pushNotifications.state.on", "On for this device"),
      color: "success",
      icon: <NotificationsActiveRounded />,
    },
  }
  const current = status[state]

  const descriptions: Record<PushDeviceState, string> = {
    checking: "",
    unconfigured: t(
      "settings.pushNotifications.notConfigured",
      "Push notifications are not configured. Please contact support.",
    ),
    "ios-install": t(
      "settings.pushNotifications.iosIntro",
      "On iPhone and iPad, push notifications only work in the SC Market app on your Home Screen (iOS 16.4 or later).",
    ),
    unsupported: t(
      "settings.pushNotifications.unsupportedHelp",
      "This browser can't receive push notifications. Try a current version of Chrome, Edge, Firefox or Safari.",
    ),
    denied: t(
      "settings.pushNotifications.deniedIntro",
      "Notifications from SC Market are blocked in this browser.",
    ),
    off: t(
      "settings.pushNotifications.offIntro",
      "Get order, offer and message alerts on this device, even when SC Market isn't open.",
    ),
    on: t(
      "settings.pushNotifications.onIntro",
      "This device gets the push notifications you've turned on above.",
    ),
  }

  const showInstall = install.canInstall && state !== "unconfigured"
  const otherDevices = (subscriptions || []).filter(
    (s) => s.subscription_id !== currentSubscription?.subscription_id,
  )

  return (
    <Stack spacing={2} sx={{ width: "100%" }} data-testid="push-setup">
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          aria-hidden
          sx={{
            display: "flex",
            color:
              current.color === "default"
                ? "text.primary"
                : `${current.color}.main`,
          }}
        >
          {current.icon}
        </Box>
        <Typography
          component="h3"
          variant="subtitle1"
          color="text.secondary"
          sx={{ fontWeight: "bold" }}
        >
          {t("settings.pushNotifications.thisDevice", "This device")}
        </Typography>
        <Chip
          size="small"
          variant="outlined"
          color={current.color}
          label={current.label}
          data-testid="push-state"
          data-state={state}
        />
        {install.isInstalled && (
          <Chip
            size="small"
            variant="outlined"
            label={t(
              "settings.pushNotifications.appInstalled",
              "App installed",
            )}
          />
        )}
      </Box>

      {descriptions[state] && (
        <Typography variant="body2" color="text.primary" aria-live="polite">
          {descriptions[state]}
        </Typography>
      )}

      {push.error && (
        <Alert severity="error" onClose={() => push.setError(null)}>
          {push.error}
        </Alert>
      )}
      {push.success && state === "on" && (
        <Alert severity="success" onClose={() => push.setSuccess(null)}>
          {push.success}
        </Alert>
      )}
      {installMessage && (
        <Alert severity="success" onClose={() => setInstallMessage(null)}>
          {installMessage}
        </Alert>
      )}

      {state === "ios-install" && (
        <Box
          component="ol"
          sx={{
            m: 0,
            pl: 3,
            color: "text.secondary",
            "& li": { mb: 1 },
            "& svg": { verticalAlign: "middle", mx: 0.5 },
          }}
          aria-label={t(
            "settings.pushNotifications.iosStepsLabel",
            "How to add SC Market to your Home Screen",
          )}
        >
          <li>
            <Typography variant="body2" component="span">
              {t(
                "settings.pushNotifications.iosStep1",
                "In Safari, tap the Share button",
              )}
              <IosShareRounded fontSize="small" aria-hidden />
            </Typography>
          </li>
          <li>
            <Typography variant="body2" component="span">
              {t(
                "settings.pushNotifications.iosStep2",
                "Scroll down and tap Add to Home Screen",
              )}
              <AddBoxOutlined fontSize="small" aria-hidden />
            </Typography>
          </li>
          <li>
            <Typography variant="body2" component="span">
              {t(
                "settings.pushNotifications.iosStep3",
                "Open SC Market from your Home Screen, come back to this page and tap Enable push notifications.",
              )}
            </Typography>
          </li>
        </Box>
      )}

      {state === "denied" && platform && (
        <Alert severity="warning">
          <AlertTitle>
            {t(
              "settings.pushNotifications.deniedTitle",
              "To turn them back on",
            )}
          </AlertTitle>
          {t(...DENIED_HELP[platform.help])}
        </Alert>
      )}

      {(state === "off" || showInstall) && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          {state === "off" && (
            <Button
              variant="contained"
              color="primary"
              startIcon={
                push.isSubscribing ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <NotificationsActiveRounded />
                )
              }
              onClick={push.handleSubscribe}
              disabled={push.isSubscribing}
            >
              {push.isSubscribing
                ? t("settings.pushNotifications.subscribing")
                : t("settings.pushNotifications.enablePushNotifications")}
            </Button>
          )}
          {showInstall && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<GetAppRounded />}
              onClick={handleInstall}
            >
              {t("settings.pushNotifications.installApp", "Install the app")}
            </Button>
          )}
        </Stack>
      )}

      {state === "on" && currentSubscription && (
        <Box>
          <Button
            variant="outlined"
            color="error"
            onClick={() =>
              handleUnsubscribe(currentSubscription.subscription_id)
            }
          >
            {t("settings.pushNotifications.disableOnDevice")}
          </Button>
        </Box>
      )}

      {otherDevices.length > 0 && (
        <Box>
          <Typography
            component="h3"
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: "bold" }}
          >
            {t(
              "settings.pushNotifications.otherDevicesTitle",
              "Other devices with push on",
            )}
          </Typography>
          <List dense disablePadding>
            {otherDevices.map((subscription) => {
              const device =
                subscription.user_agent ||
                t("settings.pushNotifications.unknownDevice")
              return (
                <ListItem
                  key={subscription.subscription_id}
                  disableGutters
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      aria-label={t(
                        "settings.pushNotifications.removeDeviceNamed",
                        {
                          device,
                          defaultValue: "Remove {{device}}",
                        },
                      )}
                      onClick={() =>
                        handleUnsubscribe(subscription.subscription_id)
                      }
                    >
                      <DeleteRounded fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={device}
                    secondary={t("settings.pushNotifications.subscribedOn", {
                      date: fmt.date(subscription.created_at),
                    })}
                    primaryTypographyProps={{
                      color: "text.secondary",
                      sx: { wordBreak: "break-word", pr: 4 },
                    }}
                    secondaryTypographyProps={{ color: "text.primary" }}
                  />
                </ListItem>
              )
            })}
          </List>
        </Box>
      )}
    </Stack>
  )
}
