import React from "react"
import { Grid, Tab, Tabs } from "@mui/material"
import { useSearchParams, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { VersionSelector } from "../../components/game-data/VersionSelector"
import { MiningOreBrowser } from "./MiningOreBrowser"
import { MiningLocationBrowser } from "./MiningLocationBrowser"

export function MiningPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  // Detect tab from URL path (for /mining/locations/:name routes) or search params
  const pathTab = location.pathname.startsWith("/mining/locations") ? "locations" : location.pathname.startsWith("/mining/ores") ? "ores" : null
  const tab = pathTab || searchParams.get("tab") || "ores"

  const handleTabChange = (_: React.SyntheticEvent, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    for (const key of ["rarity", "mining_method", "location_type"]) params.delete(key)
    params.delete("page")
    setSearchParams(params, { replace: true })
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
