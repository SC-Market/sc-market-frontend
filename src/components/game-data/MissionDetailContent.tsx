/**
 * MissionDetailContent — shared tab components used by both the modal and standalone page.
 * Exports: MissionHeaderChips, MissionTabs, and all tab content renderers.
 */

import React, { useState } from "react"
import {
  Box,
  Chip,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material"
import {
  CheckCircleOutline,
  CancelOutlined,
  TimerRounded,
  BuildRounded,
} from "@mui/icons-material"
import type { MissionDetailResponse, Mission, MissionRewardPool, MissionBlueprintReward, HaulingOrder } from "../../store/api/v2/market"
import { useNavigate } from "react-router-dom"
import { getMissionTypeLabel, formatCredits } from "../../util/missionDisplay"
import { getMissionIcon } from "../../util/gameIcons"
import { MissionName, MissionDescription } from "./MissionName"
import { MissionRankCalculator } from "./MissionRankCalculator"
import { MissionTypeDetails } from "./MissionTypeDetails"
import { GAME_DATA_PATHS } from "../../routes/paths"

// ============================================================================
// Helpers
// ============================================================================

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return "—"
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return m ? `${h}h ${m}m` : `${h}h`
}

/** Format raw scope codes to readable names */
const SCOPE_LABELS: Record<string, string> = {
  factionreputationscope: "Faction Reputation",
  factionreputation: "Faction Reputation",
  headhunter: "Headhunter",
  salvage: "Salvage",
  mercenary: "Mercenary",
  bounty: "Bounty",
  mining: "Mining",
  hauling: "Hauling",
  delivery: "Delivery",
  investigation: "Investigation",
}
function formatScope(scope: string): string {
  const lower = scope.toLowerCase()
  if (SCOPE_LABELS[lower]) return SCOPE_LABELS[lower]
  return scope
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, s => s.toUpperCase())
}

function BoolChip({ value, label }: { value: boolean | undefined; label: string }) {
  if (value === undefined || value === null) return null
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {value
        ? <CheckCircleOutline sx={{ fontSize: 16, color: "success.main" }} />
        : <CancelOutlined sx={{ fontSize: 16, color: "text.disabled" }} />}
      <Typography variant="body2" color={value ? "text.primary" : "text.secondary"}>{label}</Typography>
    </Stack>
  )
}

// ============================================================================
// Header Chips — shared between modal and page
// ============================================================================

export function MissionHeaderChips({ mission: m }: { mission: Mission }) {
  const navigate = useNavigate()
  const go = (params: Record<string, string>) => {
    const sp = new URLSearchParams(params)
    navigate(`${GAME_DATA_PATHS.missions}?${sp.toString()}`)
  }
  const giver = m.mission_giver_org || m.faction
  const showGiver = giver && !giver.includes("~mission")

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {m.star_system && <Chip label={m.star_system} size="small" variant="outlined" clickable onClick={() => go({ system: m.star_system! })} />}
      {m.category && (
        <Chip
          label={getMissionTypeLabel(m.category)}
          size="small"
          clickable
          onClick={() => go({ category: m.category })}
          icon={getMissionIcon(m.category) ? <img src={getMissionIcon(m.category)!} alt="" style={{ width: 16, height: 16 }} /> : undefined}
        />
      )}
      {showGiver && <Chip label={giver} size="small" variant="outlined" clickable onClick={() => go({ giver: giver! })} />}
      {(m.is_illegal || m.legal_status === "ILLEGAL") && <Chip label="Illegal" size="small" color="error" clickable onClick={() => go({ legal: "ILLEGAL" })} />}
      {m.is_unique_mission && <Chip label="Unique" size="small" color="warning" />}
      {m.is_chain_starter && <Chip label="Starter" size="small" color="secondary" clickable onClick={() => go({ chain: "true" })} />}
      {m.is_chain_mission && !m.is_chain_starter && <Chip label="Chain" size="small" color="secondary" variant="outlined" />}
      {m.is_shareable && <Chip label="Shareable" size="small" variant="outlined" clickable onClick={() => go({ shareable: "true" })} />}
      {m.associated_event && <Chip label={m.associated_event} size="small" clickable onClick={() => go({ show_events: "true", event: m.associated_event! })} sx={{ bgcolor: "info.main", color: "#fff" }} />}
      {m.difficulty_level && <Chip label={`D${m.difficulty_level}`} size="small" color="warning" variant="outlined" />}
    </Stack>
  )
}

