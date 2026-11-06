import { Chip, Divider, Stack, Typography } from "@mui/material"
import {
  CheckCircleOutlineRounded,
  HighlightOffRounded,
  TimerRounded,
} from "@mui/icons-material"
import type { MissionDetailResponse } from "../../features/game-data/api/gameDataApi"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import { getMissionTypeLabel } from "../../util/missionDisplay"
import { MissionName } from "./MissionName"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { useFormatters } from "../../util/format"
import { TagChip } from "../tags/TagChip"

// ============================================================================
// Helpers
// ============================================================================

function formatDuration(seconds: number | undefined, t: TFunction): string {
  if (!seconds) return "—"
  if (seconds < 60) return t("gameTaxonomyUi.duration.seconds", { s: seconds })
  if (seconds < 3600)
    return t("gameTaxonomyUi.duration.minutes", { m: Math.floor(seconds / 60) })
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return m
    ? t("gameTaxonomyUi.duration.hoursMinutes", { h, m })
    : t("gameTaxonomyUi.duration.hours", { h })
}

function BoolChip({
  value,
  label,
}: {
  value: boolean | undefined
  label: string
}) {
  if (value === undefined || value === null) return null
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {value ? (
        <CheckCircleOutlineRounded
          sx={{ fontSize: 16, color: "success.main" }}
        />
      ) : (
        <HighlightOffRounded sx={{ fontSize: 16, color: "text.disabled" }} />
      )}
      <Typography
        variant="body2"
        color={value ? "text.primary" : "text.secondary"}
      >
        {label}
      </Typography>
    </Stack>
  )
}

// ============================================================================
// Requirements Tab
// ============================================================================

export function RequirementsTab({ data }: { data: MissionDetailResponse }) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const m = data.mission
  return (
    <Stack spacing={2}>
      {(m.min_standing || m.max_standing) && (
        <>
          <Typography variant="subtitle2">
            {t("missionsUi.requiredStanding")}
          </Typography>
          <Stack spacing={0.5}>
            {m.min_standing && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  {t("missionsUi.min")}
                </Typography>
                <Typography variant="body2">
                  {m.min_standing_display || m.min_standing}
                </Typography>
              </Stack>
            )}
            {m.max_standing && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  {t("missionsUi.max")}
                </Typography>
                <Typography variant="body2">
                  {m.max_standing_display || m.max_standing}
                </Typography>
              </Stack>
            )}
          </Stack>
          <Divider />
        </>
      )}

      <Typography variant="subtitle2">{t("missionsUi.properties")}</Typography>
      <Stack spacing={0.75}>
        <BoolChip value={m.is_shareable} label={t("missionsUi.shareable")} />
        <BoolChip value={m.is_illegal} label={t("missionsUi.illegal")} />
        <BoolChip value={m.is_lawful} label={t("missionsUi.lawful")} />
        <BoolChip
          value={m.is_unique_mission}
          label={t("missionsUi.onceOnly")}
        />
        <BoolChip
          value={m.can_reaccept_after_abandoning}
          label={t("missionsUi.reacceptAbandon")}
        />
        <BoolChip
          value={m.can_reaccept_after_failing}
          label={t("missionsUi.reacceptFail")}
        />
        <BoolChip
          value={m.available_in_prison}
          label={t("missionsUi.availableInPrison")}
        />
      </Stack>

      {m.required_reputation != null && (
        <>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {t("missionsUi.requiredReputation")}
            </Typography>
            <Typography variant="body2">
              {fmt.number(m.required_reputation)} XP
            </Typography>
          </Stack>
        </>
      )}

      <Divider />

      <Typography variant="subtitle2">{t("missionsUi.timing")}</Typography>
      <Stack spacing={0.5}>
        {m.time_to_complete != null && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              <TimerRounded
                sx={{ fontSize: 14, mr: 0.5, verticalAlign: "text-bottom" }}
              />
              {t("missionsUi.timeToComplete")}
            </Typography>
            <Typography variant="body2">
              {formatDuration(m.time_to_complete, t)}
            </Typography>
          </Stack>
        )}
        {m.personal_cooldown_time != null && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              <TimerRounded
                sx={{ fontSize: 14, mr: 0.5, verticalAlign: "text-bottom" }}
              />
              {t("missionsUi.cooldown")}
            </Typography>
            <Typography variant="body2">
              {formatDuration(m.personal_cooldown_time, t)}
            </Typography>
          </Stack>
        )}
        {m.abandoned_cooldown_time != null &&
          m.abandoned_cooldown_time !== m.personal_cooldown_time && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {t("missionsUi.abandonCooldown")}
              </Typography>
              <Typography variant="body2">
                {formatDuration(m.abandoned_cooldown_time, t)}
              </Typography>
            </Stack>
          )}
        {m.deadline_seconds != null && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {t("missionsUi.deadline")}
            </Typography>
            <Typography variant="body2">
              {formatDuration(m.deadline_seconds, t)}
            </Typography>
          </Stack>
        )}
      </Stack>

      {(m.accept_locations?.length ?? 0) > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">
            {t("missionsUi.availableAt")}
          </Typography>
          <Stack spacing={0.25}>
            {m.accept_locations!.map((loc, i) => (
              <Typography key={i} variant="body2">
                {loc}
              </Typography>
            ))}
          </Stack>
        </>
      )}

      {m.max_crimestat != null && (
        <>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {t("missionsUi.maxCrimestat")}
            </Typography>
            <Typography variant="body2">{m.max_crimestat}</Typography>
          </Stack>
        </>
      )}
    </Stack>
  )
}

// ============================================================================
// Chain Tab
// ============================================================================

export function ChainTab({ data }: { data: MissionDetailResponse }) {
  const { t } = useTranslation()
  const m = data.mission
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="subtitle2">
          {t("missionsUi.chainStatus")}
        </Typography>
        {m.is_chain_starter && (
          <Chip
            label={t("missionsUi.chainStarter")}
            size="small"
            variant="outlined"
          />
        )}
        {m.is_chain_mission && !m.is_chain_starter && (
          <Chip label={t("missionsUi.partOfChain")} size="small" />
        )}
        {!m.is_chain_mission && !m.is_chain_starter && (
          <Typography variant="body2" color="text.secondary">
            {t("missionsUi.standalone")}
          </Typography>
        )}
      </Stack>

      {(data.prerequisite_missions?.length ?? 0) > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">
            {t("missionsUi.prerequisites", {
              count: data.prerequisite_missions!.length,
            })}
          </Typography>
          <Stack spacing={0.5}>
            {data.prerequisite_missions!.map((pm) => (
              <Stack
                key={pm.mission_id}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <RouterLink
                  to={GAME_DATA_PATHS.mission(pm.mission_id)}
                  style={{ color: "inherit" }}
                >
                  <MissionName
                    name={pm.mission_name}
                    variant="body2"
                    component="span"
                  />
                </RouterLink>
                {pm.category && (
                  <TagChip
                    tag="category"
                    label={getMissionTypeLabel(pm.category, t)}
                  />
                )}
              </Stack>
            ))}
          </Stack>
        </>
      )}

      {m.required_rank != null && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2">
            {t("missionsUi.requiredRank")}
          </Typography>
          <Typography variant="body2">{m.required_rank}</Typography>
        </Stack>
      )}
    </Stack>
  )
}
