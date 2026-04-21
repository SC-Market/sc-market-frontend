/**
 * MissionCard - Display mission information in card format
 * 
 * Reusable card component for displaying mission metadata including:
 * - Mission name, category, career type
 * - Location, legal status, difficulty
 * - Credit rewards and blueprint count
 * - Community ratings
 * - Hover effects for interactivity
 * 
 * Task 11.2 - Create MissionCard component
 * Requirements: 42.1-42.10, 49.3, 49.4, 49.5
 */

import React from "react"
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material"
import { getMissionTypeLabel, formatMissionDescription, formatCredits } from "../../util/missionDisplay"
import { MissionName } from "./MissionName"

export interface MissionCardProps {
  /** Mission data */
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
    credit_reward_min?: number
    credit_reward_max?: number
    blueprint_reward_count: number
    community_satisfaction_avg?: number
    is_shareable: boolean
    is_chain_starter: boolean
  }
  /** Click handler */
  onClick?: (missionId: string) => void
}

/**
 * MissionCard Component
 * 
 * Features:
 * - Displays mission name and metadata (42.1, 42.2, 42.3)
 * - Shows location and legal status (42.4, 17.2)
 * - Displays difficulty level (42.6, 17.3)
 * - Shows credit rewards (42.4)
 * - Shows blueprint count (42.9)
 * - Displays community ratings (49.3, 49.4, 49.5)
 * - Hover effects for interactivity
 * - Responsive layout
 */
export const MissionCard: React.FC<MissionCardProps> = ({ mission, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(mission.mission_id)
    }
  }

  return (
    <Card
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: 3,
            }
          : {},
      }}
      onClick={handleClick}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          {/* Left side - Mission info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <MissionName name={mission.mission_name} variant="h6" gutterBottom sx={{ wordBreak: "break-word" }} />

            {/* Mission Metadata Badges */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1, gap: 0.5 }}>
              {mission.category && (
                <Chip label={getMissionTypeLabel(mission.category)} size="small" color="primary" />
              )}
              {mission.career_type && <Chip label={mission.career_type} size="small" />}
              {mission.legal_status && (
                <Chip
                  label={mission.legal_status}
                  size="small"
                  color={mission.legal_status === "LEGAL" ? "success" : "error"}
                />
              )}
              {mission.difficulty_level && (
                <Chip
                  label={`Difficulty ${mission.difficulty_level}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {mission.is_shareable && (
                <Chip label="Shareable" size="small" variant="outlined" />
              )}
              {mission.is_chain_starter && (
                <Chip label="Chain Starter" size="small" color="secondary" />
              )}
            </Stack>

            {/* Location and Faction */}
            <Typography variant="body2" color="text.secondary">
              {[mission.star_system, mission.planet_moon, mission.faction]
                .filter(Boolean)
                .join(" • ")}
            </Typography>

            {/* Description (ellipsed to 3 lines) */}
            {mission.mission_description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  "& .placeholder": { color: "info.main", fontStyle: "italic" },
                }}
                dangerouslySetInnerHTML={{
                  __html: formatMissionDescription(mission.mission_description)
                    .replace(/\[([^\]]+)\]/g, '<span class="placeholder">[$1]</span>')
                    .replace(/\n/g, "<br/>"),
                }}
              />
            )}
          </Box>

          {/* Right side - Rewards */}
          <Box
            sx={{
              textAlign: { xs: "left", sm: "right" },
              minWidth: { xs: "100%", sm: "auto" },
            }}
          >
            {(mission.credit_reward_min || mission.credit_reward_max) && (
              <Typography variant="body1" color="success.main" fontWeight="bold">
                {mission.credit_reward_min === mission.credit_reward_max || !mission.credit_reward_max
                  ? formatCredits(mission.credit_reward_min)
                  : `${formatCredits(mission.credit_reward_min)} - ${formatCredits(mission.credit_reward_max)}`}
              </Typography>
            )}
            {mission.blueprint_reward_count > 0 && (
              <Typography variant="body2" color="primary">
                {mission.blueprint_reward_count} Blueprint
                {mission.blueprint_reward_count !== 1 ? "s" : ""}
              </Typography>
            )}
            {mission.community_satisfaction_avg && (
              <Typography variant="caption" color="text.secondary">
                ⭐ {mission.community_satisfaction_avg.toFixed(1)} satisfaction
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
