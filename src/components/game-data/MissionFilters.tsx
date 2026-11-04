import { useTranslation } from "react-i18next"
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
import { getMissionTypeLabel } from "../../util/missionDisplay"

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
  const { t } = useTranslation()
  const triState = (
    value: boolean | undefined,
    onChange: (v: boolean | undefined) => void,
  ) => ({
    checked: value === true,
    indeterminate: value === undefined,
    onChange: () =>
      onChange(value === undefined ? true : value ? false : undefined),
  })

  return (
    <Stack spacing={1.5}>
      <TextField
        fullWidth
        size="small"
        label={t("missionsUi.search")}
        value={props.searchText}
        onChange={(e) => props.onSearchTextChange(e.target.value)}
        placeholder={t("missionsUi.missionNamePlaceholder")}
      />

      <FormControl fullWidth size="small">
        <InputLabel id="mission-filters-category-label">
          {t("missionsUi.category")}
        </InputLabel>
        <Select
          labelId="mission-filters-category-label"
          multiple
          value={props.category ? props.category.split(",") : []}
          label={t("missionsUi.category")}
          onChange={(e) =>
            props.onCategoryChange((e.target.value as string[]).join(","))
          }
          renderValue={(sel) =>
            (sel as string[])
              .map((c) => getMissionTypeLabel(c, t))
              .join(", ") || t("missionsUi.all")
          }
        >
          {[
            "Mercenary",
            "Bounty Hunter",
            "Delivery",
            "Hauling",
            "Investigation",
            "Mining",
            "Salvage",
            "Maintenance",
            "Race",
            "Courier",
          ].map((c) => (
            <MenuItem key={c} value={c}>
              {t(`missionsUi.categories.${c.replace(/ /g, "")}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel id="mission-filters-career-label">
          {t("missionsUi.career")}
        </InputLabel>
        <Select
          labelId="mission-filters-career-label"
          value={props.careerType}
          label={t("missionsUi.career")}
          onChange={(e) => props.onCareerTypeChange(e.target.value)}
        >
          <MenuItem value="">{t("missionsUi.all")}</MenuItem>
          {[
            "Mercenary",
            "Hauling",
            "Mining",
            "Exploration",
            "Combat",
            "Trading",
            "Medical",
            "Salvage",
          ].map((c) => (
            <MenuItem key={c} value={c}>
              {t(`missionsUi.careers.${c}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel id="mission-filters-system-label">
          {t("missionsUi.system")}
        </InputLabel>
        <Select
          labelId="mission-filters-system-label"
          multiple
          value={props.starSystem ? props.starSystem.split(",") : []}
          label={t("missionsUi.system")}
          onChange={(e) =>
            props.onStarSystemChange((e.target.value as string[]).join(","))
          }
          renderValue={(sel) =>
            (sel as string[]).join(", ") || t("missionsUi.all")
          }
        >
          {["Stanton", "Pyro", "Nyx", "Terra", "Magnus"].map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel id="mission-filters-legal-label">
          {t("missionsUi.legal")}
        </InputLabel>
        <Select
          labelId="mission-filters-legal-label"
          value={props.legalStatus}
          label={t("missionsUi.legal")}
          onChange={(e) =>
            props.onLegalStatusChange(
              e.target.value as "" | "LEGAL" | "ILLEGAL",
            )
          }
        >
          <MenuItem value="">{t("missionsUi.all")}</MenuItem>
          <MenuItem value="LEGAL">{t("missionsUi.legal")}</MenuItem>
          <MenuItem value="ILLEGAL">{t("missionsUi.illegal")}</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel id="mission-filters-difficulty-label">
          {t("missionsUi.difficulty")}
        </InputLabel>
        <Select
          labelId="mission-filters-difficulty-label"
          value={
            props.difficultyRange[0] === 1 && props.difficultyRange[1] === 5
              ? ""
              : `${props.difficultyRange[0]}-${props.difficultyRange[1]}`
          }
          label={t("missionsUi.difficulty")}
          onChange={(e) => {
            if (!e.target.value) {
              props.onDifficultyRangeChange([1, 5])
              return
            }
            const [min, max] = (e.target.value as string).split("-").map(Number)
            props.onDifficultyRangeChange([min, max])
          }}
        >
          <MenuItem value="">{t("missionsUi.allDifficulties")}</MenuItem>
          <MenuItem value="1-2">{t("missionsUi.easy")}</MenuItem>
          <MenuItem value="3-3">{t("missionsUi.medium")}</MenuItem>
          <MenuItem value="4-5">{t("missionsUi.hard")}</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        size="small"
        label={t("missionsUi.faction")}
        value={props.faction}
        onChange={(e) => props.onFactionChange(e.target.value)}
        placeholder={t("missionsUi.factionPlaceholder")}
      />

      <TextField
        fullWidth
        size="small"
        label={t("missionsUi.missionGiver")}
        value={props.missionGiver}
        onChange={(e) => props.onMissionGiverChange(e.target.value)}
        placeholder={t("missionsUi.missionGiverPlaceholder")}
      />

      <TextField
        fullWidth
        size="small"
        label={t("missionsUi.minReward")}
        type="number"
        value={props.creditRewardMin}
        onChange={(e) =>
          props.onCreditRewardMinChange(
            e.target.value === "" ? "" : Number(e.target.value),
          )
        }
        inputProps={{ min: 0 }}
      />

      <FormControlLabel
        sx={{ ml: 0 }}
        control={
          <Checkbox
            size="small"
            {...triState(props.hasBlueprints, props.onHasBlueprintsChange)}
          />
        }
        label={
          <Typography variant="body2">
            {t("missionsUi.blueprints")}{" "}
            {props.hasBlueprints === undefined
              ? t("missionsUi.triAny")
              : props.hasBlueprints
                ? t("missionsUi.triYes")
                : t("missionsUi.triNo")}
          </Typography>
        }
      />
      <FormControlLabel
        sx={{ ml: 0 }}
        control={
          <Checkbox
            size="small"
            {...triState(props.isShareable, props.onIsShareableChange)}
          />
        }
        label={
          <Typography variant="body2">
            {t("missionsUi.shareable")}{" "}
            {props.isShareable === undefined
              ? t("missionsUi.triAny")
              : props.isShareable
                ? t("missionsUi.triYes")
                : t("missionsUi.triNo")}
          </Typography>
        }
      />
      <FormControlLabel
        sx={{ ml: 0 }}
        control={
          <Checkbox
            size="small"
            {...triState(props.isChainStarter, props.onIsChainStarterChange)}
          />
        }
        label={
          <Typography variant="body2">
            {t("missionsUi.chainStarter")}{" "}
            {props.isChainStarter === undefined
              ? t("missionsUi.triAny")
              : props.isChainStarter
                ? t("missionsUi.triYes")
                : t("missionsUi.triNo")}
          </Typography>
        }
      />

      <Divider />
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {t("missionsUi.events")}
      </Typography>
      <FormControlLabel
        sx={{ ml: 0 }}
        control={
          <Checkbox
            size="small"
            checked={props.showEventMissions}
            onChange={(e) => {
              props.onShowEventMissionsChange(e.target.checked)
              if (!e.target.checked) props.onEventCodeChange("")
            }}
          />
        }
        label={
          <Typography variant="body2">
            {t("missionsUi.showEventMissions")}
          </Typography>
        }
      />
      {props.showEventMissions && (
        <EventSelect
          value={props.eventCode}
          onChange={props.onEventCodeChange}
        />
      )}

      <Button
        size="small"
        startIcon={<RestartAltRounded />}
        onClick={props.onResetFilters}
        sx={{ textTransform: "none" }}
      >
        {t("missionsUi.resetFilters")}
      </Button>
    </Stack>
  )
}

function EventSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const { t } = useTranslation()
  const { data } = useGetGameEventsQuery()
  const events = data?.events || []
  return (
    <FormControl fullWidth size="small">
      <InputLabel id="mission-filters-event-label">
        {t("missionsUi.event")}
      </InputLabel>
      <Select
        labelId="mission-filters-event-label"
        value={value}
        onChange={(e) => onChange(e.target.value as string)}
        label={t("missionsUi.event")}
      >
        <MenuItem value="">{t("missionsUi.allEvents")}</MenuItem>
        {events.map((e) => (
          <MenuItem key={e.event_code} value={e.event_code}>
            {e.event_name} ({e.mission_count})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
