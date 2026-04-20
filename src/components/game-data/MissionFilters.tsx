/**
 * MissionFilters Component
 * 
 * Comprehensive mission filtering component with:
 * - Category filter (Combat, Delivery, Investigation, etc.)
 * - Career type filter (Mercenary, Hauling, Mining, etc.)
 * - Location filters (star system, planet/moon)
 * - Legal status filter (LEGAL, ILLEGAL)
 * - Difficulty filter (1-5 range slider)
 * - Sharing status filter (Shareable checkbox)
 * - Blueprint rewards filter
 * - Chain starter filter
 * 
 * Task 11.3 - Create MissionFilters component
 * Requirements: 16.1, 16.2, 16.3, 16.4, 17.1, 17.2, 17.3, 17.4, 17.5, 41.1-41.10
 */

import React from "react"
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  FormControlLabel,
  Checkbox,
  Slider,
  Typography,
} from "@mui/material"

export interface MissionFiltersProps {
  /** Search text value */
  searchText: string
  /** Search text change handler */
  onSearchTextChange: (value: string) => void
  
  /** Category filter value */
  category: string
  /** Category change handler */
  onCategoryChange: (value: string) => void
  
  /** Career type filter value */
  careerType: string
  /** Career type change handler */
  onCareerTypeChange: (value: string) => void
  
  /** Star system filter value */
  starSystem: string
  /** Star system change handler */
  onStarSystemChange: (value: string) => void
  
  /** Planet/moon filter value (optional) */
  planetMoon?: string
  /** Planet/moon change handler (optional) */
  onPlanetMoonChange?: (value: string) => void
  
  /** Faction filter value */
  faction: string
  /** Faction change handler */
  onFactionChange: (value: string) => void
  
  /** Legal status filter value */
  legalStatus: "" | "LEGAL" | "ILLEGAL"
  /** Legal status change handler */
  onLegalStatusChange: (value: "" | "LEGAL" | "ILLEGAL") => void
  
  /** Difficulty range [min, max] */
  difficultyRange: number[]
  /** Difficulty range change handler */
  onDifficultyRangeChange: (value: number[]) => void
  
  /** Shareable filter value (undefined = all, true = shareable only, false = non-shareable only) */
  isShareable?: boolean
  /** Shareable change handler */
  onIsShareableChange: (value: boolean | undefined) => void
  
  /** Has blueprints filter value */
  hasBlueprints?: boolean
  /** Has blueprints change handler */
  onHasBlueprintsChange: (value: boolean | undefined) => void
  
  /** Chain starter filter value */
  isChainStarter?: boolean
  /** Chain starter change handler */
  onIsChainStarterChange: (value: boolean | undefined) => void
  
  /** Reset filters handler */
  onResetFilters: () => void
}

/**
 * MissionFilters Component
 * 
 * Features:
 * - Text search with partial matching (1.5)
 * - Category filter (41.1)
 * - Career type filter (17.1)
 * - Star system filter (16.1, 41.2)
 * - Planet/moon filter (16.2)
 * - Faction filter (41.4)
 * - Legal status filter (17.2)
 * - Difficulty range slider (17.3)
 * - Shareable checkbox (41.5)
 * - Blueprint rewards checkbox (41.9)
 * - Chain starter checkbox (47.2)
 * - Reset all filters button
 * - Responsive grid layout
 * - Material-UI components for consistency
 */
