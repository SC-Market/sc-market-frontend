/**
 * MissionTypeDetails — bespoke per-type rendering for mission detail modal.
 *
 * Each mission type gets a focused component showing the most relevant data.
 * Add new types by adding a case to TYPE_RENDERERS and a component below.
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
import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import {
  RocketLaunchRounded,
  ShieldRounded,
  LocalShippingRounded,
  RecyclingRounded,
  BuildRounded,
  ScienceRounded,
  SportsScoreRounded,
  HandymanRounded,
  SearchRounded,
} from "@mui/icons-material"
import type {
  MissionDetailResponse,
  ShipEncounter,
  NpcEncounter,
  HaulingOrder,
  EntitySpawn,
} from "../../store/api/v2/market"

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
  if (c.includes("investigation") || c.includes("search")) return "investigation"
  if (c.includes("race")) return "race"
  return "generic"
}

const TYPE_RENDERERS: Record<string, React.FC<{ data: MissionDetailResponse }>> = {
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
// Shared building blocks
// ============================================================================

function ShipEncountersSection({ encounters }: { encounters: ShipEncounter[] }) {
  if (!encounters.length) return null
  const hostileMin = encounters.filter(e => e.alignment === "hostile").reduce((s, e) => s + e.waves.reduce((ws, w) => ws + w.min_ships, 0), 0)
  const hostileMax = encounters.filter(e => e.alignment === "hostile").reduce((s, e) => s + e.waves.reduce((ws, w) => ws + w.max_ships, 0), 0)
  const friendlyMin = encounters.filter(e => e.alignment === "friendly").reduce((s, e) => s + e.waves.reduce((ws, w) => ws + w.min_ships, 0), 0)
  const friendlyMax = encounters.filter(e => e.alignment === "friendly").reduce((s, e) => s + e.waves.reduce((ws, w) => ws + w.max_ships, 0), 0)
  const allPool = encounters.flatMap(e => e.ship_pool || [])
  const uniquePool: string[] = [...new Set(allPool)].sort()

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
        <Typography variant="subtitle2">Ship Encounters</Typography>
        {hostileMax > 0 && <Chip icon={<RocketLaunchRounded sx={{ fontSize: 14 }} />} label={`${fmtRange(hostileMin, hostileMax)} hostile`} size="small" color="error" variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />}
        {friendlyMax > 0 && <Chip icon={<ShieldRounded sx={{ fontSize: 14 }} />} label={`${fmtRange(friendlyMin, friendlyMax)} friendly`} size="small" color="info" variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />}
      </Stack>
      <Stack spacing={0.5}>
        {encounters.map((enc, i) => (
          <Box key={i}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              {enc.alignment === "hostile"
                ? <RocketLaunchRounded sx={{ fontSize: 16, color: "error.main" }} />
                : <ShieldRounded sx={{ fontSize: 16, color: "info.main" }} />}
              <Typography variant="body2" fontWeight={600}>{enc.role}</Typography>
              <Typography variant="caption" color="text.secondary">
                {fmtRange(enc.waves.reduce((s, w) => s + w.min_ships, 0), enc.waves.reduce((s, w) => s + w.max_ships, 0))} ships
              </Typography>
            </Stack>
            {enc.waves.map((wave, wi) => (
              <Typography key={wi} variant="caption" color="text.secondary" sx={{ pl: 3.5, display: "block" }}>
                {wave.name}: {fmtRange(wave.min_ships, wave.max_ships)} ships
              </Typography>
            ))}
          </Box>
        ))}
      </Stack>
      {uniquePool.length > 0 && (
        <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="caption" fontWeight={600}>Ship Pool — {uniquePool.length} types</Typography>
          <Stack spacing={0}>
            {uniquePool.map((ship, i) => (
              <Typography key={i} variant="caption" color="text.secondary">{ship}</Typography>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  )
}

function NpcEncountersSection({ encounters }: { encounters: NpcEncounter[] }) {
  if (!encounters.length) return null
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>NPC Encounters</Typography>
      <Stack spacing={0.25}>
        {encounters.map((npc, i) => (
          <Stack key={i} direction="row" justifyContent="space-between">
            <Typography variant="body2">{npc.name}</Typography>
            <Typography variant="body2" color="text.secondary">×{npc.count}</Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  )
}

function HaulingOrdersSection({ orders }: { orders: HaulingOrder[] }) {
  if (!orders.length) return null
  const totalMin = orders.reduce((s, h) => s + h.min_scu, 0)
  const totalMax = orders.reduce((s, h) => s + h.max_scu, 0)
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        <LocalShippingRounded sx={{ fontSize: 16 }} />
        <Typography variant="subtitle2">Hauling Orders</Typography>
        <Chip label={`${fmtRange(totalMin, totalMax)} SCU`} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
      </Stack>
      <Stack spacing={0.25}>
        {orders.map((h, i) => (
          <Stack key={i} direction="row" justifyContent="space-between">
            <Typography variant="body2">{h.resource_name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {h.min_scu === h.max_scu ? `${h.min_scu} SCU` : `${h.min_scu}–${h.max_scu} SCU`}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  )
}

function EntitySpawnsSection({ spawns }: { spawns: EntitySpawn[] }) {
  if (!spawns.length) return null
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Targets</Typography>
      <Stack spacing={0.25}>
        {spawns.map((e, i) => (
          <Stack key={i} direction="row" justifyContent="space-between">
            <Typography variant="body2">{e.name}</Typography>
            <Typography variant="body2" color="text.secondary">×{e.count}</Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  )
}

function fmtRange(min: number, max: number): string {
  return min === max ? `${min}` : `${min}–${max}`
}

/** Compact summary chips for quick-glance mission info */
function SummaryChips({ chips }: { chips: { label: string; color?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"; icon?: React.ReactElement }[] }) {
  if (!chips.length) return null
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
      {chips.map((c, i) => (
        <Chip key={i} label={c.label} icon={c.icon} size="small" color={c.color || "default"} variant="outlined" sx={{ height: 22, fontSize: "0.7rem" }} />
      ))}
    </Stack>
  )
}

function shipChips(data: MissionDetailResponse): { label: string; color: "error" | "info"; icon: React.ReactElement }[] {
  const enc = data.ship_encounters || []
  const chips: { label: string; color: "error" | "info"; icon: React.ReactElement }[] = []
  const hostile = enc.filter(e => e.alignment === "hostile")
  const friendly = enc.filter(e => e.alignment === "friendly")
  if (hostile.length) {
    const min = hostile.reduce((s, e) => s + e.waves.reduce((ws, w) => ws + w.min_ships, 0), 0)
    const max = hostile.reduce((s, e) => s + e.waves.reduce((ws, w) => ws + w.max_ships, 0), 0)
    chips.push({ label: `${fmtRange(min, max)} hostile`, color: "error", icon: <RocketLaunchRounded sx={{ fontSize: 14 }} /> })
  }
  if (friendly.length) {
    const min = friendly.reduce((s, e) => s + e.waves.reduce((ws, w) => ws + w.min_ships, 0), 0)
    const max = friendly.reduce((s, e) => s + e.waves.reduce((ws, w) => ws + w.max_ships, 0), 0)
    chips.push({ label: `${fmtRange(min, max)} friendly`, color: "info", icon: <ShieldRounded sx={{ fontSize: 14 }} /> })
  }
  return chips
}

// ============================================================================
// Per-type renderers
// ============================================================================

/** Mercenary — ship encounters, NPC squads, BP rewards */
function MercenaryDetails({ data }: { data: MissionDetailResponse }) {
  const npcCount = (data.npc_encounters || []).reduce((s, n) => s + n.count, 0)
  const entityCount = (data.entity_spawns || []).reduce((s, e) => s + e.count, 0)
  const poolCount = (data.ship_encounters || []).flatMap(e => e.ship_pool || []).length
  const chips = [
    ...shipChips(data),
    ...(npcCount > 0 ? [{ label: `${npcCount} NPCs`, color: "warning" as const }] : []),
    ...(entityCount > 0 ? [{ label: `${entityCount} targets`, color: "secondary" as const }] : []),
    ...(poolCount > 0 ? [{ label: `${new Set((data.ship_encounters || []).flatMap(e => e.ship_pool || [])).size} ship types`, color: "info" as const }] : []),
    ...(data.blueprint_rewards?.length ? [{ label: `${data.blueprint_rewards.reduce((s, p) => s + p.blueprints.length, 0)} BPs`, color: "success" as const, icon: <BuildRounded sx={{ fontSize: 14 }} /> }] : []),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      <ShipEncountersSection encounters={data.ship_encounters || []} />
      <NpcEncountersSection encounters={data.npc_encounters || []} />
      <EntitySpawnsSection spawns={data.entity_spawns || []} />
      {!(data.ship_encounters?.length || data.npc_encounters?.length || data.entity_spawns?.length) && (
        <Typography variant="body2" color="text.secondary">No combat data available.</Typography>
      )}
    </Stack>
  )
}

/** Bounty Hunter — ship encounters with pools, NPC squads */
function BountyHunterDetails({ data }: { data: MissionDetailResponse }) {
  const poolSize = new Set((data.ship_encounters || []).flatMap(e => e.ship_pool || [])).size
  const chips = [
    ...shipChips(data),
    ...(poolSize > 0 ? [{ label: `${poolSize} ship types`, color: "info" as const }] : []),
    ...(data.blueprint_rewards?.length ? [{ label: `${data.blueprint_rewards.reduce((s, p) => s + p.blueprints.length, 0)} BPs`, color: "success" as const, icon: <BuildRounded sx={{ fontSize: 14 }} /> }] : []),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      <ShipEncountersSection encounters={data.ship_encounters || []} />
      <NpcEncountersSection encounters={data.npc_encounters || []} />
      {!data.ship_encounters?.length && !data.npc_encounters?.length && (
        <Typography variant="body2" color="text.secondary">No encounter data available.</Typography>
      )}
    </Stack>
  )
}

/** Salvage — entity spawns (wrecks), ship encounters, hauling orders */
function SalvageDetails({ data }: { data: MissionDetailResponse }) {
  const m = data.mission
  const isFee = (m.credit_reward_min ?? 0) < 0
  const hauling = data.hauling_orders || []
  const totalScu = hauling.reduce((s, h) => s + h.max_scu, 0)
  const entityCount = (data.entity_spawns || []).reduce((s, e) => s + e.count, 0)
  const chips = [
    ...(isFee ? [{ label: `Fee: ${Math.abs(m.credit_reward_min!).toLocaleString()} aUEC`, color: "warning" as const }] : []),
    ...(totalScu > 0 ? [{ label: `${totalScu} SCU`, color: "info" as const, icon: <LocalShippingRounded sx={{ fontSize: 14 }} /> }] : []),
    ...(entityCount > 0 ? [{ label: `${entityCount} wrecks`, color: "secondary" as const, icon: <RecyclingRounded sx={{ fontSize: 14 }} /> }] : []),
    ...shipChips(data),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      {isFee && (
        <Paper variant="outlined" sx={{ p: 1.5, borderColor: "warning.main" }}>
          <Typography variant="subtitle2" color="warning.main">Buy-in Required</Typography>
          <Typography variant="body2">Fee: {Math.abs(m.credit_reward_min!).toLocaleString()} aUEC</Typography>
        </Paper>
      )}
      <HaulingOrdersSection orders={data.hauling_orders || []} />
      <EntitySpawnsSection spawns={data.entity_spawns || []} />
      <ShipEncountersSection encounters={data.ship_encounters || []} />
    </Stack>
  )
}

/** Delivery — hauling orders, pickup/delivery info */
function DeliveryDetails({ data }: { data: MissionDetailResponse }) {
  const hauling = data.hauling_orders || []
  const totalScu = hauling.reduce((s, h) => s + h.max_scu, 0)
  const dests = data.mission.destinations || []
  const chips = [
    ...(totalScu > 0 ? [{ label: `${totalScu} SCU`, color: "info" as const, icon: <LocalShippingRounded sx={{ fontSize: 14 }} /> }] : []),
    ...(dests.length > 0 ? [{ label: `${dests.length} destinations`, color: "secondary" as const }] : []),
    ...shipChips(data),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      <HaulingOrdersSection orders={hauling} />
      {dests.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Destinations</Typography>
          <Stack spacing={0.25}>
            {dests.map((d, i) => <Typography key={i} variant="body2">{d}</Typography>)}
          </Stack>
        </Paper>
      )}
      <ShipEncountersSection encounters={data.ship_encounters || []} />
    </Stack>
  )
}

