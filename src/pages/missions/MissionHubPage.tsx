/**
 * /missions/<kind>/<slug>: one mission hub (a giver, faction, type or star
 * system). Header (kind, name, systems · count · faction, data freshness,
 * "Filter in mission search"), the plain-language summary built from its
 * data, stat tiles, the reputation ladder (giver and faction hubs with rank
 * data), the missions (grouped on one-page hubs, flat and sortable on
 * paginated ones; ?page=N, 100 per page, real links), and an aside with the
 * facts, blueprint rewards and related hubs. Prerendered
 * (src/prerender/paths.ts) with the bridge's head (seo/missionHubs.ts);
 * ?page=N gets its head from the bridge.
 *
 * Desktop: a mission opens in the detail modal over the hub (URL
 * /missions/<code>; closing returns to the hub). Mobile: its page.
 */
import React, { useMemo, useState } from "react"
import { Alert, Box, Grid, Skeleton, Typography } from "@mui/material"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  useGetActiveVersionsQuery,
  useGetMissionHubQuery,
  type MissionHubDetailResponse,
  type MissionHubKind,
} from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { GameDataFreshness } from "../../components/game-data/GameDataFreshness"
import { MissionDetailModal } from "../../components/game-data/MissionDetailModal"
import { usePageReady } from "../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../components/metadata/pageReadyStore"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { SeoHead } from "../../seo/SeoHead"
import { headDescription, type PageHead } from "../../seo/pageHead"
import { pagedPath, queryIndexing } from "../../seo/queryIndexing"
import { gameVersionLabel } from "../../seo/missionText"
import {
  buildMissionHubHead,
  MISSION_HUB_PAGE_SIZE,
  missionHubFactRows,
  missionHubFactsTitle,
  missionHubKindLabel,
  missionHubLadder,
  missionHubReputationFaction,
  missionHubSummary,
  missionHubText,
} from "../../seo/missionHubs"
import { FRONTEND_URL } from "../../util/constants"
import { MissionHubIndexLinks } from "./MissionHubIndexLinks"
import { NumberedPagination } from "../../components/pagination/NumberedPagination"
import { scrollPageToTop } from "../../components/layout/pageScroll"
import { HubHeader } from "./hub/HubHeader"
import { HubRelated } from "./hub/HubRelated"
import { HubSummary } from "./hub/HubSummary"
import { HubStatTiles } from "./hub/HubStatTiles"
import { RankLadder } from "./hub/RankLadder"
import { HubMissionList } from "./hub/HubMissionList"
import { HubFacts } from "./hub/HubFacts"
import { HubBlueprintRewards } from "./hub/HubBlueprintRewards"
import { useHubMissionModal } from "./hub/useHubMissionModal"
import {
  DEFAULT_HUB_FILTERS,
  groupHubMissions,
  hubListMode,
  hubStatTiles,
  ladderRungs,
  type HubListFilters,
} from "./hub/hubModel"

/** Hub pages are bare `?page=N` URLs: the links carry no other params. */
const NO_PARAMS = new URLSearchParams()

/** Page N's head: self-canonical, "— Page N" in the title (like the bridge's paginate). */
function pagedHead(head: PageHead, path: string, page: number): PageHead {
  if (page <= 1) return head
  const canonical = `${FRONTEND_URL}${pagedPath(path, page)}`
  const title = head.title?.replace(
    / \| SC Market$/,
    ` — Page ${page} | SC Market`,
  )
  return { ...head, title, canonical }
}

function isNotFound(error: unknown): boolean {
  return (
    !!error &&
    typeof error === "object" &&
    "status" in error &&
    (error as { status: unknown }).status === 404
  )
}

export function MissionHubPage({ kind }: { kind: MissionHubKind }) {
  const { slug = "" } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || "en"
  const page = queryIndexing(searchParams).pageNumber ?? 1
  const [filters, setFilters] = useState<HubListFilters>(DEFAULT_HUB_FILTERS)

  const query = useGetMissionHubQuery(
    {
      kind,
      slug,
      page,
      pageSize: MISSION_HUB_PAGE_SIZE,
      sort: filters.sort === "name" ? undefined : filters.sort,
      type: filters.type,
      maxRank: filters.maxRank,
      hasBlueprints: filters.hasBlueprints || undefined,
    },
    { skip: !slug },
  )
  const { data, isLoading, isFetching, error } = query
  const { data: versions } = useGetActiveVersionsQuery()
  usePageReady(isPrimaryLoading(query))

  const path = GAME_DATA_PATHS.missionHub(kind, slug)
  const head = useMemo(
    () =>
      data
        ? pagedHead(
            buildMissionHubHead(data, FRONTEND_URL, t, lang, versions?.LIVE),
            path,
            page,
          )
        : null,
    [data, t, lang, versions?.LIVE, path, page],
  )
  const text = data ? missionHubText(data, t) : null
  const kindLabel = missionHubKindLabel(kind, t)
  const notFound = isNotFound(error)

  const changeFilters = (next: HubListFilters) => {
    setFilters(next)
    // A new filter starts the list over at its first page.
    if (page > 1) navigate(path)
  }

  return (
    <StandardPageLayout
      title={head?.title ?? kindLabel}
      description={head ? headDescription(head) : ""}
      canonicalUrl={path}
      breadcrumbs={[
        {
          label: t("missionHubs.missions", "Missions"),
          href: GAME_DATA_PATHS.missions,
        },
        { label: kindLabel, href: GAME_DATA_PATHS.missionHubs(kind) },
        { label: data?.name ?? slug },
      ]}
      sidebarOpen={true}
      maxWidth="lg"
    >
      <Grid item xs={12}>
        {head && <SeoHead head={head} />}
        {isLoading && <HubSkeleton />}
        {error && (
          <Alert severity={notFound ? "info" : "error"} sx={{ mb: 2 }}>
            {notFound
              ? t(
                  "missionHubs.notFound",
                  "This mission hub doesn't exist. Hubs change with game updates: browse them all below.",
                )
              : t(
                  "missionHubs.loadError",
                  "Failed to load this mission hub. Please try again.",
                )}
          </Alert>
        )}
        {!data && !isLoading && (
          <Typography
            variant="h4"
            component="h1"
            color="text.secondary"
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            {kindLabel}
          </Typography>
        )}
        {data && text && (
          <HubBody
            hub={data}
            heading={text.heading}
            page={page}
            lang={lang}
            filters={filters}
            onFiltersChange={changeFilters}
            busy={isFetching}
            versionLabel={
              versions?.LIVE ? gameVersionLabel(versions.LIVE) : null
            }
          />
        )}
        <Box
          component="footer"
          sx={{ mt: 1, pt: 2, borderTop: 1, borderColor: "divider" }}
        >
          <MissionHubIndexLinks sx={{ mt: 0 }} />
          <GameDataFreshness />
        </Box>
      </Grid>
    </StandardPageLayout>
  )
}

