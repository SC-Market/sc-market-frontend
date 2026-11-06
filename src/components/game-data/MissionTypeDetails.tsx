/**
 * MissionTypeDetails — bespoke per-type rendering for mission detail modal.
 *
 * Each mission type gets a focused component showing the most relevant data.
 * Add new types by adding a case to TYPE_RENDERERS and a component below (or
 * in MissionTypeDetailsNonCombat.tsx; shared sections: MissionEncounterSections.tsx).
 *
 * Architecture:
 *   MissionTypeDetails (dispatcher)
 *     ├── MercenaryDetails     — ship encounters, NPC squads, BP rewards
 *     ├── BountyHunterDetails  — ship encounters, ship pools, BP rewards
 *     ├── SalvageDetails       — entity spawns, ship encounters, hauling, buy-in
 *     ├── DeliveryDetails      — hauling orders, pickup/delivery counts, destinations
 *     ├── HaulingDetails       — hauling orders, cargo details
 *     ├── MiningDetails        — hauling orders (ore), BP rewards
 *     ├── MaintenanceDetails   — entity spawns (relay/pipe targets)
 *     ├── InvestigationDetails — accept locations, ship encounters
 *     ├── RaceDetails          — buy-in fee, route info
 *     └── GenericDetails       — fallback for unknown types
 */

import React from "react"
import { useTranslation } from "react-i18next"
import { Paper, Stack, Typography } from "@mui/material"
import {
  LocalShippingRounded,
  RecyclingRounded,
  BuildRounded,
} from "@mui/icons-material"
import type { MissionDetailResponse } from "../../features/game-data/api/gameDataApi"

import { useFormatters } from "../../util/format"
import {
  ShipEncountersSection,
  NpcEncountersSection,
  HaulingOrdersSection,
  EntitySpawnsSection,
  SummaryChips,
  shipChips,
} from "./MissionEncounterSections"
import {
  DeliveryDetails,
  HaulingDetails,
  MiningDetails,
  MaintenanceDetails,
  InvestigationDetails,
  RaceDetails,
} from "./MissionTypeDetailsNonCombat"
// ============================================================================
// Dispatcher
// ============================================================================

/** Normalize category string to a renderer key */
function normalizeCategory(category?: string): string {
  if (!category) return "generic"
  const c = category.toLowerCase().replace(/^missiontype\./, "")
  if (c.includes("bounty")) return "bountyhunter"
  if (c.includes("mercenary")) return "mercenary"
  if (c.includes("salvage")) return "salvage"
  if (c.includes("delivery") || c.includes("courier")) return "delivery"
  if (c.includes("hauling")) return "hauling"
  if (c.includes("mining")) return "mining"
  if (c.includes("maintenance")) return "maintenance"
  if (c.includes("investigation") || c.includes("search"))
    return "investigation"
  if (c.includes("race")) return "race"
  return "generic"
}

const TYPE_RENDERERS: Record<
  string,
  React.FC<{ data: MissionDetailResponse }>
> = {
  mercenary: MercenaryDetails,
  bountyhunter: BountyHunterDetails,
  salvage: SalvageDetails,
  delivery: DeliveryDetails,
  hauling: HaulingDetails,
  mining: MiningDetails,
  maintenance: MaintenanceDetails,
  investigation: InvestigationDetails,
  race: RaceDetails,
  generic: GenericDetails,
}

export function MissionTypeDetails({ data }: { data: MissionDetailResponse }) {
  const key = normalizeCategory(data.mission.category)
  const Renderer = TYPE_RENDERERS[key] || GenericDetails
  return <Renderer data={data} />
}

// ============================================================================
// Per-type renderers
// ============================================================================

/** Mercenary — ship encounters, NPC squads, BP rewards */
function MercenaryDetails({ data }: { data: MissionDetailResponse }) {
  const { t } = useTranslation()
  const npcCount = (data.npc_encounters || []).reduce((s, n) => s + n.count, 0)
  const entityCount = (data.entity_spawns || []).reduce(
    (s, e) => s + e.count,
    0,
  )
  const poolCount = (data.ship_encounters || []).flatMap(
    (e) => e.ship_pool || [],
  ).length
  const chips = [
    ...shipChips(data, t),
    ...(npcCount > 0
      ? [
          {
            label: t("missionToolsUi.npcCount", { count: npcCount }),
            color: "warning" as const,
          },
        ]
      : []),
    ...(entityCount > 0
      ? [
          {
            label: t("missionToolsUi.targetCount", { count: entityCount }),
            color: "default" as const,
          },
        ]
      : []),
    ...(poolCount > 0
      ? [
          {
            label: t("missionToolsUi.shipTypeCount", {
              count: new Set(
                (data.ship_encounters || []).flatMap((e) => e.ship_pool || []),
              ).size,
            }),
            color: "info" as const,
          },
        ]
      : []),
    ...(data.blueprint_rewards?.length
      ? [
          {
            label: t("missionToolsUi.bpCount", {
              count: data.blueprint_rewards.reduce(
                (s, p) => s + p.blueprints.length,
                0,
              ),
            }),
            color: "success" as const,
            icon: <BuildRounded sx={{ fontSize: 14 }} />,
          },
        ]
      : []),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      <ShipEncountersSection encounters={data.ship_encounters || []} />
      <NpcEncountersSection encounters={data.npc_encounters || []} />
      <EntitySpawnsSection spawns={data.entity_spawns || []} />
      {!(
        data.ship_encounters?.length ||
        data.npc_encounters?.length ||
        data.entity_spawns?.length
      ) && (
        <Typography variant="body2" color="text.secondary">
          {t("missionToolsUi.noCombatData")}
        </Typography>
      )}
    </Stack>
  )
}