/** Hauling — cargo details, hauling orders */
function HaulingDetails({ data }: { data: MissionDetailResponse }) {
  const hauling = data.hauling_orders || []
  const totalScu = hauling.reduce((s, h) => s + h.max_scu, 0)
  const chips = [
    ...(totalScu > 0 ? [{ label: `${totalScu} SCU cargo`, color: "info" as const, icon: <LocalShippingRounded sx={{ fontSize: 14 }} /> }] : []),
    ...(hauling.length > 0 ? [{ label: `${hauling.length} resources`, color: "secondary" as const }] : []),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      <HaulingOrdersSection orders={data.hauling_orders || []} />
      {!data.hauling_orders?.length && (
        <Typography variant="body2" color="text.secondary">
          Hauling cargo details not yet available for template-embedded contracts.
        </Typography>
      )}
    </Stack>
  )
}

/** Mining — hauling orders (ore output), BP rewards */
function MiningDetails({ data }: { data: MissionDetailResponse }) {
  const hauling = data.hauling_orders || []
  const totalScu = hauling.reduce((s, h) => s + h.max_scu, 0)
  const chips = [
    ...(totalScu > 0 ? [{ label: `${totalScu} SCU ore`, color: "info" as const, icon: <LocalShippingRounded sx={{ fontSize: 14 }} /> }] : []),
    ...(data.blueprint_rewards?.length ? [{ label: `${data.blueprint_rewards.reduce((s, p) => s + p.blueprints.length, 0)} BPs`, color: "success" as const, icon: <BuildRounded sx={{ fontSize: 14 }} /> }] : []),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      <HaulingOrdersSection orders={data.hauling_orders || []} />
      <EntitySpawnsSection spawns={data.entity_spawns || []} />
      {!data.hauling_orders?.length && (
        <Typography variant="body2" color="text.secondary">No mining order data available.</Typography>
      )}
    </Stack>
  )
}

