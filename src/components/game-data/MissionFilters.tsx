/**
 * MissionFilters — dense, compact filter bar for mission search
 */

import React from "react"
import {
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Typography,
  Button,
  Box,
} from "@mui/material"
import { RestartAltRounded } from "@mui/icons-material"

export interface MissionFiltersProps {
  searchText: string
  onSearchTextChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  careerType: string
  onCareerTypeChange: (value: string) => void
  starSystem: string
  onStarSystemChange: (value: string) => void
  faction: string
  onFactionChange: (value: string) => void
  missionGiver: string
  onMissionGiverChange: (value: string) => void
  legalStatus: "" | "LEGAL" | "ILLEGAL"
  onLegalStatusChange: (value: "" | "LEGAL" | "ILLEGAL") => void
  difficultyRange: number[]
  onDifficultyRangeChange: (value: number[]) => void
  isShareable?: boolean
  onIsShareableChange: (value: boolean | undefined) => void
  hasBlueprints?: boolean
  onHasBlueprintsChange: (value: boolean | undefined) => void
  isChainStarter?: boolean
  onIsChainStarterChange: (value: boolean | undefined) => void
  creditRewardMin: number | ""
  onCreditRewardMinChange: (value: number | "") => void
  onResetFilters: () => void
}

export const MissionFilters: React.FC<MissionFiltersProps> = (props) => {
  const {
    searchText, onSearchTextChange,
    category, onCategoryChange,
    careerType, onCareerTypeChange,
    starSystem, onStarSystemChange,
    faction, onFactionChange,
    missionGiver, onMissionGiverChange,
    legalStatus, onLegalStatusChange,
    difficultyRange, onDifficultyRangeChange,
    isShareable, onIsShareableChange,
    hasBlueprints, onHasBlueprintsChange,
    isChainStarter, onIsChainStarterChange,
    creditRewardMin, onCreditRewardMinChange,
    onResetFilters,
  } = props

  const triState = (
    value: boolean | undefined,
    onChange: (v: boolean | undefined) => void,
  ) => ({
    checked: value === true,
    indeterminate: value === undefined,
    onChange: () => onChange(value === undefined ? true : value ? false : undefined),
  })

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Grid container spacing={1} alignItems="center">
          {/* Row 1: Search + dropdowns */}
          <Grid item xs={12} sm={4} md={3}>
            <TextField fullWidth size="small" label="Search" value={searchText}
              onChange={(e) => onSearchTextChange(e.target.value)} placeholder="Mission name..." />
          </Grid>
          <Grid item xs={6} sm={4} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={category} label="Category" onChange={(e) => onCategoryChange(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {["Combat","Delivery","Investigation","Bounty Hunting","Mercenary","Mining","Salvage","Trading","Exploration","Medical"].map(c =>
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Career</InputLabel>
              <Select value={careerType} label="Career" onChange={(e) => onCareerTypeChange(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {["Mercenary","Hauling","Mining","Exploration","Combat","Trading","Medical","Salvage"].map(c =>
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>System</InputLabel>
              <Select value={starSystem} label="System" onChange={(e) => onStarSystemChange(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {["Stanton","Pyro","Nyx","Terra","Magnus"].map(s =>
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Legal</InputLabel>
              <Select value={legalStatus} label="Legal" onChange={(e) => onLegalStatusChange(e.target.value as any)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="LEGAL">Legal</MenuItem>
                <MenuItem value="ILLEGAL">Illegal</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficultyRange[0] === 1 && difficultyRange[1] === 5 ? "" : `${difficultyRange[0]}-${difficultyRange[1]}`}
                label="Difficulty"
                onChange={(e) => {
                  if (!e.target.value) { onDifficultyRangeChange([1, 5]); return }
                  const [min, max] = (e.target.value as string).split("-").map(Number)
                  onDifficultyRangeChange([min, max])
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="1-1">1 (Easy)</MenuItem>
                <MenuItem value="2-2">2</MenuItem>
                <MenuItem value="3-3">3</MenuItem>
                <MenuItem value="4-4">4</MenuItem>
                <MenuItem value="5-5">5 (Hard)</MenuItem>
                <MenuItem value="1-2">1–2</MenuItem>
                <MenuItem value="3-5">3–5</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={1}>
            <TextField fullWidth size="small" label="Min aUEC" type="number" value={creditRewardMin}
              onChange={(e) => onCreditRewardMinChange(e.target.value === "" ? "" : Number(e.target.value))}
              inputProps={{ min: 0 }} />
          </Grid>

          {/* Row 2: Checkboxes + text filters + reset */}
          <Grid item xs="auto">
            <FormControlLabel sx={{ mr: 0 }} control={<Checkbox size="small" {...triState(hasBlueprints, onHasBlueprintsChange)} />}
              label={<Typography variant="body2">Blueprints</Typography>} />
          </Grid>
          <Grid item xs="auto">
            <FormControlLabel sx={{ mr: 0 }} control={<Checkbox size="small" {...triState(isShareable, onIsShareableChange)} />}
              label={<Typography variant="body2">Shareable</Typography>} />
          </Grid>
          <Grid item xs="auto">
            <FormControlLabel sx={{ mr: 0 }} control={<Checkbox size="small" {...triState(isChainStarter, onIsChainStarterChange)} />}
              label={<Typography variant="body2">Chain</Typography>} />
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <TextField fullWidth size="small" label="Faction" value={faction}
              onChange={(e) => onFactionChange(e.target.value)} placeholder="e.g. UEE" />
          </Grid>
          <Grid item xs={6} sm={3} md={1.5}>
            <TextField fullWidth size="small" label="Giver" value={missionGiver}
              onChange={(e) => onMissionGiverChange(e.target.value)} placeholder="e.g. Miles" />
          </Grid>
          <Grid item xs="auto">
            <Button size="small" startIcon={<RestartAltRounded />} onClick={onResetFilters} sx={{ textTransform: "none" }}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