/** Bounty Hunter — ship encounters with pools, NPC squads */
function BountyHunterDetails({ data }: { data: MissionDetailResponse }) {
  const { t } = useTranslation()
  const poolSize = new Set(
    (data.ship_encounters || []).flatMap((e) => e.ship_pool || []),
  ).size
  const chips = [
    ...shipChips(data, t),
    ...(poolSize > 0
      ? [
          {
            label: t("missionToolsUi.shipTypeCount", { count: poolSize }),
            color: "info" as const,
          },
        ]
      : []),
    ...(data.blueprint_rewards?.length
      ? [
          {
            label: t("missionToolsUi.bpCount", {
              count: data.blueprint_rewards.reduce(
                (s, p) => s + p.blueprints.length,
                0,
              ),
            }),
            color: "success" as const,
            icon: <BuildRounded sx={{ fontSize: 14 }} />,
          },
        ]
      : []),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      <ShipEncountersSection encounters={data.ship_encounters || []} />
      <NpcEncountersSection encounters={data.npc_encounters || []} />
      {!data.ship_encounters?.length && !data.npc_encounters?.length && (
        <Typography variant="body2" color="text.secondary">
          {t("missionToolsUi.noEncounterData")}
        </Typography>
      )}
    </Stack>
  )
}

/** Salvage — entity spawns (wrecks), ship encounters, hauling orders */
function SalvageDetails({ data }: { data: MissionDetailResponse }) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const m = data.mission
  const isFee = (m.credit_reward_min ?? 0) < 0
  const hauling = data.hauling_orders || []
  const totalScu = hauling.reduce((s, h) => s + h.max_scu, 0)
  const entityCount = (data.entity_spawns || []).reduce(
    (s, e) => s + e.count,
    0,
  )
  const chips = [
    ...(isFee
      ? [
          {
            label: t("missionsUi.fee", {
              amount: `${fmt.number(Math.abs(m.credit_reward_min!))} aUEC`,
            }),
            color: "warning" as const,
          },
        ]
      : []),
    ...(totalScu > 0
      ? [
          {
            label: `${totalScu} SCU`,
            color: "info" as const,
            icon: <LocalShippingRounded sx={{ fontSize: 14 }} />,
          },
        ]
      : []),
    ...(entityCount > 0
      ? [
          {
            label: t("missionToolsUi.wreckCount", { count: entityCount }),
            color: "default" as const,
            icon: <RecyclingRounded sx={{ fontSize: 14 }} />,
          },
        ]
      : []),
    ...shipChips(data, t),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      {isFee && (
        <Paper variant="outlined" sx={{ p: 1.5, borderColor: "warning.main" }}>
          <Typography variant="subtitle2" color="warning.main">
            {t("missionToolsUi.buyInRequired")}
          </Typography>
          <Typography variant="body2">
            {t("missionsUi.fee", {
              amount: `${fmt.number(Math.abs(m.credit_reward_min!))} aUEC`,
            })}
          </Typography>
        </Paper>
      )}
      <HaulingOrdersSection orders={data.hauling_orders || []} />
      <EntitySpawnsSection spawns={data.entity_spawns || []} />
      <ShipEncountersSection encounters={data.ship_encounters || []} />
    </Stack>
  )
}

/** Generic fallback — shows whatever data exists */
function GenericDetails({ data }: { data: MissionDetailResponse }) {
  const { t } = useTranslation()
  const hasAnything =
    data.ship_encounters?.length ||
    data.npc_encounters?.length ||
    data.hauling_orders?.length ||
    data.entity_spawns?.length
  return (
    <Stack spacing={1.5}>
      <ShipEncountersSection encounters={data.ship_encounters || []} />
      <NpcEncountersSection encounters={data.npc_encounters || []} />
      <HaulingOrdersSection orders={data.hauling_orders || []} />
      <EntitySpawnsSection spawns={data.entity_spawns || []} />
      {!hasAnything && (
        <Typography variant="body2" color="text.secondary">
          {t("missionToolsUi.noTypeData")}
        </Typography>
      )}
    </Stack>
  )
}
