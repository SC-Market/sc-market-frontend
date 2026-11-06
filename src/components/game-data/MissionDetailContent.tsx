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
  CheckCircleOutlineRounded,
  HighlightOffRounded,
  TimerRounded,
  BuildRounded,
} from "@mui/icons-material"
import type {
  MissionDetailResponse,
  Mission,
} from "../../features/game-data/api/gameDataApi"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import { getMissionTypeLabel, formatCredits } from "../../util/missionDisplay"
import { getMissionIcon } from "../../util/gameIcons"
import { MissionName, MissionDescription } from "./MissionName"
import { MissionRankCalculator } from "./MissionRankCalculator"
import { MissionTypeDetails } from "./MissionTypeDetails"
import { GAME_DATA_PATHS, WIKI_PATHS } from "../../routes/paths"
import { missionGiver, usableGiver } from "../../seo/missionText"
import { missionHubText } from "../../seo/missionHubs"

import { useFormatters } from "../../util/format"
import { common } from "@mui/material/colors"

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

/** Raw scope codes -> catalog keys under gameTaxonomyUi.missionScopes */
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
// Header Chips — shared between modal and page
// ============================================================================

export function MissionHeaderChips({ mission: m }: { mission: Mission }) {
  const { t } = useTranslation()
  // Real links (crawlable), to the mission list filtered by the chip.
  const go = (params: Record<string, string>) => ({
    clickable: true,
    component: RouterLink,
    to: `${GAME_DATA_PATHS.missions}?${new URLSearchParams(params).toString()}`,
  })
  const giver = missionGiver(m)

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {m.star_system && (
        <Chip
          label={m.star_system}
          size="small"
          variant="outlined"
          {...go({ system: m.star_system! })}
        />
      )}
      {m.category && (
        <Chip
          label={getMissionTypeLabel(m.category, t)}
          size="small"
          {...go({ category: m.category })}
          icon={
            getMissionIcon(m.category) ? (
              <img
                src={getMissionIcon(m.category)!}
                alt=""
                style={{ width: 16, height: 16 }}
              />
            ) : undefined
          }
        />
      )}
      {giver && (
        <Chip
          label={giver}
          size="small"
          variant="outlined"
          {...go({ giver })}
        />
      )}
      {(m.is_illegal || m.legal_status === "ILLEGAL") && (
        <Chip
          label={t("missionsUi.illegal")}
          size="small"
          color="error"
          {...go({ legal: "ILLEGAL" })}
        />
      )}
      {m.is_unique_mission && (
        <Chip label={t("missionsUi.unique")} size="small" color="warning" />
      )}
      {m.is_chain_starter && (
        <Chip
          label={t("missionsUi.starter")}
          size="small"
          variant="outlined"
          {...go({ chain: "true" })}
        />
      )}
      {m.is_chain_mission && !m.is_chain_starter && (
        <Chip label={t("missionsUi.chain")} size="small" variant="outlined" />
      )}
      {m.is_shareable && (
        <Chip
          label={t("missionsUi.shareable")}
          size="small"
          variant="outlined"
          {...go({ shareable: "true" })}
        />
      )}
      {m.associated_event && (
        <Chip
          label={m.associated_event}
          size="small"
          {...go({ show_events: "true", event: m.associated_event! })}
          sx={{ bgcolor: "info.main", color: common.white }}
        />
      )}
      {m.difficulty_level && (
        <Chip
          label={`D${m.difficulty_level}`}
          size="small"
          color="warning"
          variant="outlined"
        />
      )}
    </Stack>
  )
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
// Tabbed Content — renders all tabs with state management
// ============================================================================

export function MissionDetailTabs({
  data,
  onBlueprintClick,
}: {
  data: MissionDetailResponse
  onBlueprintClick?: (id: string) => void
}) {
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)
  const m = data.mission
  const hasChain = !!(
    m.is_chain_starter ||
    m.is_chain_mission ||
    data.prerequisite_missions?.length
  )

  const hasDetails = !!(
    data.ship_encounters?.length ||
    data.npc_encounters?.length ||
    data.entity_spawns?.length ||
    data.hauling_orders?.length
  )

  const tabs: { label: string; id: string }[] = [
    { label: t("gameTaxonomyUi.missionTabs.overview"), id: "overview" },
  ]
  if (hasDetails)
    tabs.push({ label: t("gameTaxonomyUi.missionTabs.details"), id: "details" })
  tabs.push({
    label: t("gameTaxonomyUi.missionTabs.requirements"),
    id: "requirements",
  })
  if (m.reward_scope)
    tabs.push({
      label: t("gameTaxonomyUi.missionTabs.rankCalculator"),
      id: "calculator",
    })
  if (hasChain)
    tabs.push({ label: t("gameTaxonomyUi.missionTabs.chainInfo"), id: "chain" })

  const activeTab = tabs[tab]?.id || "overview"

  return (
    <>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
        {tabs.map((tb) => (
          <Tab key={tb.id} label={tb.label} />
        ))}
      </Tabs>
      {/* Every panel is in the page (the inactive ones hidden), so the HTML
          has the whole mission: rewards, requirements, cooldowns, chain. */}
      <Box sx={{ pt: 2 }}>
        <Box hidden={activeTab !== "overview"}>
          <OverviewTab data={data} onBlueprintClick={onBlueprintClick} />
        </Box>
        {hasDetails && (
          <Box hidden={activeTab !== "details"}>
            <MissionTypeDetails data={data} />
          </Box>
        )}
        <Box hidden={activeTab !== "requirements"}>
          <RequirementsTab data={data} />
        </Box>
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
        {hasChain && (
          <Box hidden={activeTab !== "chain"}>
            <ChainTab data={data} />
          </Box>
        )}
      </Box>
    </>
  )
}