/** Maintenance — entity spawns (relay/pipe repair targets) */
function MaintenanceDetails({ data }: { data: MissionDetailResponse }) {
  const entityCount = (data.entity_spawns || []).reduce((s, e) => s + e.count, 0)
  const chips = [
    ...(entityCount > 0 ? [{ label: `${entityCount} repair targets`, color: "warning" as const, icon: <HandymanRounded sx={{ fontSize: 14 }} /> }] : []),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      <EntitySpawnsSection spawns={data.entity_spawns || []} />
      {!data.entity_spawns?.length && (
        <Typography variant="body2" color="text.secondary">No repair target data available.</Typography>
      )}
    </Stack>
  )
}

/** Investigation — accept locations, ship encounters */
function InvestigationDetails({ data }: { data: MissionDetailResponse }) {
  const chips = [
    ...shipChips(data),
    ...((data.entity_spawns?.length ?? 0) > 0 ? [{ label: `${data.entity_spawns!.reduce((s, e) => s + e.count, 0)} clues`, color: "info" as const, icon: <SearchRounded sx={{ fontSize: 14 }} /> }] : []),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      <ShipEncountersSection encounters={data.ship_encounters || []} />
      <EntitySpawnsSection spawns={data.entity_spawns || []} />
      {!data.ship_encounters?.length && !data.entity_spawns?.length && (
        <Typography variant="body2" color="text.secondary">
          Investigation details not yet available. Accept locations coming soon.
        </Typography>
      )}
    </Stack>
  )
}

