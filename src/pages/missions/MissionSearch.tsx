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
} from "@mui/material"
import { ViewList, ViewModule } from "@mui/icons-material"
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
import { formatCredits, getMissionTypeLabel } from "../../util/missionDisplay"
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
    difficultyMin: difficultyRange[0],
    difficultyMax: difficultyRange[1],
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

  return (
    <StandardPageLayout
      title={t("missions.search.title", "Mission Database")}
      headerTitle={t("missions.search.header", "Mission Database")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t("missions.search.description", "Search and filter missions to find blueprint rewards and plan your progression")}
        </Typography>

        {/* Filters - Now using MissionFilters component */}
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

          <Grid container spacing={2}>
            {viewMode === "grid" ? (
              allMissions.map((mission) => (
                <Grid item xs={12} sm={6} md={4} key={mission.mission_id}>
                  <MissionCard mission={mission} onClick={handleMissionClick} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Mission</TableCell>
                        <TableCell>Tags</TableCell>
                        <TableCell align="right">Reward</TableCell>
                        <TableCell align="right">Blueprints</TableCell>
                        <TableCell align="right">Rating</TableCell>
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
                          <TableCell>
                            <MissionName name={m.mission_name} variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 300 }} />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                              {m.category && <Chip label={getMissionTypeLabel(m.category)} size="small" color="primary" sx={{ height: 20, fontSize: "0.7rem" }} />}
                              {m.star_system && <Chip label={m.star_system} size="small" color="info" sx={{ height: 20, fontSize: "0.7rem" }} />}
                              {m.difficulty_level && <Chip label={`Diff ${m.difficulty_level}`} size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />}
                              {m.legal_status === "ILLEGAL" && <Chip label="Illegal" size="small" color="error" sx={{ height: 20, fontSize: "0.7rem" }} />}
                              {m.is_shareable && <Chip label="Share" size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />}
                              {m.is_chain_starter && <Chip label="Chain" size="small" color="secondary" sx={{ height: 20, fontSize: "0.7rem" }} />}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="success.main" fontWeight={600} noWrap>
                              {m.credit_reward_min === m.credit_reward_max || !m.credit_reward_max
                                ? formatCredits(m.credit_reward_min)
                                : `${formatCredits(m.credit_reward_min)} \u2013 ${formatCredits(m.credit_reward_max)}`}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {m.blueprint_reward_count > 0 ? (
                              <Chip label={`${m.blueprint_reward_count} BP`} size="small" color="secondary" sx={{ height: 20, fontSize: "0.7rem" }} />
                            ) : "\u2014"}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="caption" color="text.secondary">
                              {m.community_satisfaction_avg ? `\u2B50 ${m.community_satisfaction_avg.toFixed(1)}` : "\u2014"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
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
