/**
 * Mission Search Component
 *
 * Search and filter missions with comprehensive filters including:
 * - Text search with debouncing
 * - Category, career type, location filters
 * - Legal status, difficulty, sharing status
 * - Blueprint rewards, credit rewards
 * - Community ratings
 * - Pagination
 *
 * Task 11.1 - Mission Search Frontend
 * Requirements: 1.1-1.6, 16.1-16.6, 17.1-17.6, 41.1-41.10
 */

import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Skeleton,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { ViewListRounded, ViewModuleRounded } from "@mui/icons-material"
import {
  useSearchMissionsQuery,
  useGetGameEventsQuery,
  type MissionSearchResult,
} from "../../store/api/v2/market"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useDebounce } from "../../hooks/useDebounce"
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll"
import { MissionCard, MissionFilters } from "../../components/game-data"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { MISSION_CARD_GRID } from "../../components/game-data/cardGrids"
import {
  UnifiedSearchBar,
  type SearchToken,
} from "../../components/game-data/UnifiedSearchBar"
import { useTranslation } from "react-i18next"
import { MissionDetailModal } from "../../components/game-data/MissionDetailModal"
import { BlueprintDetailModal } from "../../components/game-data/BlueprintDetailModal"
import { VersionSelector } from "../../components/game-data/VersionSelector"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { useLocalStorageState } from "../../hooks/storage/useLocalStorageState"
import { missionsSeoText } from "../../seo/hubHeads"
import { usePageReady } from "../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../components/metadata/pageReadyStore"

import { MissionResultsTable } from "./MissionResultsTable"
import { useMissionFilterParams } from "./useMissionFilterParams"
import { MissionDatabaseAbout } from "./MissionDatabaseAbout"
import { MissionTableSkeleton } from "./MissionResultsTable"

const VIEW_MODES = ["list", "grid"] as const

