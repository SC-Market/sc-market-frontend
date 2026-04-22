/**
 * MissionDetailModal - Tabbed modal for mission details on desktop
 * Tabs: Overview, Rewards, Chain Info
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material"
import { Close } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useGetMissionDetailQuery } from "../../store/api/v2/market"
import { getMissionTypeLabel, formatMissionDescription } from "../../util/missionDisplay"
import { getMissionIcon } from "../../util/gameIcons"
import { MissionName } from "./MissionName"
import { MissionRankCalculator } from "./MissionRankCalculator"

interface MissionDetailModalProps {
  missionId: string | null
  open: boolean
  onClose: () => void
  onBlueprintClick?: (blueprintId: string) => void
}

export function MissionDetailModal({ missionId, open, onClose, onBlueprintClick }: MissionDetailModalProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)

  const { data, isLoading, error } = useGetMissionDetailQuery(
    { missionId: missionId! },
    { skip: !missionId },
  )

  React.useEffect(() => { setTab(0) }, [missionId])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" noWrap sx={{ flex: 1 }}>
          <MissionName name={data?.mission.mission_name} variant="inherit" />
        </Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }} variant="scrollable">
        <Tab label={t("missions.overview", "Overview")} />
        <Tab label={t("missions.rewards", "Rewards")} />
        <Tab label={t("missions.rankCalc", "Rank Calculator")} disabled={!data?.mission.reward_scope} />
        <Tab label={t("missions.chainInfo", "Chain Info")} />
      </Tabs>
      <DialogContent sx={{ minHeight: 400 }}>
        {isLoading && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}
        {error && <Alert severity="error">{t("missions.loadError", "Failed to load mission.")}</Alert>}
        {data && tab === 0 && <OverviewTab data={data} />}
        {data && tab === 1 && <RewardsTab data={data} onBlueprintClick={onBlueprintClick} />}
        {data && tab === 2 && data.mission.reward_scope && (
          <MissionRankCalculator
            reputationReward={data.mission.reputation_reward || 0}
            rewardScope={data.mission.reward_scope}
            requiredRank={data.mission.required_rank}
            isShareable={data.mission.is_shareable}
          />
        )}
        {data && tab === 3 && <ChainTab data={data} />}
      </DialogContent>
    </Dialog>
  )
}

function OverviewTab({ data }: { data: any }) {
  const { t } = useTranslation()
  const m = data.mission

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
        {m.category && <Chip
          label={getMissionTypeLabel(m.category)}
          size="small"
          icon={getMissionIcon(m.category) ? <img src={getMissionIcon(m.category)!} alt="" style={{ width: 16, height: 16 }} /> : undefined}
        />}
        {m.career_type && <Chip label={m.career_type} size="small" variant="outlined" />}
        {m.legal_status && (
          <Chip label={m.legal_status} size="small"
            color={m.legal_status === "LEGAL" ? "success" : m.legal_status === "ILLEGAL" ? "error" : "default"} />
        )}
        {m.is_shareable && <Chip label={t("missions.shareable", "Shareable")} size="small" color="info" />}
        {m.is_chain_starter && <Chip label={t("missions.chainStarter", "Chain Starter")} size="small" color="secondary" />}
      </Stack>

      {m.mission_description && (
        <Typography variant="body2" color="text.secondary">{m.mission_description}</Typography>
      )}

      <Divider />

      {m.difficulty_level && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2">{t("missions.difficulty", "Difficulty")}:</Typography>
          <Chip label={`${m.difficulty_level}/5`} size="small" />
        </Stack>
      )}

      {(m.star_system || m.planet_moon) && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2">{t("missions.location", "Location")}:</Typography>
          <Typography variant="body2">
            {[m.star_system, m.planet_moon, m.location_detail].filter(Boolean).join(" → ")}
          </Typography>
        </Stack>
      )}

      {m.faction && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2">{t("missions.faction", "Faction")}:</Typography>
          <Typography variant="body2">{m.faction}</Typography>
        </Stack>
      )}

      {(m.credit_reward_min || m.credit_reward_max) && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2">{t("missions.creditReward", "Credit Reward")}:</Typography>
          <Typography variant="body2">
            {m.credit_reward_min === m.credit_reward_max
              ? `${m.credit_reward_min?.toLocaleString()} aUEC`
              : `${m.credit_reward_min?.toLocaleString()} – ${m.credit_reward_max?.toLocaleString()} aUEC`}
          </Typography>
        </Stack>
      )}

      {(m.community_difficulty_avg || m.community_satisfaction_avg) && (
        <>
          <Divider />
          <Typography variant="subtitle2">{t("missions.communityRatings", "Community Ratings")}</Typography>
          {m.community_difficulty_avg && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">{t("missions.communityDifficulty", "Difficulty")}:</Typography>
              <Typography variant="body2">{m.community_difficulty_avg.toFixed(1)}/5</Typography>
              <Typography variant="caption" color="text.secondary">({m.community_difficulty_count} ratings)</Typography>
            </Stack>
          )}
          {m.community_satisfaction_avg && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">{t("missions.communitySatisfaction", "Satisfaction")}:</Typography>
              <Typography variant="body2">{m.community_satisfaction_avg.toFixed(1)}/5</Typography>
              <Typography variant="caption" color="text.secondary">({m.community_satisfaction_count} ratings)</Typography>
            </Stack>
          )}
        </>
      )}
    </Stack>
  )
}

function RewardsTab({ data, onBlueprintClick }: { data: any; onBlueprintClick?: (id: string) => void }) {
  const { t } = useTranslation()

  if (!data.blueprint_rewards?.length) {
    return <Typography color="text.secondary">{t("missions.noRewards", "No blueprint rewards for this mission.")}</Typography>
  }

  return (
    <Stack spacing={2}>
      {data.blueprint_rewards.map((pool: any, poolIdx: number) => (
        <Box key={poolIdx}>
          {data.blueprint_rewards.length > 1 && (
            <Typography variant="subtitle2" gutterBottom>
              {t("missions.rewardPool", "Reward Pool")} {poolIdx + 1}
              {pool.selection_count && ` (${t("missions.pick", "pick")} ${pool.selection_count})`}
            </Typography>
          )}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("missions.blueprint", "Blueprint")}</TableCell>
                  <TableCell>{t("missions.outputItem", "Output")}</TableCell>
                  <TableCell align="right">{t("missions.dropChance", "Drop Chance")}</TableCell>
                  <TableCell align="center">{t("missions.guaranteed", "Guaranteed")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(pool.blueprints || []).map((bp: any) => (
                  <TableRow
                    key={bp.blueprint_id} hover
                    sx={{ cursor: onBlueprintClick ? "pointer" : undefined }}
                    onClick={() => onBlueprintClick?.(bp.blueprint_id)}
                  >
                    <TableCell>{bp.blueprint_name}</TableCell>
                    <TableCell>{bp.output_item_name}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                        <LinearProgress
                          variant="determinate"
                          value={(bp.drop_probability || 0) * 100}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption">{((bp.drop_probability || 0) * 100).toFixed(0)}%</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      {bp.is_guaranteed ? <Chip label="✓" size="small" color="success" /> : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Stack>
  )
}

function ChainTab({ data }: { data: any }) {
  const { t } = useTranslation()
  const m = data.mission

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="subtitle2">{t("missions.chainStatus", "Chain Status")}:</Typography>
        {m.is_chain_starter && <Chip label={t("missions.chainStarter", "Chain Starter")} size="small" color="secondary" />}
        {m.is_chain_mission && !m.is_chain_starter && <Chip label={t("missions.chainMission", "Part of Chain")} size="small" />}
        {!m.is_chain_mission && !m.is_chain_starter && (
          <Typography variant="body2" color="text.secondary">{t("missions.standalone", "Standalone mission")}</Typography>
        )}
      </Stack>

      {m.is_unique_mission && (
        <Chip label={t("missions.unique", "Unique (one-time)")} size="small" color="warning" />
      )}

      {data.prerequisite_missions?.length > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">{t("missions.prerequisites", "Prerequisites")} ({data.prerequisite_missions.length})</Typography>
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
          <Typography variant="subtitle2">{t("missions.requiredRank", "Required Rank")}:</Typography>
          <Typography variant="body2">{m.required_rank}</Typography>
        </Stack>
      )}

      {m.required_reputation != null && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2">{t("missions.requiredRep", "Required Reputation")}:</Typography>
          <Typography variant="body2">{m.required_reputation}</Typography>
        </Stack>
      )}

      {!m.is_chain_mission && !m.is_chain_starter && !data.prerequisite_missions?.length && (
        <Typography variant="body2" color="text.secondary">
          {t("missions.noChainInfo", "This is a standalone mission with no chain or prerequisite requirements.")}
        </Typography>
      )}
    </Stack>
  )
}