export const MissionFilters: React.FC<MissionFiltersProps> = ({
  searchText,
  onSearchTextChange,
  category,
  onCategoryChange,
  careerType,
  onCareerTypeChange,
  starSystem,
  onStarSystemChange,
  planetMoon,
  onPlanetMoonChange,
  faction,
  onFactionChange,
  legalStatus,
  onLegalStatusChange,
  difficultyRange,
  onDifficultyRangeChange,
  isShareable,
  onIsShareableChange,
  hasBlueprints,
  onHasBlueprintsChange,
  isChainStarter,
  onIsChainStarterChange,
  onResetFilters,
}) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2}>
          {/* Search Text (Requirement 1.1, 1.5) */}
          <Grid item xs={12} md={6}>
            <TextField size="small"
              fullWidth
              label="Search missions"
              value={searchText}
              onChange={(e) => onSearchTextChange(e.target.value)}
              placeholder="Search by mission name..."
              helperText="Partial name matching supported"
            />
          </Grid>

          {/* Category Filter (Requirement 41.1) */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => onCategoryChange(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="Combat">Combat</MenuItem>
                <MenuItem value="Delivery">Delivery</MenuItem>
                <MenuItem value="Investigation">Investigation</MenuItem>
                <MenuItem value="Bounty Hunting">Bounty Hunting</MenuItem>
                <MenuItem value="Mercenary">Mercenary</MenuItem>
                <MenuItem value="Mining">Mining</MenuItem>
                <MenuItem value="Salvage">Salvage</MenuItem>
                <MenuItem value="Trading">Trading</MenuItem>
                <MenuItem value="Exploration">Exploration</MenuItem>
                <MenuItem value="Medical">Medical</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Career Type Filter (Requirement 17.1) */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Career Type</InputLabel>
              <Select
                value={careerType}
                label="Career Type"
                onChange={(e) => onCareerTypeChange(e.target.value)}
              >
                <MenuItem value="">All Career Types</MenuItem>
                <MenuItem value="Mercenary">Mercenary</MenuItem>
                <MenuItem value="Hauling">Hauling</MenuItem>
                <MenuItem value="Mining">Mining</MenuItem>
                <MenuItem value="Exploration">Exploration</MenuItem>
                <MenuItem value="Combat">Combat</MenuItem>
                <MenuItem value="Trading">Trading</MenuItem>
                <MenuItem value="Medical">Medical</MenuItem>
                <MenuItem value="Salvage">Salvage</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Star System Filter (Requirement 16.1, 41.2) */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Star System</InputLabel>
              <Select
                value={starSystem}
                label="Star System"
                onChange={(e) => onStarSystemChange(e.target.value)}
              >
                <MenuItem value="">All Systems</MenuItem>
                <MenuItem value="Stanton">Stanton</MenuItem>
                <MenuItem value="Pyro">Pyro</MenuItem>
                <MenuItem value="Nyx">Nyx</MenuItem>
                <MenuItem value="Terra">Terra</MenuItem>
                <MenuItem value="Magnus">Magnus</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Planet/Moon Filter (Requirement 16.2) - Optional */}
          {onPlanetMoonChange && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Planet/Moon</InputLabel>
                <Select
                  value={planetMoon || ""}
                  label="Planet/Moon"
                  onChange={(e) => onPlanetMoonChange(e.target.value)}
                >
                  <MenuItem value="">All Locations</MenuItem>
                  <MenuItem value="Crusader">Crusader</MenuItem>
                  <MenuItem value="Hurston">Hurston</MenuItem>
                  <MenuItem value="ArcCorp">ArcCorp</MenuItem>
                  <MenuItem value="microTech">microTech</MenuItem>
                  <MenuItem value="Yela">Yela</MenuItem>
                  <MenuItem value="Daymar">Daymar</MenuItem>
                  <MenuItem value="Cellin">Cellin</MenuItem>
                  <MenuItem value="Aberdeen">Aberdeen</MenuItem>
                  <MenuItem value="Magda">Magda</MenuItem>
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Lyria">Lyria</MenuItem>
                  <MenuItem value="Wala">Wala</MenuItem>
                  <MenuItem value="Calliope">Calliope</MenuItem>
                  <MenuItem value="Clio">Clio</MenuItem>
                  <MenuItem value="Euterpe">Euterpe</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Faction Filter (Requirement 41.4) */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Faction</InputLabel>
              <Select
                value={faction}
                label="Faction"
                onChange={(e) => onFactionChange(e.target.value)}
              >
                <MenuItem value="">All Factions</MenuItem>
                <MenuItem value="UEE">UEE</MenuItem>
                <MenuItem value="Crusader Industries">Crusader Industries</MenuItem>
                <MenuItem value="Hurston Dynamics">Hurston Dynamics</MenuItem>
                <MenuItem value="ArcCorp">ArcCorp</MenuItem>
                <MenuItem value="microTech">microTech</MenuItem>
                <MenuItem value="Advocacy">Advocacy</MenuItem>
                <MenuItem value="Bounty Hunters Guild">Bounty Hunters Guild</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Legal Status Filter (Requirement 17.2) */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Legal Status</InputLabel>
              <Select
                value={legalStatus}
                label="Legal Status"
                onChange={(e) => onLegalStatusChange(e.target.value as "" | "LEGAL" | "ILLEGAL")}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="LEGAL">Legal</MenuItem>
                <MenuItem value="ILLEGAL">Illegal</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Difficulty Range Filter (Requirement 17.3) */}
          <Grid item xs={12} sm={6} md={6}>
            <Typography gutterBottom>
              Difficulty Level: {difficultyRange[0]} - {difficultyRange[1]}
            </Typography>
            <Slider
              value={difficultyRange}
              onChange={(_e, newValue) => onDifficultyRangeChange(newValue as number[])}
              valueLabelDisplay="auto"
              min={1}
              max={5}
              marks={[
                { value: 1, label: "1" },
                { value: 2, label: "2" },
                { value: 3, label: "3" },
                { value: 4, label: "4" },
                { value: 5, label: "5" },
              ]}
            />
          </Grid>

          {/* Boolean Filters (Requirements 41.5, 41.9, 47.2) */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {/* Shareable Filter (Requirement 41.5) */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isShareable === true}
                    indeterminate={isShareable === undefined}
                    onChange={() =>
                      onIsShareableChange(
                        isShareable === undefined ? true : isShareable ? false : undefined
                      )
                    }
                  />
                }
                label="Shareable"
              />
              
              {/* Blueprint Rewards Filter (Requirement 41.9) */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasBlueprints === true}
                    indeterminate={hasBlueprints === undefined}
                    onChange={() =>
                      onHasBlueprintsChange(
                        hasBlueprints === undefined ? true : hasBlueprints ? false : undefined
                      )
                    }
                  />
                }
                label="Has Blueprint Rewards"
              />
              
              {/* Chain Starter Filter (Requirement 47.2) */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isChainStarter === true}
                    indeterminate={isChainStarter === undefined}
                    onChange={() =>
                      onIsChainStarterChange(
                        isChainStarter === undefined
                          ? true
                          : isChainStarter
                          ? false
                          : undefined
                      )
                    }
                  />
                }
                label="Chain Starter"
              />
            </Stack>
          </Grid>

          {/* Reset Button */}
          <Grid item xs={12}>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={onResetFilters}
            >
              Reset all filters
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
