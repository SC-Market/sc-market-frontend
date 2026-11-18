import React from "react"
import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import type {
  MissionHubDetailResponse,
  MissionHubMission,
  MissionHubSort,
} from "../../../store/api/v2/market"
import { formatInteger } from "../../../util/format/format"
import { HubMissionRow } from "./HubMissionRow"
import {
  missionPayout,
  type HubListFilters,
  type HubListMode,
  type HubMissionGroup,
} from "./hubModel"

const SORTS: readonly MissionHubSort[] = [
  "name",
  "rank",
  "reputation",
  "reward",
]

/**
 * The hub's missions: type chips and the blueprint toggle (filters the API
 * applies, so they span every page), then the missions grouped (one-page
 * hubs) or as a flat sortable list. Every row is a real link to the mission
 * page; `onOpen` (desktop) opens it over the hub instead on a plain click.
 */
export function HubMissionList({
  hub,
  missions,
  mode,
  groups,
  filters,
  onFiltersChange,
  showRank,
  busy,
  lang,
  onOpen,
  pagination,
}: {
  hub: Pick<
    MissionHubDetailResponse,
    | "mission_count"
    | "type_counts"
    | "untyped_count"
    | "blueprint_mission_count"
    | "reward_mission_count"
    | "filtered_count"
  >
  missions: MissionHubMission[]
  mode: HubListMode
  groups: HubMissionGroup[]
  filters: HubListFilters
  onFiltersChange: (next: HubListFilters) => void
  /** The hub has a rank ladder (the rank sort, rank names in flat rows) */
  showRank: boolean
  busy: boolean
  lang: string
  onOpen?: (m: MissionHubMission) => void
  pagination?: React.ReactNode
}) {
  const { t } = useTranslation()
  const n = (v: number) => formatInteger(v, lang)
  const hasPay =
    hub.reward_mission_count > 0 ||
    missions.some((m) => missionPayout(m) !== null)
  const set = (patch: Partial<HubListFilters>) =>
    onFiltersChange({ ...filters, ...patch })

  const typeChips: Array<{
    slug: string | undefined
    label: string
    count: number
  }> = [
    {
      slug: undefined,
      label: t("missionHubs.list.all", "All"),
      count: hub.mission_count,
    },
    ...hub.type_counts.map((ty) => ({
      slug: ty.slug,
      label: ty.name,
      count: ty.mission_count,
    })),
    ...(hub.untyped_count > 0
      ? [
          {
            slug: "none",
            label: t("missionHubs.list.noType", "No type listed"),
            count: hub.untyped_count,
          },
        ]
      : []),
  ]
  const showTypeChips =
    hub.type_counts.length + (hub.untyped_count > 0 ? 1 : 0) > 1

  const hint =
    mode === "rank"
      ? t("missionHubs.list.byRank", "Grouped by the rank you need")
      : mode === "giver"
        ? t("missionHubs.list.byGiver", "Grouped by mission giver")
        : mode === "type"
          ? t("missionHubs.list.byType", "Grouped by type")
          : null

  const rows = (list: MissionHubMission[]) => (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {list.map((m) => (
        <li key={m.mission_id}>
          <HubMissionRow
            mission={m}
            hasPay={hasPay}
            showRank={showRank && mode !== "rank"}
            lang={lang}
            onOpen={onOpen}
          />
        </li>
      ))}
    </Box>
  )

  return (
    <Box component="section" aria-labelledby="hub-missions" sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { md: "baseline" },
          justifyContent: "space-between",
          gap: { xs: 0.25, md: 1.5 },
          mb: 1.5,
        }}
      >
        <Typography id="hub-missions" variant="h6" component="h2" sx={{ m: 0 }}>
          {t("missionHubs.list.title", {
            defaultValue: "All {{n}} missions",
            count: hub.mission_count,
            n: n(hub.mission_count),
          })}
        </Typography>
        {hint && (
          <Typography variant="body2" color="text.primary" sx={{ m: 0 }}>
            {hint}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Stack
          direction="row"
          flexWrap="wrap"
          useFlexGap
          spacing={1}
          role="group"
          aria-label={t("missionHubs.list.filters", "Filter missions")}
        >
          {showTypeChips &&
            typeChips.map((chip) => (
              <FilterChip
                key={chip.slug ?? "all"}
                label={chip.label}
                count={n(chip.count)}
                pressed={filters.type === chip.slug}
                onClick={() => set({ type: chip.slug })}
              />
            ))}
          {hub.blueprint_mission_count > 0 && (
            <FilterChip
              label={t(
                "missionHubs.list.rewardsBlueprint",
                "Rewards a blueprint",
              )}
              count={n(hub.blueprint_mission_count)}
              pressed={!!filters.hasBlueprints}
              onClick={() => set({ hasBlueprints: !filters.hasBlueprints })}
            />
          )}
        </Stack>
        <TextField
          select
          size="small"
          label={t("missionHubs.list.sort", "Sort")}
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value as MissionHubSort })}
          sx={{ minWidth: 168 }}
        >
          {SORTS.filter((s) => s !== "rank" || showRank).map((s) => (
            <MenuItem key={s} value={s}>
              {t(`missionHubs.list.sorts.${s}`, SORT_LABELS[s])}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box
        aria-busy={busy}
        sx={{ opacity: busy ? 0.6 : 1, transition: "opacity .15s" }}
      >
        {missions.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2" color="text.primary">
              {t(
                "missionHubs.list.noMatch",
                "No missions match these filters.",
              )}
            </Typography>
          </Paper>
        ) : mode === "flat" ? (
          <Paper variant="outlined">{rows(missions)}</Paper>
        ) : (
          groups.map((g) => (
            <Paper key={g.key} variant="outlined" sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 1,
                  px: { xs: 1.5, md: 2 },
                  py: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Typography
                  component="h3"
                  color="text.secondary"
                  sx={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3, m: 0 }}
                >
                  {g.title}
                </Typography>
                {g.subtitle && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 13,
                      color: "text.primary",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {g.subtitle}
                  </Typography>
                )}
                <Typography
                  component="span"
                  sx={{
                    ml: "auto",
                    fontSize: 13,
                    color: "text.primary",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("missionHubs.missionCount", {
                    defaultValue:
                      g.missions.length === 1
                        ? "{{n}} mission"
                        : "{{n}} missions",
                    count: g.missions.length,
                    n: n(g.missions.length),
                  })}
                </Typography>
              </Box>
              {rows(g.missions)}
            </Paper>
          ))
        )}
      </Box>
      {pagination}
    </Box>
  )
}

const SORT_LABELS: Record<MissionHubSort, string> = {
  name: "Name",
  rank: "Rank needed",
  reputation: "Reputation",
  reward: "aUEC payout",
}

function FilterChip({
  label,
  count,
  pressed,
  onClick,
}: {
  label: string
  count: string
  pressed: boolean
  onClick: () => void
}) {
  return (
    <Chip
      component="button"
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      clickable
      variant="outlined"
      label={
        <>
          {label}{" "}
          <Box
            component="span"
            sx={{ opacity: 0.8, fontVariantNumeric: "tabular-nums" }}
          >
            {count}
          </Box>
        </>
      }
      sx={
        pressed
          ? {
              bgcolor: "rgba(16, 184, 129, 0.16)",
              color: "primary.main",
              borderColor: "rgba(16, 184, 129, 0.7)",
              "&:hover": { bgcolor: "rgba(16, 184, 129, 0.24) !important" },
            }
          : undefined
      }
    />
  )
}
