import React from "react"
import { Box, Chip, Grid, Link as MuiLink, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  PushNotificationSettings,
  usePushSubscription,
} from "../../push-notifications"
import { EmailSettings, useEmailSettings } from "../../email"
import { NotificationPreferencesTabs } from "./NotificationPreferencesTabs"

/**
 * Settings -> Notifications (replaces the Push and Email tabs): a status strip
 * per channel, the preferences by area, then this device's push subscription
 * and the email address.
 */
export function NotificationSettings() {
  const { t } = useTranslation()
  const push = usePushSubscription()
  const email = useEmailSettings()
  const pushOk = push.isSupported && push.isPermissionGranted
  const emailOk = email.hasEmail && email.emailVerified

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" component="h2">
          {t("settings.notifications.title", "Notifications")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {t(
            "settings.notifications.subtitle",
            "Choose where each kind of notification reaches you.",
          )}
        </Typography>
        <Box
          sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
          data-testid="notif-status"
        >
          <Chip
            size="small"
            color={pushOk ? "success" : "warning"}
            variant="outlined"
            label={
              pushOk
                ? t(
                    "settings.notifications.status.pushOn",
                    "Push: on for this device",
                  )
                : t(
                    "settings.notifications.status.pushOff",
                    "Push: not set up on this device",
                  )
            }
            onClick={() => scrollTo("notif-push")}
          />
          <Chip
            size="small"
            color={emailOk ? "success" : "warning"}
            variant="outlined"
            label={
              emailOk
                ? t("settings.notifications.status.emailOn", "Email: verified")
                : email.hasEmail
                  ? t(
                      "settings.notifications.status.emailUnverified",
                      "Email: not verified",
                    )
                  : t(
                      "settings.notifications.status.emailNone",
                      "Email: no address",
                    )
            }
            onClick={() => scrollTo("notif-email")}
          />
          <MuiLink
            component={Link}
            to="/settings?tab=discord"
            variant="body2"
            sx={{ alignSelf: "center" }}
          >
            {t(
              "settings.notifications.status.discord",
              "Discord DMs need a linked Discord account",
            )}
          </MuiLink>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <NotificationPreferencesTabs />
      </Grid>
      <Grid item xs={12} id="notif-push">
        <PushNotificationSettings showPreferences={false} />
      </Grid>
      <Grid item xs={12} id="notif-email">
        <EmailSettings showPreferences={false} />
      </Grid>
    </Grid>
  )
}
