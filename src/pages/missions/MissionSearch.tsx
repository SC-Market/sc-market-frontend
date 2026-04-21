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
  useMediaQuery,
} from "@mui/material"
import { ViewList, ViewModule, FilterList } from "@mui/icons-material"
import { useSearchMissionsQuery } from "../../store/api/v2/market"
import { useNavigate } from "react-router-dom"
import { useDebounce } from "../../hooks/useDebounce"
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll"
import { MissionCard, MissionFilters } from "../../components/game-data"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { MissionDetailModal } from "../../components/game-data/MissionDetailModal"
import { BlueprintDetailModal } from "../../components/game-data/BlueprintDetailModal"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { BottomSheet } from "../../components/mobile/BottomSheet"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { formatCredits, getMissionTypeLabel } from "../../util/missionDisplay"
import { getMissionIcon } from "../../util/gameIcons"
import { MissionName } from "../../components/game-data/MissionName"

export function MissionSearch() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  
  // Search and filter state
  const [searchText, setSearchText] = useState("")
  const [category, setCategory] = useState("")
  const [careerType, setCareerType] = useState("")
  const [starSystem, setStarSystem] = useState("")
  const [faction, setFaction] = useState("")
  const [missionGiver, setMissionGiver] = useState("")
  const [legalStatus, setLegalStatus] = useState<"" | "LEGAL" | "ILLEGAL">("")
  const [difficultyRange, setDifficultyRange] = useState<number[]>([1, 5])
  const [isShareable, setIsShareable] = useState<boolean | undefined>(undefined)
  const [hasBlueprints, setHasBlueprints] = useState<boolean | undefined>(true)
  const [isChainStarter, setIsChainStarter] = useState<boolean | undefined>(undefined)
  const [creditRewardMin, setCreditRewardMin] = useState<number | "">("")
  const [page, setPage] = useState(1)
  const [allMissions, setAllMissions] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  const [filterOpen, setFilterOpen] = useState(false)
  const bottomNavHeight = useBottomNavHeight()

  // Debounce search text for performance (Requirement 1.6: <200ms response)
  const debouncedSearch = useDebounce(searchText, 300)

  // Reset accumulated results when filters change
  const filterKey = JSON.stringify({
    debouncedSearch, category, careerType, starSystem, faction, missionGiver,
    legalStatus, difficultyRange, isShareable, hasBlueprints, isChainStarter, creditRewardMin,
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
    page,
    pageSize: 20,
  })

  const handleMissionClick = (missionId: string) => {
    if (theme.breakpoints.values.md > window.innerWidth) {
      navigate(`/missions/${missionId}`)
    } else {
      setSelectedMissionId(missionId)
    }
  }
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null)
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null)

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
    setSearchText("")
    setCategory("")
    setCareerType("")
    setStarSystem("")
    setFaction("")
    setMissionGiver("")
    setLegalStatus("")
    setDifficultyRange([1, 5])
    setIsShareable(undefined)
    setHasBlueprints(true)
    setIsChainStarter(undefined)
    setCreditRewardMin("")
    setPage(1)
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
      {/* Mobile: Bottom sheet for filters */}
      {isMobile && (
        <>
          <BottomSheet
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            title={t("missions.filters", "Filters")}
          >
            {filterContent}
          </BottomSheet>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<FilterList />}
            onClick={() => setFilterOpen(true)}
            sx={{
              position: "fixed",
              bottom: bottomNavHeight + 16,
              right: 24,
              zIndex: (theme) => theme.zIndex.speedDial,
              borderRadius: 2,
              textTransform: "none",
              boxShadow: theme.shadows[4],
              backgroundColor: theme.palette.background.paper,
              "&:hover": { backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[8] },
            }}
          >
            Filters
          </Button>
        </>
      )}

      <Grid item xs={12}>
        <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
          {/* Desktop: Sticky sidebar */}
          {!isMobile && (
            <Paper
              sx={{
                position: "sticky",
                top: "calc(64px + 16px)",
                maxHeight: "calc(100vh - 64px - 32px)",
                height: "fit-content",
                width: 280,
                flexShrink: 0,
                overflowY: "auto",
                p: 1.5,
              }}
            >
              {filterContent}
            </Paper>
          )}

          {/* Main content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

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
              onChange={(_, v) => v && setViewMode(v)}
              size="small"
            >
              <ToggleButton value="list"><ViewList /></ToggleButton>
              <ToggleButton value="grid"><ViewModule /></ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Grid container spacing={1.5} alignItems="stretch">
            {viewMode === "grid" ? (
              allMissions.map((mission) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={mission.mission_id} sx={{ display: "flex" }}>
                  <MissionCard mission={mission} onClick={handleMissionClick} />
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
                        <TableCell>Tags</TableCell>
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
                          onClick={() => handleMissionClick(m.mission_id)}
                        >
                          <TableCell sx={{ width: 40, py: 0.5 }}>
                            <Avatar
                              src={getMissionIcon(m.category) || undefined}
                              sx={{ width: 24, height: 24, bgcolor: "primary.main" }}
                              imgProps={{ style: { objectFit: "contain", padding: 2 } }}
                            >
                              {(m.category || "?")[0].toUpperCase()}
                            </Avatar>
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
                              {m.faction || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} flexWrap="nowrap">
                              {m.category && <Chip label={getMissionTypeLabel(m.category)} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />}
                              {m.difficulty_level && <Chip label={`D${m.difficulty_level}`} size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
                              {m.legal_status === "ILLEGAL" && <Chip label="ILL" size="small" color="error" sx={{ height: 18, fontSize: "0.65rem" }} />}
                              {m.is_shareable && <Chip label="SH" size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
                              {m.is_chain_starter && <Chip label="CH" size="small" color="secondary" sx={{ height: 18, fontSize: "0.65rem" }} />}
                            </Stack>
                          </TableCell>
                          <TableCell align="center">
                            {m.blueprint_reward_count > 0
                              ? <Chip label={m.blueprint_reward_count} size="small" color="secondary" sx={{ height: 18, fontSize: "0.65rem", minWidth: 24 }} />
                              : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" color={m.reputation_reward ? "text.primary" : "text.disabled"}>
                              {m.reputation_reward ? `${m.reputation_reward.toLocaleString()} XP` : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="success.main" fontWeight={600} noWrap>
                              {m.credit_reward_min === m.credit_reward_max || !m.credit_reward_max
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
          </Box>
        </Stack>
      </Grid>
      <MissionDetailModal
        missionId={selectedMissionId}
        open={!!selectedMissionId}
        onClose={() => setSelectedMissionId(null)}
        onBlueprintClick={(id) => { setSelectedMissionId(null); setSelectedBlueprintId(id) }}
      />
      <BlueprintDetailModal
        blueprintId={selectedBlueprintId}
        open={!!selectedBlueprintId}
        onClose={() => setSelectedBlueprintId(null)}
      />
    </StandardPageLayout>  )
}
