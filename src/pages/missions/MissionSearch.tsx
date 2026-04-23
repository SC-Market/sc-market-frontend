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

import React, { useState, useEffect, useCallback } from "react"
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Skeleton,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Button,
  Avatar,
  Tooltip,
  useMediaQuery,
} from "@mui/material"
import { ViewList, ViewModule, ShieldRounded, BuildRounded } from "@mui/icons-material"
import { useSearchMissionsQuery } from "../../store/api/v2/market"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useDebounce } from "../../hooks/useDebounce"
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll"
import { MissionCard, MissionFilters } from "../../components/game-data"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { MissionDetailModal } from "../../components/game-data/MissionDetailModal"
import { BlueprintDetailModal } from "../../components/game-data/BlueprintDetailModal"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { BottomSheet } from "../../components/mobile/BottomSheet"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { formatCredits, getMissionTypeLabel } from "../../util/missionDisplay"
import { getMissionIcon, getMissionCategoryColor } from "../../util/gameIcons"
import { MissionName } from "../../components/game-data/MissionName"

export function MissionSearch() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  
  // Search and filter state — synced with URL search params
  const [searchParams, setSearchParams] = useSearchParams()

  const searchText = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const careerType = searchParams.get("career") || ""
  const starSystem = searchParams.get("system") || ""
  const faction = searchParams.get("faction") || ""
  const missionGiver = searchParams.get("giver") || ""
  const legalStatus = (searchParams.get("legal") || "") as "" | "LEGAL" | "ILLEGAL"
  const diffMin = parseInt(searchParams.get("diff_min") || "1") || 1
  const diffMax = parseInt(searchParams.get("diff_max") || "5") || 5
  const difficultyRange = [diffMin, diffMax]
  const isShareable = searchParams.get("shareable") === "true" ? true : searchParams.get("shareable") === "false" ? false : undefined
  const hasBlueprints = searchParams.get("blueprints") === "true" ? true : searchParams.get("blueprints") === "false" ? false : undefined
  const isChainStarter = searchParams.get("chain") === "true" ? true : searchParams.get("chain") === "false" ? false : undefined
  const creditRewardMin: number | "" = searchParams.get("min_reward") ? Number(searchParams.get("min_reward")) : ""

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    setSearchParams(params, { replace: true })
  }

  const setSearchText = (v: string) => updateParam("q", v)
  const setCategory = (v: string) => updateParam("category", v)
  const setCareerType = (v: string) => updateParam("career", v)
  const setStarSystem = (v: string) => updateParam("system", v)
  const setFaction = (v: string) => updateParam("faction", v)
  const setMissionGiver = (v: string) => updateParam("giver", v)
  const setLegalStatus = (v: "" | "LEGAL" | "ILLEGAL") => updateParam("legal", v)
  const setDifficultyRange = (v: number[]) => { updateParam("diff_min", v[0] === 1 ? "" : String(v[0])); updateParam("diff_max", v[1] === 5 ? "" : String(v[1])) }
  const setIsShareable = (v: boolean | undefined) => updateParam("shareable", v === undefined ? "" : String(v))
  const setHasBlueprints = (v: boolean | undefined) => updateParam("blueprints", v === undefined ? "" : String(v))
  const setIsChainStarter = (v: boolean | undefined) => updateParam("chain", v === undefined ? "" : String(v))
  const setCreditRewardMin = (v: number | "") => updateParam("min_reward", v === "" ? "" : String(v))
  const eventCode = searchParams.get("event") || ""
  const setEventCode = (v: string) => updateParam("event", v)
  const showEventMissions = searchParams.get("show_events") === "true"
  const setShowEventMissions = (v: boolean) => updateParam("show_events", v ? "true" : "")

  const [page, setPage] = useState(1)
  const [allMissions, setAllMissions] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"list" | "grid">(() => (localStorage.getItem("missions-view") as "list" | "grid") || "list")
  const handleViewModeChange = (_: any, v: "list" | "grid" | null) => { if (v) { setViewMode(v); localStorage.setItem("missions-view", v) } }
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  const [filterOpen, setFilterOpen] = useState(false)
  const bottomNavHeight = useBottomNavHeight()

  // Debounce search text for performance (Requirement 1.6: <200ms response)
  const debouncedSearch = useDebounce(searchText, 300)

  // Reset accumulated results when filters change
  const filterKey = JSON.stringify({
    debouncedSearch, category, careerType, starSystem, faction, missionGiver,
    legalStatus, difficultyRange, isShareable, hasBlueprints, isChainStarter, creditRewardMin, eventCode, showEventMissions,
  })
  useEffect(() => { setPage(1); setAllMissions([]) }, [filterKey])

  // Query missions with filters
  const { data, isLoading, isFetching, error } = useSearchMissionsQuery({
    text: debouncedSearch || undefined,
    category: category || undefined,
    careerType: careerType || undefined,
    starSystem: starSystem || undefined,
    faction: faction || undefined,
    missionGiverOrg: missionGiver || undefined,
    legalStatus: legalStatus || undefined,
    difficultyMin: difficultyRange[0] === 1 && difficultyRange[1] === 5 ? undefined : difficultyRange[0],
    difficultyMax: difficultyRange[0] === 1 && difficultyRange[1] === 5 ? undefined : difficultyRange[1],
    isShareable: isShareable,
    hasBlueprintRewards: hasBlueprints,
    isChainStarter: isChainStarter,
    creditRewardMin: creditRewardMin || undefined,
    eventCode: eventCode || undefined,
    excludeEvents: eventCode ? false : !showEventMissions,
    page,
    pageSize: 20,
  })

  const handleMissionClick = (missionCode: string, missionId: string) => {
    if (isMobile) {
      navigate(`/missions/${missionCode}`)
    } else {
      navigate(`/missions/${missionCode}`, { replace: false })
      setSelectedMissionId(missionId) // modal still uses ID for API
    }
  }
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null)
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null)

  // Auto-open modal if URL has a mission_id (e.g., /missions/:mission_id on desktop)
  const urlParams = useParams<{ slug?: string }>()
  React.useEffect(() => {
    if (urlParams.slug && !isMobile) {
      setSelectedMissionId(urlParams.slug)
    }
  }, [urlParams.slug, isMobile])

  // Accumulate results for infinite scroll
  useEffect(() => {
    if (data?.missions) {
      setAllMissions(prev => page === 1 ? data.missions : [...prev, ...data.missions])
    }
  }, [data, page])

  const hasMore = data ? page * data.page_size < data.total : false
  const loadMore = useCallback(() => setPage(p => p + 1), [])
  const sentinelRef = useInfiniteScroll({ hasMore, isLoading: isFetching, onLoadMore: loadMore })

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
      title={t("missions.search.title", "Mission Database")}
      headerTitle={t("missions.search.header", "Mission Database")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <FilterSidebarLayout filters={filterContent} filterTitle={t("missions.filters", "Filters")}>

      {/* Loading State */}
      {isLoading && <CardGridSkeleton />}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load missions. Please try again.
        </Alert>
      )}

      {/* Results */}
      {data && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Found {data.total} missions
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="list"><ViewList /></ToggleButton>
              <ToggleButton value="grid"><ViewModule /></ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Grid container spacing={0.75} alignItems="stretch">
            {viewMode === "grid" ? (
              allMissions.map((mission) => (
                <Grid item xs={6} sm={6} md={4} lg={3} key={mission.mission_id} sx={{ display: "flex" }}>
                  <MissionCard mission={mission} onClick={() => handleMissionClick(mission.mission_code, mission.mission_id)} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper>
                  <Table size="small" sx={{ "& td, & th": { py: 0.5, px: 1 } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 40 }} />
                        <TableCell>System</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Faction</TableCell>
                        <TableCell sx={{ maxWidth: 280 }}>Tags</TableCell>
                        <TableCell>Materials</TableCell>
                        <TableCell align="center">BPs</TableCell>
                        <TableCell align="right">Base XP</TableCell>
                        <TableCell align="right">Reward</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allMissions.map((m) => (
                        <TableRow
                          key={m.mission_id}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleMissionClick(m.mission_code, m.mission_id)}
                        >
                          <TableCell sx={{ width: 40, py: 0.5 }}>
                            <Tooltip title={getMissionTypeLabel(m.category)} arrow>
                            <Avatar
                              src={getMissionIcon(m.category) || undefined}
                              variant="rounded"
                              sx={{ width: 24, height: 24, bgcolor: getMissionCategoryColor(m.category) }}
                              imgProps={{ style: { objectFit: "contain", padding: 4 } }}
                            >
                              {(m.category || "?")[0].toUpperCase()}
                            </Avatar>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" noWrap sx={{ maxWidth: 80, display: "block" }}>
                              {m.star_system || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <MissionName name={m.mission_name} variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 260 }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 100, display: "block" }}>
                              {m.faction?.includes("~mission") ? "Various" : m.faction || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.25} flexWrap="wrap" useFlexGap>
                              {m.category && <Tooltip title={getMissionTypeLabel(m.category)}><Chip label={getMissionTypeLabel(m.category)} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} /></Tooltip>}
                              {(m.is_illegal || m.legal_status === "ILLEGAL") && <Tooltip title="Illegal Mission"><Chip label="Illegal" size="small" color="error" sx={{ height: 18, fontSize: "0.65rem" }} /></Tooltip>}
                              {m.is_unique_mission && <Tooltip title="Unique (one-time)"><Chip label="Unique" size="small" color="warning" sx={{ height: 18, fontSize: "0.65rem" }} /></Tooltip>}
                              {m.is_chain_starter && <Tooltip title="Chain Starter"><Chip label="Starter" size="small" color="secondary" sx={{ height: 18, fontSize: "0.65rem" }} /></Tooltip>}
                              {m.is_chain_mission && !m.is_chain_starter && <Tooltip title="Part of Chain"><Chip label="Chain" size="small" color="secondary" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} /></Tooltip>}
                              {m.associated_event && <Tooltip title={m.associated_event}><Chip label={m.associated_event} size="small" sx={{ height: 18, fontSize: "0.65rem", maxWidth: 100, bgcolor: "info.main", color: "#fff" }} /></Tooltip>}
                              {m.ship_encounter_count > 0 && <Tooltip title={`${m.ship_encounter_count} ships`}><Chip icon={<ShieldRounded sx={{ fontSize: 14 }} />} label={m.ship_encounter_count} size="small" color="info" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} /></Tooltip>}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {(m.hauling_orders?.length ?? 0) > 0 ? (
                              <Stack direction="row" spacing={0.25} flexWrap="wrap" useFlexGap>
                                {m.hauling_orders!.map((h: any, i: number) => (
                                  <Tooltip key={i} title={h.resource_name} arrow>
                                    <Chip label={h.resource_name.split(/[\s,]+/).filter(Boolean).map((w: string) => w[0]).join("").slice(0, 4).toUpperCase()}
                                      size="small" sx={{ height: 18, fontSize: "0.6rem", fontFamily: "monospace", bgcolor: "action.selected" }} />
                                  </Tooltip>
                                ))}
                              </Stack>
                            ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </TableCell>
                          <TableCell align="center">
                            {m.blueprint_reward_count > 0
                              ? <Chip icon={<BuildRounded sx={{ fontSize: 14 }} />} label={m.blueprint_reward_count} size="small" color="success" sx={{ height: 18, fontSize: "0.65rem", minWidth: 24 }} />
                              : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" color={m.reputation_reward ? "text.primary" : "text.secondary"}>
                              {m.reputation_reward ? `${m.reputation_reward.toLocaleString()} XP` : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color={(m.credit_reward_min ?? 0) < 0 ? "error.main" : "success.main"} fontWeight={600} noWrap>
                              {(m.credit_reward_min ?? 0) < 0
                                ? `Fee: ${formatCredits(Math.abs(m.credit_reward_min!))}`
                                : m.credit_reward_min === m.credit_reward_max || !m.credit_reward_max
                                  ? formatCredits(m.credit_reward_min)
                                  : `${formatCredits(m.credit_reward_min)} – ${formatCredits(m.credit_reward_max)}`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            )}
          </Grid>

          {allMissions.length === 0 && !isFetching && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6 }}>
              <Typography color="text.secondary">
                {t("missions.noResults", "No results found. Try adjusting your filters.")}
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
      <MissionDetailModal
        missionId={selectedMissionId}
        open={!!selectedMissionId}
        onClose={() => { setSelectedMissionId(null); navigate("/missions", { replace: true }) }}
        onBlueprintClick={(id) => { setSelectedMissionId(null); setSelectedBlueprintId(id) }}
      />
      <BlueprintDetailModal
        blueprintId={selectedBlueprintId}
        open={!!selectedBlueprintId}
        onClose={() => setSelectedBlueprintId(null)}
      />
    </StandardPageLayout>  )
}
