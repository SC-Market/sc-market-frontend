/**
 * MissionDetailModal - Tabbed modal for mission details
 * Tabs: Overview, Combat, Requirements, Rank Calculator, Community
 * Parity with SCMDB mission detail pages
 */

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Box,
  Typography,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material"
import {
  Close,
  CheckCircleOutline,
  CancelOutlined,
  TimerRounded,
  ShieldRounded,
  BuildRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useGetMissionDetailQuery } from "../../store/api/v2/market"
import { getMissionTypeLabel, formatMissionDescription, formatCredits } from "../../util/missionDisplay"
import { getMissionIcon } from "../../util/gameIcons"
import { MissionName } from "./MissionName"
import { MissionRankCalculator } from "./MissionRankCalculator"

interface MissionDetailModalProps {
  missionId: string | null
  open: boolean
  onClose: () => void
  onBlueprintClick?: (blueprintId: string) => void
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return "—"
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return m ? `${h}h ${m}m` : `${h}h`
}

function BoolChip({ value, label }: { value: boolean | undefined; label: string }) {
  if (value === undefined || value === null) return null
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {value
        ? <CheckCircleOutline sx={{ fontSize: 16, color: "success.main" }} />
        : <CancelOutlined sx={{ fontSize: 16, color: "text.disabled" }} />}
      <Typography variant="body2" color={value ? "text.primary" : "text.disabled"}>{label}</Typography>
    </Stack>
  )
}

