import React from "react"
import { Box, Grid, Link, Skeleton, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { FlatSection } from "../../../components/paper/Section"
import {
  useGetPriceAlertPreferencesQuery,
  type PriceAlertPreferences,
} from "../../../store/api/v2/market"
import { FirstUseHint } from "../../help/components/FirstUseHint"
import { PATHS } from "../../../routes/paths"
import { WatchlistManager } from "./WatchlistManager"

const CHANNELS: Array<keyof PriceAlertPreferences> = [
  "site",
  "push",
  "email",
  "discord",
]

/**
 * Settings -> Price Alerts: the user's watchlist, and a summary of where its
 * alerts go. The channels themselves are chosen in Settings -> Notifications
 * (Market & watchlist -> Price alert), like every other notification.
 */
export function PriceAlertSettings() {
  const { t } = useTranslation()
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FirstUseHint
          hint="priceAlerts"
          title={t(
            "hints.priceAlerts.title",
            "Get an alert when the price is right",
          )}
        >
          {t(
            "hints.priceAlerts.body",
            "Watch an item with a target price. When a public listing is at or below it, you get an alert with a link to the listing. Pause an alert to keep it without being notified.",
          )}
        </FirstUseHint>
      </Grid>
      <Grid item xs={12}>
        <FlatSection title={t("priceAlerts.manager.title", "Watchlist")}>
          <Grid item xs={12}>
            <WatchlistManager />
          </Grid>
        </FlatSection>
      </Grid>
      <Grid item xs={12}>
        <FlatSection
          title={t("settings.priceAlerts.deliveryTitle", "Where alerts arrive")}
        >
          <Grid item xs={12}>
            <PriceAlertDelivery />
          </Grid>
        </FlatSection>
      </Grid>
    </Grid>
  )
}

/** Which channels price alerts use now, and a link to change them. */
function PriceAlertDelivery() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetPriceAlertPreferencesQuery()

  const names: Record<keyof PriceAlertPreferences, string> = {
    site: t("settings.priceAlerts.site", "Site notification"),
    push: t("settings.priceAlerts.push", "Push notification"),
    email: t("settings.priceAlerts.email", "Email"),
    discord: t("settings.priceAlerts.discord", "Discord DM"),
  }
  const on = data ? CHANNELS.filter((c) => data[c]).map((c) => names[c]) : []

  return (
    <Box data-testid="price-alert-delivery">
      {isLoading ? (
        <Skeleton variant="text" width="60%" />
      ) : isError || !data ? null : (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {on.length > 0
            ? t(
                "settings.priceAlerts.deliveredTo",
                "Alerts go to: {{channels}}.",
                {
                  channels: on.join(", "),
                },
              )
            : t(
                "settings.priceAlerts.deliveredNowhere",
                "Every channel is off, so your watches can't alert you.",
              )}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {t(
          "settings.priceAlerts.description",
          "Choose the channels in Notifications, under Market & watchlist › Price alert. By default you get a site notification, a push notification and a Discord DM; email is off until you turn it on.",
        )}
      </Typography>
      <Link
        component={RouterLink}
        to={PATHS.notificationSettingsMarket}
        variant="body2"
      >
        {t(
          "settings.priceAlerts.openNotifications",
          "Open Notification settings",
        )}
      </Link>
    </Box>
  )
}
