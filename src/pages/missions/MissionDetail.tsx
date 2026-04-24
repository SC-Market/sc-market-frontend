/**
 * MissionDetail — standalone page using shared MissionDetailContent.
 */

import React from "react"
import { Box, Alert, Grid } from "@mui/material"
import { useParams, useNavigate } from "react-router-dom"
import { useGetMissionDetailQuery } from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { MissionName } from "../../components/game-data/MissionName"
import { MissionHeaderChips, MissionDetailTabs } from "../../components/game-data/MissionDetailContent"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"

export function MissionDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data, isLoading, error } = useGetMissionDetailQuery(
    { missionId: slug! },
    { skip: !slug },
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
      error={error || undefined}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {isLoading && (
        <Grid item xs={12}>
          <DetailPageSkeleton />
        </Grid>
      )}
      {error && (
        <Grid item xs={12}>
          <Alert severity="error">Failed to load mission details.</Alert>
        </Grid>
      )}
      {data && m && (
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <MissionHeaderChips mission={m} />
          </Box>
          <MissionDetailTabs data={data} onBlueprintClick={(id) => navigate(`/blueprints/${id}`)} />
        </Grid>
      )}
    </StandardPageLayout>
  )
}