export function MissionDetailModal({ missionId, open, onClose, onBlueprintClick }: MissionDetailModalProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)

  const { data, isLoading, error } = useGetMissionDetailQuery(
    { missionId: missionId! },
    { skip: !missionId },
  )

  React.useEffect(() => { setTab(0) }, [missionId])

  const m = data?.mission
  const hasCombat = !!(data?.ship_encounters?.length || data?.npc_encounters?.length || data?.entity_spawns?.length || data?.hauling_orders?.length)
  const hasChain = !!(m?.is_chain_starter || m?.is_chain_mission || data?.prerequisite_missions?.length)

  // Build dynamic tab list
  const tabs: { label: string; id: string }[] = [
    { label: "Overview", id: "overview" },
  ]
  if (hasCombat) tabs.push({ label: "Combat", id: "combat" })
  tabs.push({ label: "Requirements", id: "requirements" })
  if (m?.reward_scope) tabs.push({ label: "Rank Calculator", id: "calculator" })
  if (hasChain) tabs.push({ label: "Chain Info", id: "chain" })

  const activeTab = tabs[tab]?.id || "overview"

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" noWrap sx={{ flex: 1 }}>
          <MissionName name={m?.mission_name} variant="inherit" />
        </Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      {/* Header chips */}
      {m && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ px: 3, pb: 1 }}>
          {m.star_system && <Chip label={m.star_system} size="small" variant="outlined" />}
          {m.category && (
            <Chip
              label={getMissionTypeLabel(m.category)}
              size="small"
              icon={getMissionIcon(m.category) ? <img src={getMissionIcon(m.category)!} alt="" style={{ width: 16, height: 16 }} /> : undefined}
            />
          )}
          {m.career_type && m.career_type !== getMissionTypeLabel(m.category) && (
            <Chip label={m.career_type} size="small" variant="outlined" />
          )}
          {(m.is_illegal || m.legal_status === "ILLEGAL") && <Chip label="ILLEGAL" size="small" color="error" />}
          {m.is_chain_starter && <Chip label="CHAIN" size="small" color="secondary" />}
          {m.is_chain_mission && !m.is_chain_starter && <Chip label="CHAIN" size="small" variant="outlined" />}
          {m.mission_type && <Chip label={m.mission_type} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />}
        </Stack>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }} variant="scrollable">
        {tabs.map((t) => <Tab key={t.id} label={t.label} />)}
      </Tabs>

      <DialogContent sx={{ minHeight: 400 }}>
        {isLoading && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}
        {error && <Alert severity="error">Failed to load mission.</Alert>}

        {data && activeTab === "overview" && <OverviewTab data={data} onBlueprintClick={onBlueprintClick} />}
        {data && activeTab === "combat" && <CombatTab data={data} />}
        {data && activeTab === "requirements" && <RequirementsTab data={data} />}
        {data && activeTab === "calculator" && m?.reward_scope && (
          <MissionRankCalculator
            reputationReward={m.reputation_reward || 0}
            rewardScope={m.reward_scope}
            requiredRank={m.required_rank}
            isShareable={m.is_shareable}
          />
        )}
        {data && activeTab === "chain" && <ChainTab data={data} />}
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Overview Tab
// ============================================================================
function OverviewTab({ data, onBlueprintClick }: { data: any; onBlueprintClick?: (id: string) => void }) {
  const m = data.mission

  return (
    <Stack spacing={2}>
      {/* Description */}
      {m.mission_description && (
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
          {m.mission_description}
        </Typography>
      )}

      <Divider />

      {/* Reward section */}
      <Typography variant="subtitle2">Reward</Typography>
      <Stack spacing={0.5}>
        {(m.credit_reward_min || m.credit_reward_max) && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">UEC</Typography>
            <Typography variant="body2" color="success.main" fontWeight={600}>
              {m.credit_reward_min === m.credit_reward_max || !m.credit_reward_max
                ? formatCredits(m.credit_reward_min)
                : `${formatCredits(m.credit_reward_min)} – ${formatCredits(m.credit_reward_max)}`}
            </Typography>
          </Stack>
        )}
        {m.reputation_reward && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Rep/mission</Typography>
            <Typography variant="body2">{m.reputation_reward.toLocaleString()} XP</Typography>
          </Stack>
        )}
        {m.faction && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Faction</Typography>
            <Typography variant="body2">{m.faction}</Typography>
          </Stack>
        )}
        {m.reward_scope && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Scope</Typography>
            <Typography variant="body2">{m.reward_scope}</Typography>
          </Stack>
        )}
      </Stack>

      {/* Blueprint rewards */}
      {data.blueprint_rewards?.length > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">Blueprint Rewards</Typography>
          {data.blueprint_rewards.map((pool: any, poolIdx: number) => {
            const poolChance = pool.pool_chance != null ? pool.pool_chance * 100 : null
            const bpCount = pool.blueprints?.length || pool.reward_pool_size || 0
            return (
            <Box key={poolIdx} sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.5, mb: 1 }}>
              {/* Pool header */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
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
              {/* Blueprint list */}
              <Stack spacing={0.5}>
                {(pool.blueprints || []).map((bp: any) => (
                  <Stack
                    key={bp.blueprint_id}
                    direction="row" spacing={1} alignItems="center"
                    sx={{ cursor: onBlueprintClick ? "pointer" : undefined, py: 0.25, "&:hover": { bgcolor: "action.hover" }, borderRadius: 0.5, px: 0.5 }}
                    onClick={() => onBlueprintClick?.(bp.blueprint_id)}
                  >
                    <BuildRounded sx={{ fontSize: 16, color: "success.main" }} />
                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                      {bp.output_item_name || bp.blueprint_name}
                    </Typography>
                    {bp.user_owns && <CheckCircleOutline sx={{ fontSize: 16, color: "success.main" }} />}
                  </Stack>
                ))}
              </Stack>
            </Box>
            )
          })}
        </>
      )}

      {/* Location */}
      {(m.star_system || m.planet_moon) && (
        <>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Location</Typography>
            <Typography variant="body2">
              {[m.star_system, m.planet_moon, m.location_detail].filter(Boolean).join(" → ")}
            </Typography>
          </Stack>
        </>
      )}

      {/* Difficulty */}
      {(m.difficulty_level || m.difficulty_from_broker) && (
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">Difficulty</Typography>
          <Typography variant="body2">{m.difficulty_level || m.difficulty_from_broker}/5</Typography>
        </Stack>
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
// Combat Tab
// ============================================================================
function CombatTab({ data }: { data: any }) {
  const shipEnc = data.ship_encounters || []
  const npcEnc = data.npc_encounters || []
  const entities = data.entity_spawns || []
  const hauling = data.hauling_orders || []

  const totalShips = shipEnc.reduce((sum: number, e: any) =>
    sum + (e.waves || []).reduce((ws: number, w: any) => ws + (w.ship_count || 0), 0), 0)

  return (
    <Stack spacing={2}>
      {/* Ship Encounters */}
      {shipEnc.length > 0 && (
        <>
          <Typography variant="subtitle2">
            Ship Encounters
            {totalShips > 0 && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {totalShips} ship{totalShips !== 1 ? "s" : ""} total
              </Typography>
            )}
          </Typography>
          {shipEnc.map((enc: any, i: number) => (
            <Box key={i} sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <ShieldRounded sx={{ fontSize: 16, color: enc.role?.toLowerCase().includes("friendly") ? "info.main" : "error.main" }} />
                <Typography variant="body2" fontWeight={600}>{enc.role}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {(enc.waves || []).reduce((s: number, w: any) => s + (w.ship_count || 0), 0)} ships
                </Typography>
              </Stack>
              {(enc.waves || []).map((wave: any, wi: number) => (
                <Stack key={wi} direction="row" spacing={1} alignItems="center" sx={{ pl: 3 }}>
                  <Typography variant="caption" color="text.secondary">{wave.name}:</Typography>
                  <Typography variant="caption">{wave.ship_count} ship{wave.ship_count !== 1 ? "s" : ""}</Typography>
                </Stack>
              ))}
            </Box>
          ))}
        </>
      )}

      {/* NPC Encounters */}
      {npcEnc.length > 0 && (
        <>
          <Typography variant="subtitle2">NPC Encounters</Typography>
          {npcEnc.map((npc: any, i: number) => (
            <Stack key={i} direction="row" justifyContent="space-between">
              <Typography variant="body2">{npc.name}</Typography>
              <Typography variant="body2" color="text.secondary">×{npc.count}</Typography>
            </Stack>
          ))}
        </>
      )}

      {/* Entity Spawns */}
      {entities.length > 0 && (
        <>
          <Typography variant="subtitle2">Entity Spawns</Typography>
          {entities.map((e: any, i: number) => (
            <Stack key={i} direction="row" justifyContent="space-between">
              <Typography variant="body2">{e.name}</Typography>
              <Typography variant="body2" color="text.secondary">×{e.count}</Typography>
            </Stack>
          ))}
        </>
      )}

      {/* Hauling Orders */}
      {hauling.length > 0 && (
        <>
          <Typography variant="subtitle2">Hauling Orders</Typography>
          {hauling.map((h: any, i: number) => (
            <Stack key={i} direction="row" justifyContent="space-between">
              <Typography variant="body2">{h.resource_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {h.min_scu === h.max_scu ? `${h.min_scu} SCU` : `${h.min_scu}–${h.max_scu} SCU`}
              </Typography>
            </Stack>
          ))}
        </>
      )}

      {!shipEnc.length && !npcEnc.length && !entities.length && !hauling.length && (
        <Typography color="text.secondary">No combat data available for this mission.</Typography>
      )}
    </Stack>
  )
}

// ============================================================================
// Requirements Tab
// ============================================================================
function RequirementsTab({ data }: { data: any }) {
  const m = data.mission

  return (
    <Stack spacing={2}>
      {/* Standing requirements */}
      {(m.min_standing || m.max_standing) && (
        <>
          <Typography variant="subtitle2">Required Standing</Typography>
          <Stack spacing={0.5}>
            {m.min_standing && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Min</Typography>
                <Typography variant="body2">{m.min_standing}</Typography>
              </Stack>
            )}
            {m.max_standing && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Max</Typography>
                <Typography variant="body2">{m.max_standing}</Typography>
              </Stack>
            )}
          </Stack>
          <Divider />
        </>
      )}

      {/* Mission properties */}
      <Typography variant="subtitle2">Mission Properties</Typography>
      <Stack spacing={0.75}>
        <BoolChip value={m.is_shareable} label="Shareable" />
        <BoolChip value={m.is_illegal} label="Illegal" />
        <BoolChip value={m.is_unique_mission} label="Once Only" />
        <BoolChip value={m.can_reaccept_after_abandoning} label="Re-accept after abandon" />
        <BoolChip value={m.can_reaccept_after_failing} label="Re-accept after fail" />
        <BoolChip value={m.available_in_prison} label="Available in prison" />
      </Stack>

      <Divider />

      {/* Timing */}
      <Typography variant="subtitle2">Timing</Typography>
      <Stack spacing={0.5}>
        {m.personal_cooldown_time != null && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              <TimerRounded sx={{ fontSize: 14, mr: 0.5, verticalAlign: "text-bottom" }} />
              Cooldown
            </Typography>
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

      {/* Crimestat */}
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
function ChainTab({ data }: { data: any }) {
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

      {m.is_unique_mission && <Chip label="Unique (one-time)" size="small" color="warning" sx={{ alignSelf: "flex-start" }} />}

      {data.prerequisite_missions?.length > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">Prerequisites ({data.prerequisite_missions.length})</Typography>
          <Stack spacing={0.5}>
            {data.prerequisite_missions.map((pm: any) => (
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

      {!m.is_chain_mission && !m.is_chain_starter && !data.prerequisite_missions?.length && (
        <Typography variant="body2" color="text.secondary">
          This is a standalone mission with no chain or prerequisite requirements.
        </Typography>
      )}
    </Stack>
  )
}
