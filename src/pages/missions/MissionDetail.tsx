/**
 * MissionDetail — standalone page using shared MissionDetailContent.
 */

import React from "react"
import { Box, Alert, Grid, Typography } from "@mui/material"
import { useParams, useNavigate } from "react-router-dom"
import { useGetActiveVersionsQuery, useGetMissionDetailQuery } from "../../store/api/v2/market"
import { GameDataFreshness } from "../../components/game-data/GameDataFreshness"
import { missionSummaryLine, missionTitle, readableMissionText } from "../../seo/missionText"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { MissionName } from "../../components/game-data/MissionName"
import { MissionHeaderChips, MissionDetailTabs } from "../../components/game-data/MissionDetailContent"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { FRONTEND_URL } from "../../util/constants"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { buildMissionHead } from "../../seo/gameDataHeads"
import { headDescription } from "../../seo/pageHead"
import { SeoHead } from "../../seo/SeoHead"

export function MissionDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data, isLoading, error } = useGetMissionDetailQuery(
    { missionId: slug! },
    { skip: !slug },
  )

  const m = data?.mission

  const { data: versions } = useGetActiveVersionsQuery()
  const head = data && m && slug ? buildMissionHead(data, slug, FRONTEND_URL, versions?.LIVE) : null
  const seoTitle = head?.title ?? "Mission Detail | SC Market"
  const seoDescription = head ? headDescription(head) : ""

  return (
    <StandardPageLayout
      title={seoTitle}
      description={seoDescription}
      canonicalUrl={`/missions/${slug}`}
      headerTitle={m ? missionTitle(m) : t("missions.detail.header", "Mission Detail")}
      breadcrumbs={[
        { label: "Missions", href: GAME_DATA_PATHS.missions },
        { label: m ? readableMissionText(m.mission_name) : "Detail" },
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
          {head && <SeoHead head={head} />}
          <Box sx={{ mb: 2 }}>
            <MissionHeaderChips mission={m} />
          </Box>
          {/* The quotable one-liner (same text as the description and the bridge). */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {missionSummaryLine(m, data.blueprint_rewards)}
          </Typography>
          <MissionDetailTabs data={data} onBlueprintClick={(id) => navigate(GAME_DATA_PATHS.blueprint(id))} />
          <GameDataFreshness />
        </Grid>
      )}
    </StandardPageLayout>
  )
}