// ============================================================================
// Tabbed Content — renders all tabs with state management
// ============================================================================

export function MissionDetailTabs({ data, onBlueprintClick }: { data: MissionDetailResponse; onBlueprintClick?: (id: string) => void }) {
  const [tab, setTab] = useState(0)
  const m = data.mission
  const hasChain = !!(m.is_chain_starter || m.is_chain_mission || data.prerequisite_missions?.length)

  const hasDetails = !!(data.ship_encounters?.length || data.npc_encounters?.length || data.entity_spawns?.length || data.hauling_orders?.length)

  const tabs: { label: string; id: string }[] = [
    { label: "Overview", id: "overview" },
  ]
  if (hasDetails) tabs.push({ label: "Details", id: "details" })
  tabs.push({ label: "Requirements", id: "requirements" })
  if (m.reward_scope) tabs.push({ label: "Rank Calculator", id: "calculator" })
  if (hasChain) tabs.push({ label: "Chain Info", id: "chain" })

  const activeTab = tabs[tab]?.id || "overview"

  return (
    <>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
        {tabs.map((t) => <Tab key={t.id} label={t.label} />)}
      </Tabs>
      <Box sx={{ pt: 2 }}>
        {activeTab === "overview" && <OverviewTab data={data} onBlueprintClick={onBlueprintClick} />}
        {activeTab === "details" && <MissionTypeDetails data={data} />}
        {activeTab === "requirements" && <RequirementsTab data={data} />}
        {activeTab === "calculator" && m.reward_scope && (
          <MissionRankCalculator
            reputationReward={m.reputation_reward || 0}
            rewardScope={m.reward_scope}
            rewardFaction={m.reputation_reward_faction}
            requiredRank={m.required_rank}
            minStanding={m.min_standing}
            isShareable={m.is_shareable}
          />
        )}
        {activeTab === "chain" && <ChainTab data={data} />}
      </Box>
    </>
  )
}

// ============================================================================
// Overview Tab
// ============================================================================

