/**
 * /missions/givers, /missions/factions, /missions/types, /missions/systems:
 * every hub of the kind with its mission count, linked to the hub pages.
 * Prerendered (src/prerender/paths.ts); the head is the bridge's
 * (seo/missionHubs.ts), so the browser and crawlers get the same one.
 */
import React, { useMemo } from "react"
import { Box, Chip, Grid, Link, Paper, Skeleton, Stack, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useGetActiveVersionsQuery, useGetMissionHubsQuery, type MissionHubKind } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { GameDataFreshness } from "../../components/game-data/GameDataFreshness"
import { usePageReady } from "../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../components/metadata/pageReadyStore"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { SeoHead } from "../../seo/SeoHead"
import { headDescription } from "../../seo/pageHead"
import {
  buildMissionHubIndexHead,
  missionCountText,
  missionHubIndexText,
  missionHubKindLabel,
} from "../../seo/missionHubs"
import { FRONTEND_URL } from "../../util/constants"
import { MissionHubIndexLinks } from "./MissionHubIndexLinks"

export function MissionHubIndex({ kind }: { kind: MissionHubKind }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || "en"
  const query = useGetMissionHubsQuery()
  const { data, isLoading, error } = query
  const { data: versions } = useGetActiveVersionsQuery()
  usePageReady(isPrimaryLoading(query))

  const hubs = data?.[kind]
  const text = missionHubIndexText(kind, hubs, t, lang)
  const head = useMemo(
    () => (data ? buildMissionHubIndexHead(kind, data, FRONTEND_URL, t, lang, versions?.LIVE) : null),
    [kind, data, t, lang, versions?.LIVE],
  )
  const label = missionHubKindLabel(kind, t)

  return (
    <StandardPageLayout
      title={head?.title ?? text.title}
      description={head ? headDescription(head) : text.description}
      canonicalUrl={GAME_DATA_PATHS.missionHubs(kind)}
      headerTitle={text.heading}
      breadcrumbs={[{ label: t("missionHubs.missions", "Missions"), href: GAME_DATA_PATHS.missions }, { label }]}
      error={error || undefined}
      sidebarOpen={true}
      maxWidth="lg"
    >
      <Grid item xs={12}>
        {head && <SeoHead head={head} />}
        <Typography variant="body1" color="text.secondary" component="p" sx={{ mb: 2 }}>
          {isLoading ? <Skeleton variant="text" width="80%" /> : text.description}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
            {label}
          </Typography>
          {isLoading ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {Array.from({ length: 24 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" width={140} height={28} />
              ))}
            </Stack>
          ) : (
            <Box
              component="ul"
              sx={{
                listStyle: "none",
                m: 0,
                p: 0,
                display: "grid",
                gap: 1,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
              }}
            >
              {(hubs ?? []).map((hub) => (
                <Box component="li" key={hub.slug} sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                  <Link
                    component={RouterLink}
                    to={GAME_DATA_PATHS.missionHub(kind, hub.slug)}
                    underline="hover"
                    sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {hub.name}
                  </Link>
                  <Chip size="small" variant="outlined" label={missionCountText(hub.mission_count, t, lang)} />
                </Box>
              ))}
            </Box>
          )}
        </Paper>
        <MissionHubIndexLinks except={kind} />
        <GameDataFreshness />
      </Grid>
    </StandardPageLayout>
  )
}
