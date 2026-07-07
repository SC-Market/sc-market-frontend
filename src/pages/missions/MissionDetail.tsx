/**
 * MissionDetail — standalone page using shared MissionDetailContent.
 */

import React from "react"
import { Box, Alert, Grid } from "@mui/material"
import { useParams, useNavigate } from "react-router-dom"
import { useGetMissionDetailQuery } from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { Helmet } from "react-helmet"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { MissionName } from "../../components/game-data/MissionName"
import { MissionHeaderChips, MissionDetailTabs } from "../../components/game-data/MissionDetailContent"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { FRONTEND_URL } from "../../util/constants"

export function MissionDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data, isLoading, error } = useGetMissionDetailQuery(
    { missionId: slug! },
    { skip: !slug },
  )

  const m = data?.mission

  const seoTitle = m ? `${m.mission_name} — Star Citizen Mission | SC Market` : "Mission Detail | SC Market"
  const seoDescription = m ? `${m.mission_name} — ${m.category || ""} mission${m.star_system ? " in " + m.star_system : ""}. Rewards, objectives, and walkthrough in Star Citizen.`.slice(0, 160) : ""
  const canonicalUrl = `${FRONTEND_URL}/missions/${slug}`

  return (
    <StandardPageLayout
      title={seoTitle}
      description={seoDescription}
      canonicalUrl={`/missions/${slug}`}
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
          <Helmet>
            <title>{seoTitle}</title>
            <meta name="description" content={seoDescription} />
            <link rel="canonical" href={canonicalUrl} />
            <meta property="og:title" content={seoTitle} />
            <meta property="og:description" content={m.mission_description?.slice(0, 160) || `${m.mission_name} — Star Citizen mission`} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content="article" />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={seoTitle} />
            <meta name="twitter:description" content={seoDescription} />
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "HowTo",
                name: m.mission_name,
                description: m.mission_description || seoDescription,
                ...(m.credit_reward_max && {
                  estimatedCost: {
                    "@type": "MonetaryAmount",
                    currency: "aUEC",
                    value: m.credit_reward_max,
                  },
                }),
                ...(m.star_system && {
                  location: {
                    "@type": "Place",
                    name: m.star_system,
                  },
                }),
              })}
            </script>
          </Helmet>
          <Box sx={{ mb: 2 }}>
            <MissionHeaderChips mission={m} />
          </Box>
          <MissionDetailTabs data={data} onBlueprintClick={(id) => navigate(`/blueprints/${id}`)} />
        </Grid>
      )}
    </StandardPageLayout>
  )
}
