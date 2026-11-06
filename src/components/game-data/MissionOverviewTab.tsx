import { Box, Chip, Divider, Stack, Typography } from "@mui/material"
import type { MissionDetailResponse } from "../../features/game-data/api/gameDataApi"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import { formatCredits } from "../../util/missionDisplay"
import { MissionDescription } from "./MissionName"
import { GAME_DATA_PATHS, WIKI_PATHS } from "../../routes/paths"
import { missionGiver, usableGiver } from "../../seo/missionText"
import { missionHubText } from "../../seo/missionHubs"
import { useFormatters } from "../../util/format"

/** Raw scope codes -> catalog keys under gameTaxonomyUi.missionScopes */
import { MissionBlueprintRewards } from "./MissionBlueprintRewards"

const SCOPE_LABEL_KEYS: Record<string, string> = {
  factionreputationscope: "factionReputation",
  factionreputation: "factionReputation",
  headhunter: "headhunter",
  salvage: "salvage",
  mercenary: "mercenary",
  bounty: "bounty",
  mining: "mining",
  hauling: "hauling",
  delivery: "delivery",
  investigation: "investigation",
}

function formatScope(scope: string, t: TFunction): string {
  const key = SCOPE_LABEL_KEYS[scope.toLowerCase()]
  if (key) return t(`gameTaxonomyUi.missionScopes.${key}`)
  return scope
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (s) => s.toUpperCase())
}

// ============================================================================
// Mission hubs — the mission's giver, faction, type and star system pages
// ============================================================================

const HUB_LINKS = [
  ["giver", "givers"],
  ["faction", "factions"],
  ["type", "types"],
  ["system", "systems"],
] as const

/** Links to the hubs the mission is in (the API's `hubs`; LIVE missions only). */
export function MissionHubLinks({ data }: { data: MissionDetailResponse }) {
  const { t } = useTranslation()
  const hubs = data.hubs
  const links = HUB_LINKS.flatMap(([field, kind]) => {
    const hub = hubs?.[field]
    return hub ? [{ kind, hub }] : []
  })
  if (links.length === 0) return null
  return (
    <Box component="nav" aria-labelledby="mission-hub-links">
      <Typography id="mission-hub-links" variant="subtitle2" sx={{ mb: 1 }}>
        {t("missionHubs.detailTitle", "Browse similar missions")}
      </Typography>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {links.map(({ kind, hub }) => (
          <Chip
            key={kind}
            label={`${missionHubText({ kind, name: hub.name, mission_count: hub.mission_count }, t).heading} (${hub.mission_count})`}
            component={RouterLink}
            to={GAME_DATA_PATHS.missionHub(kind, hub.slug)}
            clickable
            size="small"
            variant="outlined"
          />
        ))}
      </Stack>
    </Box>
  )
}

// ============================================================================
// Overview Tab
// ============================================================================

