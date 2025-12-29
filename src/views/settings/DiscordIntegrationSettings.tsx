import { Grid } from "@mui/material"
import React from "react"
import { MyWebhooks } from "../notifications/ListNotificationWebhooks"
import { AddNotificationWebhook } from "../notifications/AddNotificationWebhook"
import { DiscordBotDetails } from "./DiscordBotDetails"
import { ConfigureDiscord } from "../notifications/ConfigureDiscord"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function DiscordIntegrationSettings() {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Grid container spacing={theme.layoutSpacing.layout * 4} alignItems={"flex-start"}>
      <DiscordBotDetails />
      <ConfigureDiscord />
      <AddNotificationWebhook />
      <MyWebhooks />
    </Grid>
  )
}
