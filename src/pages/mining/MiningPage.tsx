import React from "react"
import { Grid, Tab, Tabs } from "@mui/material"
import { useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { VersionSelector } from "../../components/game-data/VersionSelector"
import { MiningOreBrowser } from "./MiningOreBrowser"
import { MiningLocationBrowser } from "./MiningLocationBrowser"

export function MiningPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const tab = location.pathname.includes("/mining/locations") ? "locations" : "ores"

  const handleTabChange = (_: React.SyntheticEvent, value: string) => {
    navigate(value === "locations" ? "/mining/locations" : "/mining", { replace: true })
  }

  return (
    <StandardPageLayout
      title={t("mining.title", "Mining Database")}
      headerTitle={t("mining.title", "Mining Database")}
      headerActions={<VersionSelector compact width={220} />}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }} variant="fullWidth">
          <Tab label={t("mining.ores", "Ores")} value="ores" />
          <Tab label={t("mining.locations", "Locations")} value="locations" />
        </Tabs>
        {tab === "ores" ? <MiningOreBrowser /> : <MiningLocationBrowser />}
      </Grid>
    </StandardPageLayout>
  )
}
