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

import React, { useState } from "react"
import {
  Box,
  Grid,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
} from "@mui/material"
import { useSearchMissionsQuery } from "../../store/missionsApi"
import { useNavigate } from "react-router-dom"
import { useDebounce } from "../../hooks/useDebounce"
import { MissionCard, MissionFilters } from "../../components/game-data"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { MissionDetailModal } from "../../components/game-data/MissionDetailModal"
import { BlueprintDetailModal } from "../../components/game-data/BlueprintDetailModal"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

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
  const [legalStatus, setLegalStatus] = useState<"" | "LEGAL" | "ILLEGAL">("")
  const [difficultyRange, setDifficultyRange] = useState<number[]>([1, 5])
  const [isShareable, setIsShareable] = useState<boolean | undefined>(undefined)
  const [hasBlueprints, setHasBlueprints] = useState<boolean | undefined>(undefined)
  const [isChainStarter, setIsChainStarter] = useState<boolean | undefined>(undefined)
  const [page, setPage] = useState(1)

  // Debounce search text for performance (Requirement 1.6: <200ms response)
  const debouncedSearch = useDebounce(searchText, 300)

  // Query missions with filters
  const { data, isLoading, error } = useSearchMissionsQuery({
    text: debouncedSearch || undefined,
    category: category || undefined,
    career_type: careerType || undefined,
    star_system: starSystem || undefined,
    faction: faction || undefined,
    legal_status: legalStatus || undefined,
    difficulty_min: difficultyRange[0],
    difficulty_max: difficultyRange[1],
    is_shareable: isShareable,
    has_blueprint_rewards: hasBlueprints,
    is_chain_starter: isChainStarter,
    page,
    page_size: 20,
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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleResetFilters = () => {
    setSearchText("")
    setCategory("")
    setCareerType("")
    setStarSystem("")
    setFaction("")
    setLegalStatus("")
    setDifficultyRange([1, 5])
    setIsShareable(undefined)
    setHasBlueprints(undefined)
    setIsChainStarter(undefined)
    setPage(1)
  }

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0

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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Found {data.total} missions
          </Typography>

          <Grid container spacing={2}>
            {data.missions.map((mission) => (
              <Grid item xs={12} key={mission.mission_id}>
                <MissionCard mission={mission} onClick={handleMissionClick} />
              </Grid>
            ))}
          </Grid>

          {data.missions.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6 }}>
                <Typography color="text.secondary">
                  {t("missions.noResults", "No results found. Try adjusting your filters.")}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
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
