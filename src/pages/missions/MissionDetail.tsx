/**
 * MissionDetail Component
 * 
 * Display comprehensive mission information including:
 * - Full mission metadata (name, description, location, difficulty, etc.)
 * - Blueprint reward pools with probabilities
 * - Prerequisite missions
 * - Mission chain information
 * - Credit and reputation rewards
 * - Community ratings
 * 
 * Task 11.4 - Create MissionDetail component
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 24.1-24.6, 47.1-47.10
 */

import React from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Grid2 as Grid,
} from "@mui/material"
import { useParams, useNavigate } from "react-router-dom"
import { useGetMissionDetailQuery } from "../../store/api/v2/market"
import { RarityBadge } from "../../components/game-data"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

/**
 * MissionDetail Component
 * 
 * Features:
 * - Displays full mission information (2.1)
 * - Shows all blueprints in reward pool (2.2)
 * - Displays probability for each blueprint (2.3)
 * - Shows total number of blueprints in pool (2.4)
 * - Displays selection mechanism (2.5)
 * - Groups blueprints by reward pool (2.6)
 * - Shows blueprint rarity/tier (2.6)
 * - Displays prerequisite missions (47.4)
 * - Shows mission chain information (47.1-47.10)
 * - Displays credit and reputation rewards (24.1-24.6)
 * - Shows community ratings
 * - Responsive layout
 */
