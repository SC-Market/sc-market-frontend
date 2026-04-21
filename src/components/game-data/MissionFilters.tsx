/**
 * MissionFilters — vertical sidebar layout for mission filtering
 */

import React from "react"
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Typography,
  Button,
  Stack,
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
  const triState = (
    value: boolean | undefined,
    onChange: (v: boolean | undefined) => void,
  ) => ({
    checked: value === true,
    indeterminate: value === undefined,
    onChange: () => onChange(value === undefined ? true : value ? false : undefined),
  })

  return (
    <Stack spacing={1.5}>
      <TextField fullWidth size="small" label="Search" value={props.searchText}
        onChange={(e) => props.onSearchTextChange(e.target.value)} placeholder="Mission name..." />

      <FormControl fullWidth size="small">
        <InputLabel>Category</InputLabel>
        <Select value={props.category} label="Category" onChange={(e) => props.onCategoryChange(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {["Combat","Delivery","Investigation","Bounty Hunting","Mercenary","Mining","Salvage","Trading","Exploration","Medical"].map(c =>
            <MenuItem key={c} value={c}>{c}</MenuItem>
          )}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>Career</InputLabel>
        <Select value={props.careerType} label="Career" onChange={(e) => props.onCareerTypeChange(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {["Mercenary","Hauling","Mining","Exploration","Combat","Trading","Medical","Salvage"].map(c =>
            <MenuItem key={c} value={c}>{c}</MenuItem>
          )}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>System</InputLabel>
        <Select value={props.starSystem} label="System" onChange={(e) => props.onStarSystemChange(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {["Stanton","Pyro","Nyx","Terra","Magnus"].map(s =>
            <MenuItem key={s} value={s}>{s}</MenuItem>
          )}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>Legal</InputLabel>
        <Select value={props.legalStatus} label="Legal" onChange={(e) => props.onLegalStatusChange(e.target.value as any)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="LEGAL">Legal</MenuItem>
          <MenuItem value="ILLEGAL">Illegal</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>Difficulty</InputLabel>
        <Select
          value={props.difficultyRange[0] === 1 && props.difficultyRange[1] === 5 ? "" : `${props.difficultyRange[0]}-${props.difficultyRange[1]}`}
          label="Difficulty"
          onChange={(e) => {
            if (!e.target.value) { props.onDifficultyRangeChange([1, 5]); return }
            const [min, max] = (e.target.value as string).split("-").map(Number)
            props.onDifficultyRangeChange([min, max])
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

      <TextField fullWidth size="small" label="Faction" value={props.faction}
        onChange={(e) => props.onFactionChange(e.target.value)} placeholder="e.g. UEE" />

      <TextField fullWidth size="small" label="Mission Giver" value={props.missionGiver}
        onChange={(e) => props.onMissionGiverChange(e.target.value)} placeholder="e.g. Miles" />

      <TextField fullWidth size="small" label="Min Reward (aUEC)" type="number" value={props.creditRewardMin}
        onChange={(e) => props.onCreditRewardMinChange(e.target.value === "" ? "" : Number(e.target.value))}
        inputProps={{ min: 0 }} />

      <FormControlLabel sx={{ ml: 0 }} control={<Checkbox size="small" {...triState(props.hasBlueprints, props.onHasBlueprintsChange)} />}
        label={<Typography variant="body2">Has Blueprints</Typography>} />
      <FormControlLabel sx={{ ml: 0 }} control={<Checkbox size="small" {...triState(props.isShareable, props.onIsShareableChange)} />}
        label={<Typography variant="body2">Shareable</Typography>} />
      <FormControlLabel sx={{ ml: 0 }} control={<Checkbox size="small" {...triState(props.isChainStarter, props.onIsChainStarterChange)} />}
        label={<Typography variant="body2">Chain Starter</Typography>} />

      <Button size="small" startIcon={<RestartAltRounded />} onClick={props.onResetFilters} sx={{ textTransform: "none" }}>
        Reset Filters
      </Button>
    </Stack>
  )
}