export function OverviewTab({
  data,
  onBlueprintClick,
}: {
  data: MissionDetailResponse
  onBlueprintClick?: (id: string) => void
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const m = data.mission

  return (
    <Stack spacing={2}>
      {m.mission_description && (
        <MissionDescription
          text={m.mission_description}
          giver={missionGiver(m)}
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: "pre-line" }}
        />
      )}

      <Divider />

      {/* Reward */}
      <Typography variant="subtitle2">{t("missionsUi.reward")}</Typography>
      <Stack spacing={0.5}>
        {(m.credit_reward_min || m.credit_reward_max) &&
          (() => {
            const isFee = (m.credit_reward_min ?? 0) < 0
            return (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  {isFee ? t("missionsUi.feeLabel") : "UEC"}
                </Typography>
                <Typography
                  variant="body2"
                  color={isFee ? "error.main" : "success.main"}
                  fontWeight={600}
                >
                  {isFee
                    ? formatCredits(Math.abs(m.credit_reward_min!), fmt.locale)
                    : m.credit_reward_min === m.credit_reward_max ||
                        !m.credit_reward_max
                      ? formatCredits(m.credit_reward_min, fmt.locale)
                      : `${formatCredits(m.credit_reward_min, fmt.locale)} – ${formatCredits(m.credit_reward_max, fmt.locale)}`}
                </Typography>
              </Stack>
            )
          })()}
        {m.reputation_reward != null && m.reputation_reward > 0 && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {t("missionsUi.repPerMission")}
            </Typography>
            <Typography variant="body2">
              {fmt.number(m.reputation_reward)} XP
            </Typography>
          </Stack>
        )}
        {usableGiver(m.mission_giver_org) && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {t("missionsUi.missionGiverLower")}
            </Typography>
            <Typography variant="body2">{m.mission_giver_org}</Typography>
          </Stack>
        )}
        {usableGiver(m.faction) && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {t("missionsUi.faction")}
            </Typography>
            <Typography variant="body2">{m.faction}</Typography>
          </Stack>
        )}
        {usableGiver(m.reputation_reward_faction) &&
          m.reputation_reward_faction !== m.faction && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {t("missionsUi.reputationWith")}
              </Typography>
              <Typography variant="body2">
                {m.reputation_reward_faction}
              </Typography>
            </Stack>
          )}
        {m.reward_scope && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {t("missionsUi.scope")}
            </Typography>
            <Typography variant="body2">
              {formatScope(m.reward_scope, t)}
            </Typography>
          </Stack>
        )}
      </Stack>

      <MissionHubLinks data={data} />

      {/* Blueprint rewards — table format */}
      {data.blueprint_rewards?.length > 0 && (
        <MissionBlueprintRewards
          data={data}
          onBlueprintClick={onBlueprintClick}
        />
      )}

      {/* Hauling Orders */}
      {(data.hauling_orders?.length ?? 0) > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">
            {t("missionsUi.haulingOrders")}
          </Typography>
          <Stack spacing={0.25}>
            {data.hauling_orders!.map((h, i) => (
              <Stack key={i} direction="row" justifyContent="space-between">
                <Typography variant="body2">{h.resource_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {h.min_scu === h.max_scu
                    ? `${h.min_scu} SCU`
                    : `${h.min_scu}–${h.max_scu} SCU`}
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
          <Typography variant="subtitle2">
            {t("missionsUi.itemRewards")}
          </Typography>
          <Stack spacing={0.25}>
            {m.item_rewards!.map((item, i) =>
              item.game_item_slug ? (
                <Typography
                  key={i}
                  variant="body2"
                  component={RouterLink}
                  to={WIKI_PATHS.item(item.game_item_slug)}
                  sx={{
                    color: "primary.main",
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {item.name}
                </Typography>
              ) : (
                <Typography key={i} variant="body2">
                  {item.name}
                </Typography>
              ),
            )}
          </Stack>
        </>
      )}

      {/* Location */}
      {(m.star_system || m.planet_moon) && (
        <>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {t("missionsUi.location")}
            </Typography>
            <Typography variant="body2">
              {[m.star_system, m.planet_moon, m.location_detail]
                .filter(Boolean)
                .join(" → ")}
            </Typography>
          </Stack>
        </>
      )}

      {/* Community ratings */}
      {(m.community_difficulty_avg || m.community_satisfaction_avg) && (
        <>
          <Divider />
          <Typography variant="subtitle2">
            {t("missionsUi.communityRatings")}
          </Typography>
          {m.community_difficulty_avg != null && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {t("missionsUi.difficulty")}
              </Typography>
              <Typography variant="body2">
                {t("missionsUi.ratingOutOf5", {
                  avg: m.community_difficulty_avg.toFixed(1),
                  count: m.community_difficulty_count,
                })}
              </Typography>
            </Stack>
          )}
          {m.community_satisfaction_avg != null && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {t("missionsUi.satisfaction")}
              </Typography>
              <Typography variant="body2">
                {t("missionsUi.ratingOutOf5", {
                  avg: m.community_satisfaction_avg.toFixed(1),
                  count: m.community_satisfaction_count,
                })}
              </Typography>
            </Stack>
          )}
        </>
      )}
    </Stack>
  )
}