function HubBody({
  hub,
  heading,
  page,
  lang,
  filters,
  onFiltersChange,
  busy,
  versionLabel,
}: {
  hub: MissionHubDetailResponse
  heading: string
  page: number
  lang: string
  filters: HubListFilters
  onFiltersChange: (next: HubListFilters) => void
  busy: boolean
  versionLabel: string | null
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isMobile = useBreakpointDown("lg")
  const modal = useHubMissionModal()
  const path = GAME_DATA_PATHS.missionHub(hub.kind, hub.slug)

  const summary = missionHubSummary(hub, t, lang)
  const tiles = hubStatTiles(hub, t, lang)
  const ladder = missionHubLadder(hub)
  const rungs = ladder ? ladderRungs(ladder) : []
  const faction = missionHubReputationFaction(hub)
  const mode = hubListMode(hub, filters.sort)
  const groups =
    mode === "flat" ? [] : groupHubMissions(hub.missions, mode, ladder, t, lang)
  const facts = missionHubFactRows(hub, t, lang)

  return (
    <>
      <HubHeader
        hub={hub}
        heading={heading}
        lang={lang}
        versionLabel={versionLabel}
      />

      <HubSummary summary={summary} />
      <HubStatTiles tiles={tiles} />

      {ladder && (
        <RankLadder
          rungs={rungs}
          ladderName={ladder.scope_display_name}
          factionName={faction?.name}
          selected={filters.maxRank}
          onSelect={(maxRank) => onFiltersChange({ ...filters, maxRank })}
          totalMissions={hub.mission_count}
          unrankedMissions={hub.unranked_mission_count}
          lang={lang}
        />
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "minmax(0, 1fr) 336px",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <HubMissionList
            hub={hub}
            missions={hub.missions}
            mode={mode}
            groups={groups}
            filters={filters}
            onFiltersChange={onFiltersChange}
            showRank={!!ladder}
            busy={busy}
            lang={lang}
            onOpen={isMobile ? undefined : modal.openMission}
            pagination={
              hub.filtered_count > MISSION_HUB_PAGE_SIZE ? (
                <NumberedPagination
                  count={hub.filtered_count}
                  page={page - 1}
                  rowsPerPage={MISSION_HUB_PAGE_SIZE}
                  onPageChange={(newPage) => {
                    navigate(pagedPath(path, newPage + 1))
                    scrollPageToTop()
                  }}
                  link={{ path, searchParams: NO_PARAMS }}
                  sx={{ mt: 1.5, px: 0 }}
                />
              ) : undefined
            }
          />
        </Box>
        <Box
          component="aside"
          aria-label={t("missionHubs.aside", "About this hub")}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            minWidth: 0,
            mb: 3,
          }}
        >
          <HubFacts title={missionHubFactsTitle(hub.kind, t)} rows={facts} />
          {hub.blueprint_rewards.length > 0 && (
            <HubBlueprintRewards
              items={hub.blueprint_rewards}
              ladder={ladder}
              lang={lang}
            />
          )}
          <HubRelated hub={hub} />
        </Box>
      </Box>

      <MissionDetailModal
        missionId={modal.openId}
        open={!!modal.openId}
        onClose={modal.close}
        onBlueprintClick={(name) => {
          modal.dismiss()
          navigate(GAME_DATA_PATHS.blueprint(encodeURIComponent(name)))
        }}
      />
    </>
  )
}

function HubSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width={120} />
      <Skeleton variant="text" width="45%" height={48} />
      {[90, 70].map((w) => (
        <Skeleton key={w} variant="text" width={`${w}%`} />
      ))}
      <Skeleton variant="rounded" height={84} sx={{ mt: 2 }} />
      <Skeleton variant="rounded" height={420} sx={{ mt: 3 }} />
    </Box>
  )
}
