/**
 * MissionDetail — standalone page using shared MissionDetailContent.
 */

import React from "react"
import { Box, CircularProgress, Alert, Grid2 as Grid } from "@mui/material"
import { useParams, useNavigate } from "react-router-dom"
import { useGetMissionDetailQuery } from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { MissionName } from "../../components/game-data/MissionName"
import { MissionHeaderChips, MissionDetailTabs } from "../../components/game-data/MissionDetailContent"

export function MissionDetail() {
  const { mission_id: missionId } = useParams<{ mission_id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data, isLoading, error } = useGetMissionDetailQuery(
    { missionId: missionId! },
    { skip: !missionId },
  )

  const m = data?.mission

  return (
    <StandardPageLayout
      title={m?.mission_name || t("missions.detail.title", "Mission Detail")}
      headerTitle={m?.mission_name || t("missions.detail.header", "Mission Detail")}
      breadcrumbs={[
        { label: "Missions", href: "/missions" },
        { label: m?.mission_name || "Detail" },
      ]}
      isLoading={isLoading}
      error={error ? "not_found" : undefined}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {isLoading && (
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
        </Grid>
      )}
      {error && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="error">Failed to load mission details.</Alert>
        </Grid>
      )}
      {data && m && (
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mb: 2 }}>
            <MissionHeaderChips mission={m} />
          </Box>
          <MissionDetailTabs data={data} onBlueprintClick={(id) => navigate(`/blueprints/${id}`)} />
        </Grid>
      )}
    </StandardPageLayout>
  )
}