/** Race — buy-in fee, route info */
function RaceDetails({ data }: { data: MissionDetailResponse }) {
  const m = data.mission
  const isFee = (m.credit_reward_min ?? 0) < 0
  const chips = [
    ...(isFee ? [{ label: `Entry: ${Math.abs(m.credit_reward_min!).toLocaleString()} aUEC`, color: "warning" as const, icon: <SportsScoreRounded sx={{ fontSize: 14 }} /> }] : []),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      {isFee && (
        <Paper variant="outlined" sx={{ p: 1.5, borderColor: "warning.main" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SportsScoreRounded sx={{ fontSize: 20, color: "warning.main" }} />
            <Box>
              <Typography variant="subtitle2" color="warning.main">Entry Fee</Typography>
              <Typography variant="body2">{Math.abs(m.credit_reward_min!).toLocaleString()} aUEC</Typography>
            </Box>
          </Stack>
        </Paper>
      )}
      <Typography variant="body2" color="text.secondary">
        Race route data not yet available.
      </Typography>
    </Stack>
  )
}

/** Generic fallback — shows whatever data exists */
function GenericDetails({ data }: { data: MissionDetailResponse }) {
  const hasAnything = (data.ship_encounters?.length || data.npc_encounters?.length || data.hauling_orders?.length || data.entity_spawns?.length)
  return (
    <Stack spacing={1.5}>
      <ShipEncountersSection encounters={data.ship_encounters || []} />
      <NpcEncountersSection encounters={data.npc_encounters || []} />
      <HaulingOrdersSection orders={data.hauling_orders || []} />
      <EntitySpawnsSection spawns={data.entity_spawns || []} />
      {!hasAnything && (
        <Typography variant="body2" color="text.secondary">No type-specific data available for this mission.</Typography>
      )}
    </Stack>
  )
}
