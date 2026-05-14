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
  Divider,
} from "@mui/material"
import { RestartAltRounded } from "@mui/icons-material"
import { useGetGameEventsQuery } from "../../store/api/v2/market"

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
  eventCode: string
  onEventCodeChange: (value: string) => void
  showEventMissions: boolean
  onShowEventMissionsChange: (value: boolean) => void
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
        <Select multiple value={props.category ? props.category.split(",") : []} label="Category"
          onChange={(e) => props.onCategoryChange((e.target.value as string[]).join(","))}
          renderValue={(sel) => (sel as string[]).join(", ") || "All"}>
          {["Mercenary","Bounty Hunter","Delivery","Hauling","Investigation","Mining","Salvage","Maintenance","Race","Courier"].map(c =>
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
        <Select multiple value={props.starSystem ? props.starSystem.split(",") : []} label="System"
          onChange={(e) => props.onStarSystemChange((e.target.value as string[]).join(","))}
          renderValue={(sel) => (sel as string[]).join(", ") || "All"}>
          {["Stanton","Pyro","Nyx","Terra","Magnus"].map(s =>
            <MenuItem key={s} value={s}>{s}</MenuItem>
          )}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>Legal</InputLabel>
        <Select value={props.legalStatus} label="Legal" onChange={(e) => props.onLegalStatusChange(e.target.value as "" | "LEGAL" | "ILLEGAL")}>
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
          <MenuItem value="">All Difficulties</MenuItem>
          <MenuItem value="1-2">Easy (1–2)</MenuItem>
          <MenuItem value="3-3">Medium (3)</MenuItem>
          <MenuItem value="4-5">Hard (4–5)</MenuItem>
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
        label={<Typography variant="body2">Blueprints {props.hasBlueprints === undefined ? "(any)" : props.hasBlueprints ? "(yes)" : "(no)"}</Typography>} />
      <FormControlLabel sx={{ ml: 0 }} control={<Checkbox size="small" {...triState(props.isShareable, props.onIsShareableChange)} />}
        label={<Typography variant="body2">Shareable {props.isShareable === undefined ? "(any)" : props.isShareable ? "(yes)" : "(no)"}</Typography>} />
      <FormControlLabel sx={{ ml: 0 }} control={<Checkbox size="small" {...triState(props.isChainStarter, props.onIsChainStarterChange)} />}
        label={<Typography variant="body2">Chain Starter {props.isChainStarter === undefined ? "(any)" : props.isChainStarter ? "(yes)" : "(no)"}</Typography>} />

      <Divider />
      <Typography variant="caption" color="text.secondary" fontWeight={600}>Events</Typography>
      <FormControlLabel sx={{ ml: 0 }} control={<Checkbox size="small" checked={props.showEventMissions}
        onChange={(e) => { props.onShowEventMissionsChange(e.target.checked); if (!e.target.checked) props.onEventCodeChange("") }} />}
        label={<Typography variant="body2">Show event missions</Typography>} />
      {props.showEventMissions && <EventSelect value={props.eventCode} onChange={props.onEventCodeChange} />}

      <Button size="small" startIcon={<RestartAltRounded />} onClick={props.onResetFilters} sx={{ textTransform: "none" }}>
        Reset Filters
      </Button>
    </Stack>
  )
}

function EventSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data } = useGetGameEventsQuery()
  const events = data?.events || []
  return (
    <FormControl fullWidth size="small">
      <InputLabel>Event</InputLabel>
      <Select value={value} onChange={(e) => onChange(e.target.value as string)} label="Event">
        <MenuItem value="">All Events</MenuItem>
        {events.map((e) => (
          <MenuItem key={e.event_code} value={e.event_code}>
            {e.event_name} ({e.mission_count})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
