/**
 * MissionCard - Compact card for grid display
 */

import React from "react"
import {
  Avatar,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
  Box,
} from "@mui/material"
import { getMissionTypeLabel, formatCredits } from "../../util/missionDisplay"
import { useNavigate } from "react-router-dom"
import { getMissionIcon, getFactionIcon, getMissionCategoryColor } from "../../util/gameIcons"
import { MissionName } from "./MissionName"
import { Tooltip } from "@mui/material"
import { ShieldRounded, BuildRounded } from "@mui/icons-material"

export interface MissionCardProps {
  mission: {
    mission_id: string
    mission_name: string
    mission_description?: string
    category?: string
    career_type?: string
    legal_status?: string
    difficulty_level?: number
    star_system?: string
    planet_moon?: string
    faction?: string
    mission_giver_org?: string
    credit_reward_min?: number
    credit_reward_max?: number
    blueprint_reward_count: number
    community_satisfaction_avg?: number
    is_shareable: boolean
    is_chain_starter: boolean
    is_chain_mission: boolean
    is_unique_mission: boolean
    is_illegal?: boolean
    reputation_reward?: number
    associated_event?: string
    ship_encounter_count: number
    hauling_orders?: Array<{ resource_name: string; min_scu: number; max_scu: number }>
  }
  onClick?: (missionId: string) => void
}

function initials(name: string | undefined | null): string {
  if (!name) return "?"
  return name.split(/[\s_-]+/).map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

/** Abbreviate resource name like SCMDB: "Recycled Material Composite" → "RECY" */
function abbrResource(name: string): string {
  const words = name.split(/[\s,]+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase()
  return words.map(w => w[0]).join("").slice(0, 4).toUpperCase()
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission, onClick }) => {
  const nav = useNavigate()
  const giver = mission.mission_giver_org || mission.faction
  const displayGiver = giver?.includes("~mission") ? "Various" : giver
  const missionIcon = getMissionIcon(mission.category) || getFactionIcon(mission.faction)
  const isFee = (mission.credit_reward_min ?? 0) < 0
  const reward = isFee
    ? `Fee: ${formatCredits(Math.abs(mission.credit_reward_min!))}`
    : mission.credit_reward_min === mission.credit_reward_max || !mission.credit_reward_max
      ? formatCredits(mission.credit_reward_min)
      : `${formatCredits(mission.credit_reward_min)} – ${formatCredits(mission.credit_reward_max)}`

  return (
    <Card sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea onClick={() => onClick?.(mission.mission_id)} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start" }}>
        <CardContent sx={{ p: 1.5, pb: 0 }}>
          {/* Header: Avatar + Title + Subtitle */}
          <Box sx={{ display: "flex", gap: 1, mb: 0.75 }}>
            <Tooltip title={getMissionTypeLabel(mission.category)} arrow>
            <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: getMissionCategoryColor(mission.category), flexShrink: 0 }}
              src={missionIcon || undefined}
              variant="rounded"
              imgProps={{ style: { objectFit: "contain", padding: 4 } }}
            >
              {initials(displayGiver)}
            </Avatar>
            </Tooltip>
            <Box sx={{ minWidth: 0 }}>
              <MissionName name={mission.mission_name} variant="body2" fontWeight={600} noWrap />
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {displayGiver || mission.star_system || "Unknown"}
              </Typography>
            </Box>
          </Box>

          {/* Tags — right after header, full width */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px", mb: 0.5 }}>
            {mission.star_system && <Chip label={mission.star_system} size="small" variant="outlined" clickable onClick={(e) => { e.stopPropagation(); e.preventDefault(); nav(`/missions?system=${mission.star_system}`) }} sx={{ height: 18, fontSize: "0.65rem" }} />}
            {mission.category && <Chip label={getMissionTypeLabel(mission.category)} size="small" color="primary" clickable onClick={(e) => { e.stopPropagation(); e.preventDefault(); nav(`/missions?category=${mission.category}`) }} sx={{ height: 18, fontSize: "0.65rem" }} />}
            {(mission.is_illegal || mission.legal_status === "ILLEGAL") && <Chip label="Illegal" size="small" color="error" clickable onClick={(e) => { e.stopPropagation(); e.preventDefault(); nav("/missions?legal=ILLEGAL") }} sx={{ height: 18, fontSize: "0.65rem" }} />}
            {mission.is_unique_mission && <Chip label="Unique" size="small" color="warning" sx={{ height: 18, fontSize: "0.65rem" }} />}
            {mission.is_chain_starter && <Chip label="Starter" size="small" color="secondary" clickable onClick={(e) => { e.stopPropagation(); e.preventDefault(); nav("/missions?chain=true") }} sx={{ height: 18, fontSize: "0.65rem" }} />}
            {mission.is_chain_mission && !mission.is_chain_starter && <Chip label="Chain" size="small" color="secondary" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
            {mission.associated_event && <Chip label={mission.associated_event} size="small" clickable onClick={(e) => { e.stopPropagation(); e.preventDefault(); nav(`/missions?show_events=true&event=${mission.associated_event}`) }} sx={{ height: 18, fontSize: "0.65rem", bgcolor: "info.main", color: "#fff" }} />}
            {mission.ship_encounter_count > 0 && <Chip icon={<ShieldRounded sx={{ fontSize: 14 }} />} label={mission.ship_encounter_count} size="small" color="info" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
            {mission.blueprint_reward_count > 0 && <Chip icon={<BuildRounded sx={{ fontSize: 14 }} />} label={`${mission.blueprint_reward_count} BP`} size="small" color="success" clickable onClick={(e) => { e.stopPropagation(); e.preventDefault(); nav("/missions?blueprints=true") }} sx={{ height: 18, fontSize: "0.65rem" }} />}
          </Box>

          {/* Material badges */}
          {(mission.hauling_orders?.length ?? 0) > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px", mb: 0.5 }}>
              {mission.hauling_orders!.map((h, i) => (
                <Tooltip key={i} title={h.resource_name} arrow>
                  <Chip label={abbrResource(h.resource_name)} size="small"
                    sx={{ height: 18, fontSize: "0.6rem", fontFamily: "monospace", bgcolor: "action.selected" }} />
                </Tooltip>
              ))}
            </Box>
          )}
        </CardContent>

        {/* Reward lines — pinned to bottom */}
        <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, mt: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>Reward</Typography>
            <Typography variant="caption" color={isFee ? "error.main" : "success.main"} fontWeight={600} textAlign="right">{reward}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">Base XP</Typography>
            <Typography variant="caption" color={mission.reputation_reward ? "text.primary" : "text.disabled"}>
              {mission.reputation_reward ? `${mission.reputation_reward.toLocaleString()}` : "—"}
            </Typography>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  )
}
