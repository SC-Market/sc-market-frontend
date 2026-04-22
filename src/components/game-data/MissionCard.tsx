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
import { getMissionIcon, getFactionIcon } from "../../util/gameIcons"
import { MissionName } from "./MissionName"

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
  const missionIcon = getMissionIcon(mission.category) || getFactionIcon(mission.faction)
  const reward = mission.credit_reward_min === mission.credit_reward_max || !mission.credit_reward_max
    ? formatCredits(mission.credit_reward_min)
    : `${formatCredits(mission.credit_reward_min)} – ${formatCredits(mission.credit_reward_max)}`

  return (
    <Card sx={{ height: "100%" }}>
      <CardActionArea onClick={() => onClick?.(mission.mission_id)} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start" }}>
        <CardContent sx={{ p: 1.5, pb: 0, flex: 1 }}>
          {/* Header: Avatar + Title + Subtitle */}
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: "primary.main", flexShrink: 0 }}
              src={missionIcon || undefined}
              imgProps={{ style: { objectFit: "contain", padding: 4 } }}
            >
              {initials(giver)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <MissionName name={mission.mission_name} variant="body2" fontWeight={600} noWrap />
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {giver || mission.star_system || "Unknown"}
              </Typography>
            </Box>
          </Box>
        </CardContent>

        {/* Tags */}
        <CardActions sx={{ px: 1.5, pt: 0, pb: 0.5, flexWrap: "wrap", gap: 0.5 }}>
          {mission.category && <Chip label={getMissionTypeLabel(mission.category)} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {mission.difficulty_level && <Chip label={`D${mission.difficulty_level}`} size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {mission.legal_status === "ILLEGAL" && <Chip label="ILL" size="small" color="error" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {mission.is_shareable && <Chip label="SH" size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {mission.is_chain_starter && <Chip label="CH" size="small" color="secondary" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {mission.blueprint_reward_count > 0 && <Chip label={`${mission.blueprint_reward_count} BP`} size="small" color="secondary" sx={{ height: 18, fontSize: "0.65rem" }} />}
        </CardActions>

        {/* Reward lines — pinned to bottom */}
        <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, mt: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">Reward</Typography>
            <Typography variant="caption" color="success.main" fontWeight={600}>{reward}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">Base XP</Typography>
            <Typography variant="caption" color="text.disabled">—</Typography>
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  )
}