// ============================================================================
// Overview Tab
// ============================================================================

function OverviewTab({
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
        <>
          <Divider />
          <Typography variant="subtitle2">
            {t("missionsUi.blueprintRewards")}
          </Typography>
          {data.blueprint_rewards.map((pool, poolIdx) => {
            const poolChance =
              pool.pool_chance != null ? pool.pool_chance * 100 : null
            const bpCount =
              pool.blueprints?.length || pool.reward_pool_size || 0
            return (
              <Box key={poolIdx} sx={{ mb: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 0.5 }}
                >
                  {pool.pool_name && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                    >
                      {pool.pool_name}
                    </Typography>
                  )}
                  <Box sx={{ flex: 1 }} />
                  {poolChance != null && (
                    <Chip
                      label={t("missionsUi.percentChance", { pct: poolChance })}
                      size="small"
                      color={poolChance >= 100 ? "success" : "default"}
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  )}
                  {pool.selection_count > 0 && bpCount > 0 && (
                    <Chip
                      label={t("missionsUi.nOfM", {
                        n: pool.selection_count,
                        m: bpCount,
                      })}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  )}
                </Stack>
                <Table size="small" sx={{ "& td, & th": { py: 0.5, px: 1 } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("missionsUi.blueprint")}</TableCell>
                      <TableCell align="right">
                        {t("missionsUi.dropChance")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(pool.blueprints || []).map((bp) => {
                      const pct =
                        bp.drop_probability >= 1
                          ? bp.drop_probability
                          : bp.drop_probability * 100
                      const blueprintPath = GAME_DATA_PATHS.blueprint(
                        encodeURIComponent(
                          bp.blueprint_name || bp.blueprint_id,
                        ),
                      )
                      return (
                        <TableRow
                          key={bp.blueprint_id}
                          hover
                          sx={{
                            cursor: onBlueprintClick ? "pointer" : undefined,
                          }}
                          onClick={() =>
                            onBlueprintClick?.(
                              bp.blueprint_name ||
                                bp.blueprint_code ||
                                bp.blueprint_id,
                            )
                          }
                        >
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                            >
                              {/* Real links for crawlers. The icon is the blueprint (a click opens it
                                  in place); the name is the crafted item's page when the API resolved
                                  it, else the blueprint too. */}
                              <Box
                                component={RouterLink}
                                to={blueprintPath}
                                aria-label={t(
                                  "itemAcquisition.viewBlueprint",
                                  "View blueprint",
                                )}
                                title={t(
                                  "itemAcquisition.viewBlueprint",
                                  "View blueprint",
                                )}
                                onClick={(e: React.MouseEvent) => {
                                  if (onBlueprintClick) e.preventDefault()
                                }}
                                sx={{
                                  display: "inline-flex",
                                  color: "success.main",
                                }}
                              >
                                <BuildRounded sx={{ fontSize: 14 }} />
                              </Box>
                              {bp.output_game_item_slug ? (
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  component={RouterLink}
                                  to={WIKI_PATHS.item(bp.output_game_item_slug)}
                                  onClick={(e: React.MouseEvent) =>
                                    e.stopPropagation()
                                  }
                                  sx={{
                                    color: "inherit",
                                    textDecoration: "none",
                                    "&:hover": { textDecoration: "underline" },
                                  }}
                                >
                                  {bp.output_item_name || bp.blueprint_name}
                                </Typography>
                              ) : (
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  component={RouterLink}
                                  to={blueprintPath}
                                  onClick={(e: React.MouseEvent) => {
                                    if (onBlueprintClick) e.preventDefault()
                                  }}
                                  sx={{
                                    color: "inherit",
                                    textDecoration: "none",
                                  }}
                                >
                                  {bp.output_item_name || bp.blueprint_name}
                                </Typography>
                              )}
                              {bp.user_owns && (
                                <CheckCircleOutlineRounded
                                  sx={{ fontSize: 14, color: "success.main" }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              justifyContent="flex-end"
                            >
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(pct, 100)}
                                sx={{ width: 50, height: 4, borderRadius: 2 }}
                              />
                              <Typography variant="caption">
                                {pct >= 100
                                  ? t("missionsUi.guaranteed")
                                  : `${pct.toFixed(0)}%`}
                              </Typography>
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

// ============================================================================
// Requirements Tab
// ============================================================================

function RequirementsTab({ data }: { data: MissionDetailResponse }) {
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

function ChainTab({ data }: { data: MissionDetailResponse }) {
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
                  <Chip
                    label={getMissionTypeLabel(pm.category, t)}
                    size="small"
                    variant="outlined"
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