function OverviewTab({ data, onBlueprintClick }: { data: MissionDetailResponse; onBlueprintClick?: (id: string) => void }) {
  const m = data.mission

  return (
    <Stack spacing={2}>
      {m.mission_description && (
        <MissionDescription text={m.mission_description} variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }} />
      )}

      <Divider />

      {/* Reward */}
      <Typography variant="subtitle2">Reward</Typography>
      <Stack spacing={0.5}>
        {(m.credit_reward_min || m.credit_reward_max) && (() => {
          const isFee = (m.credit_reward_min ?? 0) < 0
          return (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">{isFee ? "Fee" : "UEC"}</Typography>
              <Typography variant="body2" color={isFee ? "error.main" : "success.main"} fontWeight={600}>
                {isFee
                  ? formatCredits(Math.abs(m.credit_reward_min!))
                  : m.credit_reward_min === m.credit_reward_max || !m.credit_reward_max
                    ? formatCredits(m.credit_reward_min)
                    : `${formatCredits(m.credit_reward_min)} – ${formatCredits(m.credit_reward_max)}`}
              </Typography>
            </Stack>
          )
        })()}
        {m.reputation_reward != null && m.reputation_reward > 0 && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Rep/mission</Typography>
            <Typography variant="body2">{m.reputation_reward.toLocaleString()} XP</Typography>
          </Stack>
        )}
        {m.faction && !m.faction.includes("~mission") && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Faction</Typography>
            <Typography variant="body2">{m.faction}</Typography>
          </Stack>
        )}
        {m.reward_scope && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Scope</Typography>
            <Typography variant="body2">{formatScope(m.reward_scope)}</Typography>
          </Stack>
        )}
      </Stack>

      {/* Blueprint rewards — table format */}
      {data.blueprint_rewards?.length > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">Blueprint Rewards</Typography>
          {data.blueprint_rewards.map((pool, poolIdx) => {
            const poolChance = pool.pool_chance != null ? pool.pool_chance * 100 : null
            const bpCount = pool.blueprints?.length || pool.reward_pool_size || 0
            return (
              <Box key={poolIdx} sx={{ mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  {pool.pool_name && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}>
                      {pool.pool_name}
                    </Typography>
                  )}
                  <Box sx={{ flex: 1 }} />
                  {poolChance != null && (
                    <Chip label={`${poolChance}% chance`} size="small" color={poolChance >= 100 ? "success" : "default"} sx={{ height: 20, fontSize: "0.7rem" }} />
                  )}
                  {pool.selection_count > 0 && bpCount > 0 && (
                    <Chip label={`${pool.selection_count} of ${bpCount}`} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
                  )}
                </Stack>
                <Table size="small" sx={{ "& td, & th": { py: 0.5, px: 1 } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Blueprint</TableCell>
                      <TableCell align="right">Drop Chance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(pool.blueprints || []).map((bp) => {
                      const pct = bp.drop_probability >= 1 ? bp.drop_probability : bp.drop_probability * 100
                      return (
                        <TableRow
                          key={bp.blueprint_id} hover
                          sx={{ cursor: onBlueprintClick ? "pointer" : undefined }}
                          onClick={() => onBlueprintClick?.(bp.blueprint_name || bp.blueprint_code || bp.blueprint_id)}
                        >
                          <TableCell>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <BuildRounded sx={{ fontSize: 14, color: "success.main" }} />
                              <Typography variant="body2" fontWeight={600}>{bp.output_item_name || bp.blueprint_name}</Typography>
                              {bp.user_owns && <CheckCircleOutline sx={{ fontSize: 14, color: "success.main" }} />}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                              <LinearProgress variant="determinate" value={Math.min(pct, 100)} sx={{ width: 50, height: 4, borderRadius: 2 }} />
                              <Typography variant="caption">{pct >= 100 ? "Guaranteed" : `${pct.toFixed(0)}%`}</Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </Box>
            )
          })}
        </>
      )}

      {/* Hauling Orders */}
      {(data.hauling_orders?.length ?? 0) > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">Hauling Orders</Typography>
          <Stack spacing={0.25}>
            {data.hauling_orders!.map((h, i) => (
              <Stack key={i} direction="row" justifyContent="space-between">
                <Typography variant="body2">{h.resource_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {h.min_scu === h.max_scu ? `${h.min_scu} SCU` : `${h.min_scu}–${h.max_scu} SCU`}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </>
      )}

      {/* Item Rewards */}
      {(m.item_rewards?.length ?? 0) > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">Item Rewards</Typography>
          <Stack spacing={0.25}>
            {m.item_rewards!.map((item, i) => (
              <Typography key={i} variant="body2">{item.name}</Typography>
            ))}
          </Stack>
        </>
      )}

      {/* Location */}
      {(m.star_system || m.planet_moon) && (
        <>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Location</Typography>
            <Typography variant="body2">{[m.star_system, m.planet_moon, m.location_detail].filter(Boolean).join(" → ")}</Typography>
          </Stack>
        </>
      )}

      {/* Community ratings */}
      {(m.community_difficulty_avg || m.community_satisfaction_avg) && (
        <>
          <Divider />
          <Typography variant="subtitle2">Community Ratings</Typography>
          {m.community_difficulty_avg != null && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Difficulty</Typography>
              <Typography variant="body2">{m.community_difficulty_avg.toFixed(1)}/5 ({m.community_difficulty_count} ratings)</Typography>
            </Stack>
          )}
          {m.community_satisfaction_avg != null && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Satisfaction</Typography>
              <Typography variant="body2">{m.community_satisfaction_avg.toFixed(1)}/5 ({m.community_satisfaction_count} ratings)</Typography>
            </Stack>
          )}
        </>
      )}
    </Stack>
  )
}

// ============================================================================
// Requirements Tab
// ============================================================================

function RequirementsTab({ data }: { data: MissionDetailResponse }) {
  const m = data.mission
  return (
    <Stack spacing={2}>
      {(m.min_standing || m.max_standing) && (
        <>
          <Typography variant="subtitle2">Required Standing</Typography>
          <Stack spacing={0.5}>
            {m.min_standing && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Min</Typography>
                <Typography variant="body2">{m.min_standing_display || m.min_standing}</Typography>
              </Stack>
            )}
            {m.max_standing && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Max</Typography>
                <Typography variant="body2">{m.max_standing_display || m.max_standing}</Typography>
              </Stack>
            )}
          </Stack>
          <Divider />
        </>
      )}

      <Typography variant="subtitle2">Mission Properties</Typography>
      <Stack spacing={0.75}>
        <BoolChip value={m.is_shareable} label="Shareable" />
        <BoolChip value={m.is_illegal} label="Illegal" />
        <BoolChip value={m.is_lawful} label="Lawful" />
        <BoolChip value={m.is_unique_mission} label="Once Only" />
        <BoolChip value={m.can_reaccept_after_abandoning} label="Re-accept after abandon" />
        <BoolChip value={m.can_reaccept_after_failing} label="Re-accept after fail" />
        <BoolChip value={m.available_in_prison} label="Available in prison" />
      </Stack>

      {m.required_reputation != null && (
        <>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Required Reputation</Typography>
            <Typography variant="body2">{m.required_reputation.toLocaleString()} XP</Typography>
          </Stack>
        </>
      )}

      <Divider />

      <Typography variant="subtitle2">Timing</Typography>
      <Stack spacing={0.5}>
        {m.time_to_complete != null && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary"><TimerRounded sx={{ fontSize: 14, mr: 0.5, verticalAlign: "text-bottom" }} />Time to Complete</Typography>
            <Typography variant="body2">{formatDuration(m.time_to_complete)}</Typography>
          </Stack>
        )}
        {m.personal_cooldown_time != null && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary"><TimerRounded sx={{ fontSize: 14, mr: 0.5, verticalAlign: "text-bottom" }} />Cooldown</Typography>
            <Typography variant="body2">{formatDuration(m.personal_cooldown_time)}</Typography>
          </Stack>
        )}
        {m.abandoned_cooldown_time != null && m.abandoned_cooldown_time !== m.personal_cooldown_time && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Abandon cooldown</Typography>
            <Typography variant="body2">{formatDuration(m.abandoned_cooldown_time)}</Typography>
          </Stack>
        )}
        {m.deadline_seconds != null && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Deadline</Typography>
            <Typography variant="body2">{formatDuration(m.deadline_seconds)}</Typography>
          </Stack>
        )}
      </Stack>

      {(m.accept_locations?.length ?? 0) > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">Available At</Typography>
          <Stack spacing={0.25}>
            {m.accept_locations!.map((loc, i) => (
              <Typography key={i} variant="body2">{loc}</Typography>
            ))}
          </Stack>
        </>
      )}

      {m.max_crimestat != null && (
        <>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Max Crimestat</Typography>
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

function ChainTab({ data }: { data: MissionDetailResponse }) {
  const m = data.mission
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="subtitle2">Chain Status:</Typography>
        {m.is_chain_starter && <Chip label="Chain Starter" size="small" color="secondary" />}
        {m.is_chain_mission && !m.is_chain_starter && <Chip label="Part of Chain" size="small" />}
        {!m.is_chain_mission && !m.is_chain_starter && (
          <Typography variant="body2" color="text.secondary">Standalone mission</Typography>
        )}
      </Stack>

      {(data.prerequisite_missions?.length ?? 0) > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">Prerequisites ({data.prerequisite_missions!.length})</Typography>
          <Stack spacing={0.5}>
            {data.prerequisite_missions!.map((pm) => (
              <Stack key={pm.mission_id} direction="row" spacing={1} alignItems="center">
                <MissionName name={pm.mission_name} variant="body2" />
                {pm.category && <Chip label={getMissionTypeLabel(pm.category)} size="small" variant="outlined" />}
              </Stack>
            ))}
          </Stack>
        </>
      )}

      {m.required_rank != null && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2">Required Rank:</Typography>
          <Typography variant="body2">{m.required_rank}</Typography>
        </Stack>
      )}
    </Stack>
  )
}
