/**
 * MissionCard - Compact card for grid display
 */

import React from "react"
import {
  Avatar,
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Typography,
  Box,
} from "@mui/material"
import { getMissionTypeLabel, formatCredits } from "../../util/missionDisplay"
import { getMissionIcon, getFactionIcon, getMissionCategoryColor } from "../../util/gameIcons"
import { MissionName } from "./MissionName"
import { Tooltip } from "@mui/material"

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
  }
  onClick?: (missionId: string) => void
}

function initials(name: string | undefined | null): string {
  if (!name) return "?"
  return name.split(/[\s_-]+/).map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission, onClick }) => {
  const giver = mission.mission_giver_org || mission.faction
  const displayGiver = giver?.includes("~mission") ? "Various" : giver
  const missionIcon = getMissionIcon(mission.category) || getFactionIcon(mission.faction)
  const reward = mission.credit_reward_min === mission.credit_reward_max || !mission.credit_reward_max
    ? formatCredits(mission.credit_reward_min)
    : `${formatCredits(mission.credit_reward_min)} – ${formatCredits(mission.credit_reward_max)}`

  return (
    <Card sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea onClick={() => onClick?.(mission.mission_id)} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start" }}>
        <CardContent sx={{ p: 1.5, pb: 0, flex: 1 }}>
          {/* Header: Avatar + Title + Subtitle */}
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
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
        </CardContent>

        {/* Tags */}
        <CardActions sx={{ px: 1.5, pt: 0, pb: 0.5, flexWrap: "wrap", gap: 0.5 }}>
          {mission.star_system && <Chip label={mission.star_system} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {mission.category && <Chip label={getMissionTypeLabel(mission.category)} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {(mission.is_illegal || mission.legal_status === "ILLEGAL") && <Chip label="ILLEGAL" size="small" color="error" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {mission.is_unique_mission && <Chip label="UNIQUE" size="small" color="warning" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {mission.is_chain_starter && <Chip label="STARTER" size="small" color="secondary" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {mission.is_chain_mission && !mission.is_chain_starter && <Chip label="CHAIN" size="small" color="secondary" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {mission.associated_event && <Chip label={mission.associated_event} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {mission.ship_encounter_count > 0 && <Chip label={`🛡 ${mission.ship_encounter_count}`} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {mission.blueprint_reward_count > 0 && <Chip label={`🔧 ${mission.blueprint_reward_count} BP`} size="small" color="secondary" sx={{ height: 18, fontSize: "0.65rem" }} />}
        </CardActions>

        {/* Reward lines — pinned to bottom */}
        <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, mt: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">Reward</Typography>
            <Typography variant="caption" color="success.main" fontWeight={600}>{reward}</Typography>
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
