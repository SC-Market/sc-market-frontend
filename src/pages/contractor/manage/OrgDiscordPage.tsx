import { Alert, Grid } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { DiscordBotDetails } from "../../../views/settings/DiscordBotDetails"
import { ConfigureDiscord } from "../../../views/notifications/ConfigureDiscord"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { Section } from "../../../components/paper/Section"
import { LinkedDiscordServers } from "../../../features/discord-install/LinkedDiscordServers"

export function OrgDiscordPage() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const { contractor_id } = useParams<{ contractor_id: string }>()

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <DiscordBotDetails org />
      {contractor_id && (
        <Section
          title={t("linkedDiscord.title", "Your Discord servers")}
          xs={12}
        >
          <Grid item xs={12}>
            <LinkedDiscordServers
              owner={{ org: contractor_id }}
              src="org_discord"
            />
          </Grid>
        </Section>
      )}
      <ConfigureDiscord org />
      <Grid item xs={12}>
        <Alert severity="info">{t("orgAdminUi.webhooksMoved")}</Alert>
      </Grid>
    </Grid>
  )
}
