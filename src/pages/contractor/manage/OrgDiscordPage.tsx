import { Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { DiscordBotDetails } from "../../../views/settings/DiscordBotDetails"
import { ConfigureDiscord } from "../../../views/notifications/ConfigureDiscord"
import { AddNotificationWebhook } from "../../../views/notifications/AddNotificationWebhook"
import { MyWebhooks } from "../../../views/notifications/ListNotificationWebhooks"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

export function OrgDiscordPage() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <DiscordBotDetails org />
      <ConfigureDiscord org />
      <AddNotificationWebhook org />
      <MyWebhooks org />
    </Grid>
  )
}
