import React from "react"
import {
  Alert,
  Box,
  CircularProgress,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { FlatSection } from "../../../components/paper/Section"
import {
  useGetPriceAlertPreferencesQuery,
  useUpdatePriceAlertPreferencesMutation,
  type PriceAlertPreferences,
} from "../../../store/api/v2/market"

const CHANNELS: Array<keyof PriceAlertPreferences> = [
  "site",
  "push",
  "email",
  "discord",
]

/**
 * Where watchlist price alerts (Discord `/watchlist add`) are delivered.
 * Push and email are the same settings as "Price Alerts" on the Push and
 * Email tabs.
 */
export function PriceAlertSettings() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetPriceAlertPreferencesQuery()
  const [update, { isLoading: isSaving, isError: saveFailed }] =
    useUpdatePriceAlertPreferencesMutation()

  const labels: Record<keyof PriceAlertPreferences, [string, string]> = {
    site: [
      t("settings.priceAlerts.site", "Site notification"),
      t(
        "settings.priceAlerts.siteHint",
        "Shows in your notifications on SC Market.",
      ),
    ],
    push: [
      t("settings.priceAlerts.push", "Push notification"),
      t(
        "settings.priceAlerts.pushHint",
        "On phones and browsers where you enabled push notifications.",
      ),
    ],
    email: [
      t("settings.priceAlerts.email", "Email"),
      t(
        "settings.priceAlerts.emailHint",
        "Sent to your verified email address. Off until you turn it on.",
      ),
    ],
    discord: [
      t("settings.priceAlerts.discord", "Discord DM"),
      t(
        "settings.priceAlerts.discordHint",
        "A direct message from the SC Market bot.",
      ),
    ],
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FlatSection title={t("settings.priceAlerts.title", "Price Alerts")}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t(
                "settings.priceAlerts.description",
                "Watch an item with /watchlist add in Discord. When a public listing hits your target price, you're alerted on the channels you turn on here.",
              )}
            </Typography>
            {(isError || saveFailed) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {t(
                  "settings.priceAlerts.error",
                  "Couldn't load or save your price alert settings.",
                )}
              </Alert>
            )}
            {isLoading || !data
              ? !isError && <CircularProgress />
              : CHANNELS.map((channel) => (
                  <FormControlLabel
                    key={channel}
                    control={
                      <Switch
                        checked={data[channel]}
                        disabled={isSaving}
                        onChange={(e) =>
                          update({
                            updatePriceAlertPreferencesRequest: {
                              [channel]: e.target.checked,
                            },
                          })
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">
                          {labels[channel][0]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {labels[channel][1]}
                        </Typography>
                      </Box>
                    }
                    labelPlacement="start"
                    sx={{
                      width: "100%",
                      justifyContent: "space-between",
                      ml: 0,
                      mb: 1,
                    }}
                  />
                ))}
          </Grid>
        </FlatSection>
      </Grid>
    </Grid>
  )
}
