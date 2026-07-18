import { Alert, Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { DiscordBotDetails } from "../../../views/settings/DiscordBotDetails"
import { ConfigureDiscord } from "../../../views/notifications/ConfigureDiscord"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

export function OrgDiscordPage() {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <DiscordBotDetails org />
      <ConfigureDiscord org />
      <Grid item xs={12}>
        <Alert severity="info">
          Webhooks are now managed from your shop's settings page.
        </Alert>
      </Grid>
    </Grid>
  )
}
