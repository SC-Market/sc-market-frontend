import { Alert, Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { DiscordBotDetails } from "../../../views/settings/DiscordBotDetails"
import { ConfigureDiscord } from "../../../views/notifications/ConfigureDiscord"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"

export function OrgDiscordPage() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <DiscordBotDetails org />
      <ConfigureDiscord org />
      <Grid item xs={12}>
        <Alert severity="info">
          {t("orgAdminUi.webhooksMoved")}
        </Alert>
      </Grid>
    </Grid>
  )
}
