import { Alert, Grid } from "@mui/material"
import React from "react"
import { DiscordBotDetails } from "./DiscordBotDetails"
import { ConfigureDiscord } from "../notifications/ConfigureDiscord"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"

export function DiscordIntegrationSettings() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  return (
    <Grid
      container
      spacing={theme.layoutSpacing.layout * 4}
      alignItems={"flex-start"}
    >
      <DiscordBotDetails />
      <ConfigureDiscord />
      <Grid item xs={12}>
        <Alert severity="info">{t("accountUi.webhooksMoved")}</Alert>
      </Grid>
    </Grid>
  )
}