export function MissionSearch() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Search and filter state — synced with URL search params
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    searchText,
    category,
    careerType,
    starSystem,
    faction,
    missionGiver,
    legalStatus,
    difficultyRange,
    isShareable,
    hasBlueprints,
    isChainStarter,
    creditRewardMin,
    setSearchText,
    setCategory,
    setCareerType,
    setStarSystem,
    setFaction,
    setMissionGiver,
    setLegalStatus,
    setDifficultyRange,
    setIsShareable,
    setHasBlueprints,
    setIsChainStarter,
    setCreditRewardMin,
    eventCode,
    setEventCode,
    showEventMissions,
    setShowEventMissions,
    searchTokens,
    handleTokensChange,
  } = useMissionFilterParams(searchParams, setSearchParams)

  const [page, setPage] = useState(1)
  const [allMissions, setAllMissions] = useState<MissionSearchResult[]>([])
  const { data: eventsData } = useGetGameEventsQuery()
  const eventOptions: SearchToken[] = useMemo(
    () =>
      (eventsData?.events || []).map((e) => ({
        type: "event" as const,
        label: e.event_name,
        value: e.event_code,
      })),
    [eventsData],
  )

  const [viewMode, setViewMode] = useLocalStorageState<"list" | "grid">(
    "missions-view",
    "list",
    VIEW_MODES,
  )
  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    v: "list" | "grid" | null,
  ) => {
    if (v) setViewMode(v)
  }
  const isMobile = useBreakpointDown("lg")

  // Debounce search text for performance (Requirement 1.6: <200ms response)
  const debouncedSearch = useDebounce(searchText, 300)

  // Reset accumulated results when filters change
  const filterKey = JSON.stringify({
    debouncedSearch,
    category,
    careerType,
    starSystem,
    faction,
    missionGiver,
    legalStatus,
    difficultyRange,
    isShareable,
    hasBlueprints,
    isChainStarter,
    creditRewardMin,
    eventCode,
    showEventMissions,
  })
  useEffect(() => {
    setPage(1)
    setAllMissions([])
  }, [filterKey])

  // Query missions with filters
  const {
    data,
    isLoading,
    isFetching,
    error,
    currentData: pageCurrentData,
  } = useSearchMissionsQuery({
    text: debouncedSearch || undefined,
    category: category || undefined,
    careerType: careerType || undefined,
    starSystem: starSystem || undefined,
    faction: faction || undefined,
    missionGiverOrg: missionGiver || undefined,
    legalStatus: legalStatus || undefined,
    difficultyMin:
      difficultyRange[0] === 1 && difficultyRange[1] === 5
        ? undefined
        : difficultyRange[0],
    difficultyMax:
      difficultyRange[0] === 1 && difficultyRange[1] === 5
        ? undefined
        : difficultyRange[1],
    isShareable: isShareable,
    hasBlueprintRewards: hasBlueprints,
    isChainStarter: isChainStarter,
    creditRewardMin: creditRewardMin || undefined,
    eventCode: eventCode || undefined,
    excludeEvents: eventCode ? false : !showEventMissions,
    page,
    pageSize: 40,
  })
  // Primary content: drives main[data-ready].
  usePageReady(
    isPrimaryLoading({ isLoading, isFetching, currentData: pageCurrentData }),
  )

  const handleMissionClick = (missionCode: string, missionId: string) => {
    const params = searchParams.toString()
    const qs = params ? `?${params}` : ""
    if (isMobile) {
      navigate(`${GAME_DATA_PATHS.mission(missionCode)}${qs}`)
    } else {
      navigate(`${GAME_DATA_PATHS.mission(missionCode)}${qs}`, {
        replace: false,
      })
      setSelectedMissionId(missionId) // modal still uses ID for API
    }
  }
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(
    null,
  )
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(
    null,
  )

  // Auto-open modal if URL has a mission_id (e.g., /missions/:mission_id on desktop)
  const urlParams = useParams<{ slug?: string }>()
  React.useEffect(() => {
    if (urlParams.slug && !isMobile) {
      setSelectedMissionId(urlParams.slug)
    }
  }, [urlParams.slug, isMobile])

  // Accumulate results for infinite scroll
  // The first page renders straight from the query (before the accumulating
  // effect runs), so the first render — and a prerendered page — has it.
  const shownMissions =
    allMissions.length === 0 && page === 1 && data?.missions
      ? data.missions
      : allMissions
  useEffect(() => {
    if (data?.missions) {
      setAllMissions((prev) =>
        page === 1 ? data.missions : [...prev, ...data.missions],
      )
    }
  }, [data, page])

  const hasMore = data ? page * data.page_size < data.total : false
  const loadMore = useCallback(() => setPage((p) => p + 1), [])
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isFetching,
    onLoadMore: loadMore,
  })

  const { title: pageTitle, description: pageDescription } = useMemo(
    () => missionsSeoText(category, data?.total),
    [category, data?.total],
  )

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true })
    setPage(1)
    setAllMissions([])
  }

  const filterContent = (
    <MissionFilters
      searchText={searchText}
      onSearchTextChange={setSearchText}
      category={category}
      onCategoryChange={setCategory}
      careerType={careerType}
      onCareerTypeChange={setCareerType}
      starSystem={starSystem}
      onStarSystemChange={setStarSystem}
      faction={faction}
      onFactionChange={setFaction}
      missionGiver={missionGiver}
      onMissionGiverChange={setMissionGiver}
      legalStatus={legalStatus}
      onLegalStatusChange={setLegalStatus}
      difficultyRange={difficultyRange}
      onDifficultyRangeChange={setDifficultyRange}
      isShareable={isShareable}
      onIsShareableChange={setIsShareable}
      hasBlueprints={hasBlueprints}
      onHasBlueprintsChange={setHasBlueprints}
      isChainStarter={isChainStarter}
      onIsChainStarterChange={setIsChainStarter}
      creditRewardMin={creditRewardMin}
      onCreditRewardMinChange={setCreditRewardMin}
      eventCode={eventCode}
      onEventCodeChange={setEventCode}
      showEventMissions={showEventMissions}
      onShowEventMissionsChange={setShowEventMissions}
      onResetFilters={handleResetFilters}
    />
  )

  return (
    <StandardPageLayout
      title={pageTitle}
      description={pageDescription}
      headerTitle={t("missions.search.header", "Mission Database")}
      sidebarOpen={true}
      maxWidth="xl"
      headerActions={<VersionSelector compact width={220} />}
    >
      <Grid item xs={12}>
        <FilterSidebarLayout
          filters={filterContent}
          filterTitle={t("missions.filters", "Filters")}
        >
          {/* Search toolbar: rendered while loading too, so the results below
          start at the same height in the skeleton and the loaded page */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
            <UnifiedSearchBar
              tokens={searchTokens}
              onChange={handleTokensChange}
              extraOptions={eventOptions}
              placeholder={t("missionsUi.searchPlaceholder")}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              {isLoading ? <Skeleton variant="text" width={32} /> : data?.total}
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton
                value="list"
                aria-label={t("ui.viewMode.list", "List view")}
              >
                <ViewListRounded />
              </ToggleButton>
              <ToggleButton
                value="grid"
                aria-label={t("ui.viewMode.grid", "Grid view")}
              >
                <ViewModuleRounded />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Loading State */}
          {isLoading &&
            (viewMode === "grid" ? (
              <CardGridSkeleton shape={MISSION_CARD_GRID} />
            ) : (
              <MissionTableSkeleton />
            ))}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t("missionsUi.listLoadFailed")}
            </Alert>
          )}

          {/* Results */}
          {data && (
            <>
              <Grid
                container
                spacing={MISSION_CARD_GRID.spacing}
                alignItems="stretch"
              >
                {viewMode === "grid" ? (
                  shownMissions.map((mission) => (
                    <Grid
                      item
                      {...MISSION_CARD_GRID.item}
                      key={mission.mission_id}
                      sx={{ display: "flex" }}
                    >
                      <MissionCard
                        mission={mission}
                        href={GAME_DATA_PATHS.mission(mission.mission_code)}
                        onClick={() =>
                          handleMissionClick(
                            mission.mission_code,
                            mission.mission_id,
                          )
                        }
                      />
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <MissionResultsTable
                      missions={shownMissions}
                      onMissionClick={handleMissionClick}
                    />
                  </Grid>
                )}
              </Grid>

              {shownMissions.length === 0 && !isFetching && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 6,
                  }}
                >
                  <Typography color="text.secondary">
                    {t(
                      "missions.noResults",
                      "No results found. Try adjusting your filters.",
                    )}
                  </Typography>
                </Box>
              )}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} />
              {isFetching && page > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </>
          )}
        </FilterSidebarLayout>
      </Grid>
      {/* What the database offers, in plain text (prerendered, so search and
          answer engines can describe it). Shared with the bridge and SSR. */}
      <MissionDatabaseAbout total={data?.total} />
      <MissionDetailModal
        missionId={selectedMissionId}
        open={!!selectedMissionId}
        onClose={() => {
          setSelectedMissionId(null)
          navigate(`${GAME_DATA_PATHS.missions}?${searchParams.toString()}`, {
            replace: true,
          })
        }}
        onBlueprintClick={(id) => {
          setSelectedMissionId(null)
          setSelectedBlueprintId(id)
        }}
      />
      <BlueprintDetailModal
        blueprintId={selectedBlueprintId}
        open={!!selectedBlueprintId}
        onClose={() => setSelectedBlueprintId(null)}
      />
    </StandardPageLayout>
  )
}
