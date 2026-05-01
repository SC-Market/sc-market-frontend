import React from "react"
import { Grid, Tab, Tabs } from "@mui/material"
import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { MiningOreBrowser } from "./MiningOreBrowser"
import { MiningLocationBrowser } from "./MiningLocationBrowser"

export function MiningPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get("tab") || "ores"

  const handleTabChange = (_: React.SyntheticEvent, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    // Clear tab-specific filters when switching
    for (const key of ["rarity", "mining_method", "location_type"]) params.delete(key)
    params.delete("page")
    setSearchParams(params, { replace: true })
  }

  return (
    <StandardPageLayout
      title={t("mining.title", "Mining Database")}
      headerTitle={t("mining.title", "Mining Database")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label={t("mining.ores", "Ores")} value="ores" />
          <Tab label={t("mining.locations", "Locations")} value="locations" />
        </Tabs>
        {tab === "ores" ? <MiningOreBrowser /> : <MiningLocationBrowser />}
      </Grid>
    </StandardPageLayout>
  )
}
