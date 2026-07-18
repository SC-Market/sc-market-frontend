import { Alert, Grid } from "@mui/material"
import React from "react"
import { DiscordBotDetails } from "./DiscordBotDetails"
import { ConfigureDiscord } from "../notifications/ConfigureDiscord"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function DiscordIntegrationSettings() {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Grid
      container
      spacing={theme.layoutSpacing.layout * 4}
      alignItems={"flex-start"}
    >
      <DiscordBotDetails />
      <ConfigureDiscord />
      <Grid item xs={12}>
        <Alert severity="info">
          Webhooks are now managed from your shop's settings page.
        </Alert>
      </Grid>
    </Grid>
  )
}