export function MissionDetail() {
  const { mission_id: missionId } = useParams<{ mission_id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  // Fetch mission detail
  const { data, isLoading, error } = useGetMissionDetailQuery({
    missionId: missionId!,
  })

  if (isLoading) {
    return (
      <StandardPageLayout
        title={t("missions.detail.title", "Mission Detail")}
        headerTitle={t("missions.detail.header", "Mission Detail")}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        </Grid>
      </StandardPageLayout>
    )
  }

  if (error || !data) {
    return (
      <StandardPageLayout
        title={t("missions.detail.title", "Mission Detail")}
        headerTitle={t("missions.detail.header", "Mission Detail")}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid size={{ xs: 12 }}>
          <Alert severity="error">
            {t("missions.detail.error", "Failed to load mission details. Please try again.")}
          </Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  const { mission, blueprint_rewards, prerequisite_missions, user_completed, user_rating } = data

  return (
    <StandardPageLayout
      title={t("missions.detail.titleWithName", "{{name}} - Mission Detail", { name: mission.mission_name })}
      headerTitle={mission.mission_name}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid size={{ xs: 12 }}>
      {/* Mission Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>

          {/* Mission Badges */}
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, gap: 0.5 }}>
            {mission.category && (
              <Chip label={mission.category} size="small" color="primary" />
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
            {mission.is_chain_mission && (
              <Chip label="Chain Mission" size="small" color="secondary" variant="outlined" />
            )}
            {mission.is_unique_mission && (
              <Chip label="Unique Mission" size="small" color="warning" />
            )}
            {user_completed && (
              <Chip label="✓ Completed" size="small" color="success" />
            )}
          </Stack>

          {/* Mission Description */}
          {mission.mission_description && (
            <Typography variant="body1" paragraph>
              {mission.mission_description}
            </Typography>
          )}

          {/* Mission Metadata Grid */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {/* Location */}
            {(mission.star_system || mission.planet_moon || mission.location_detail) && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body2">
                  {[mission.star_system, mission.planet_moon, mission.location_detail]
                    .filter(Boolean)
                    .join(" • ")}
                </Typography>
              </Grid>
            )}

            {/* Mission Giver */}
            {(mission.mission_giver_org || mission.faction) && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mission Giver
                </Typography>
                <Typography variant="body2">
                  {mission.mission_giver_org || mission.faction}
                </Typography>
              </Grid>
            )}

            {/* Mission Type */}
            {mission.mission_type && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mission Type
                </Typography>
                <Typography variant="body2">
                  {mission.mission_type
                    .replace(/^missiontype[._]/i, "")
                    .replace(/[._]/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </Typography>
              </Grid>
            )}

            {/* Availability */}
            {mission.availability_type && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Availability
                </Typography>
                <Typography variant="body2">{mission.availability_type}</Typography>
              </Grid>
            )}

            {/* Associated Event */}
            {mission.associated_event && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Event
                </Typography>
                <Typography variant="body2">{mission.associated_event}</Typography>
              </Grid>
            )}

          </Grid>
        </CardContent>
      </Card>

      {/* Rewards Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Rewards
          </Typography>

          <Grid container spacing={2}>
            {/* Credit Rewards */}
            {(mission.credit_reward_min || mission.credit_reward_max) && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper sx={{ p: 2, bgcolor: "success.dark" }}>
                  <Typography variant="subtitle2" color="success.contrastText">
                    Credits
                  </Typography>
                  <Typography variant="h6" color="success.contrastText">
                    {mission.credit_reward_min === mission.credit_reward_max
                      ? `${mission.credit_reward_min?.toLocaleString()} aUEC`
                      : `${mission.credit_reward_min?.toLocaleString()} - ${mission.credit_reward_max?.toLocaleString()} aUEC`}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Reputation Rewards */}
            {mission.reputation_reward && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper sx={{ p: 2, bgcolor: "info.dark" }}>
                  <Typography variant="subtitle2" color="info.contrastText">
                    Reputation
                  </Typography>
                  <Typography variant="h6" color="info.contrastText">
                    +{mission.reputation_reward}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Estimated UEC/Hour */}
            {mission.estimated_uec_per_hour && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper sx={{ p: 2, bgcolor: "primary.dark" }}>
                  <Typography variant="subtitle2" color="primary.contrastText">
                    Est. UEC/Hour
                  </Typography>
                  <Typography variant="h6" color="primary.contrastText">
                    {mission.estimated_uec_per_hour.toLocaleString()} aUEC
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Estimated Rep/Hour */}
            {mission.estimated_rep_per_hour && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper sx={{ p: 2, bgcolor: "secondary.dark" }}>
                  <Typography variant="subtitle2" color="secondary.contrastText">
                    Est. Rep/Hour
                  </Typography>
                  <Typography variant="h6" color="secondary.contrastText">
                    +{mission.estimated_rep_per_hour}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Blueprint Rewards Section (Requirement 2.1-2.6, 24.1-24.6) */}
      {blueprint_rewards && blueprint_rewards.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Blueprint Rewards
            </Typography>

            {blueprint_rewards.map((pool) => (
              <Box key={pool.reward_pool_id} sx={{ mb: 3 }}>
                {/* Reward Pool Header (Requirement 2.4, 2.5) */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Reward Pool {pool.reward_pool_id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pool.selection_count} of {pool.reward_pool_size} blueprint
                    {pool.reward_pool_size !== 1 ? "s" : ""} selected
                    {pool.blueprints[0]?.is_guaranteed
                      ? " (Guaranteed)"
                      : ` (${(100 / pool.reward_pool_size).toFixed(1)}% chance each)`}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Blueprint List (Requirement 2.2, 2.3, 2.6) */}
                <Grid container spacing={2}>
                  {pool.blueprints.map((blueprint) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={blueprint.blueprint_id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: "pointer",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: 2,
                          },
                        }}
                        onClick={() => navigate(`/blueprints/${blueprint.blueprint_id}`)}
                      >
                        <CardContent>
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            {/* Blueprint Icon */}
                            {blueprint.output_item_icon && (
                              <Box
                                component="img"
                                src={blueprint.output_item_icon}
                                alt={blueprint.blueprint_name}
                                sx={{
                                  width: 48,
                                  height: 48,
                                  objectFit: "contain",
                                  borderRadius: 1,
                                }}
                              />
                            )}

                            {/* Blueprint Info */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="subtitle2"
                                gutterBottom
                                sx={{ wordBreak: "break-word" }}
                              >
                                {blueprint.blueprint_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {blueprint.output_item_name}
                              </Typography>

                              {/* Rarity and Tier Badges (Requirement 2.6) */}
                              <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                                {blueprint.rarity && <RarityBadge rarity={blueprint.rarity} />}
                                {blueprint.tier && (
                                  <Chip label={`Tier ${blueprint.tier}`} size="small" />
                                )}
                                {blueprint.user_owns && (
                                  <Chip label="Owned" size="small" color="success" />
                                )}
                              </Stack>

                              {/* Drop Probability (Requirement 2.3) */}
                              <Typography
                                variant="body2"
                                color={blueprint.is_guaranteed ? "success.main" : "primary"}
                                sx={{ mt: 1 }}
                              >
                                {blueprint.is_guaranteed
                                  ? "100% Guaranteed"
                                  : `${blueprint.drop_probability.toFixed(1)}% chance`}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Prerequisite Missions Section (Requirement 47.4) */}
      {prerequisite_missions && prerequisite_missions.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Prerequisite Missions
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Complete these missions before attempting this one
            </Typography>

            <Stack spacing={2}>
              {prerequisite_missions.map((prereq) => (
                <Card
                  key={prereq.mission_id}
                  variant="outlined"
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateX(4px)",
                    },
                  }}
                  onClick={() => navigate(`/missions/${prereq.mission_id}`)}
                >
                  <CardContent>
                    <Typography variant="subtitle1">{prereq.mission_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[prereq.category, prereq.star_system, prereq.faction]
                        .filter(Boolean)
                        .join(" • ")}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Mission Chain Information (Requirement 47.1-47.10) */}
      {(mission.is_chain_starter || mission.is_chain_mission) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Mission Chain Information
            </Typography>

            {mission.is_chain_starter && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This is a chain starter mission. Completing it will unlock additional missions in
                the chain.
              </Alert>
            )}

            {mission.is_chain_mission && !mission.is_chain_starter && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This mission is part of a mission chain. Check prerequisite missions above.
              </Alert>
            )}

            {mission.is_unique_mission && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                This is a unique mission that can only be completed once per character.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Requirements Section */}
      {(mission.required_rank || mission.required_reputation) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Requirements
            </Typography>

            <Grid container spacing={2}>
              {mission.required_rank && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Required Rank
                  </Typography>
                  <Typography variant="body1">{mission.required_rank}</Typography>
                </Grid>
              )}

              {mission.required_reputation && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Required Reputation
                  </Typography>
                  <Typography variant="body1">{mission.required_reputation}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Community Ratings Section */}
      {(mission.community_difficulty_avg || mission.community_satisfaction_avg) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Community Ratings
            </Typography>

            <Grid container spacing={2}>
              {mission.community_difficulty_avg && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Difficulty
                  </Typography>
                  <Typography variant="h6">
                    ⭐ {mission.community_difficulty_avg.toFixed(1)} / 5.0
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mission.community_difficulty_count} rating
                    {mission.community_difficulty_count !== 1 ? "s" : ""}
                  </Typography>
                </Grid>
              )}

              {mission.community_satisfaction_avg && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Satisfaction
                  </Typography>
                  <Typography variant="h6">
                    ⭐ {mission.community_satisfaction_avg.toFixed(1)} / 5.0
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mission.community_satisfaction_count} rating
                    {mission.community_satisfaction_count !== 1 ? "s" : ""}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {user_rating && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Your Rating
                </Typography>
                <Typography variant="body2">
                  Difficulty: {user_rating.difficulty_rating}/5 • Satisfaction:{" "}
                  {user_rating.satisfaction_rating}/5
                </Typography>
                {user_rating.rating_comment && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                    "{user_rating.rating_comment}"
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      </Grid>
    </StandardPageLayout>
  )
}
