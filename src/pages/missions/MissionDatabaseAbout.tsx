import { Grid, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { GameDataFreshness } from "../../components/game-data/GameDataFreshness"
import { MissionHubIndexLinks } from "./MissionHubIndexLinks"
import { missionsCapabilityText } from "../../seo/missionText"

/** What the mission database offers, in plain text, with hub links and data freshness. */
export function MissionDatabaseAbout({ total }: { total: number | undefined }) {
  const { t } = useTranslation()
  return (
    <Grid item xs={12} component="section" aria-labelledby="missions-about">
      <Typography
        id="missions-about"
        variant="h6"
        component="h2"
        color="text.secondary"
        sx={{ mt: 4, mb: 1 }}
      >
        {t("missions.about.title", "About the mission database")}
      </Typography>
      {missionsCapabilityText(total).map((line) => (
        <Typography
          key={line}
          variant="body2"
          color="text.primary"
          component="p"
          sx={{ mb: 0.75 }}
        >
          {line}
        </Typography>
      ))}
      <MissionHubIndexLinks />
      <GameDataFreshness />
    </Grid>
  )
}
