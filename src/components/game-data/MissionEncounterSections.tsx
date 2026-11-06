import React from "react"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import { Box, Chip, Paper, Stack, Typography } from "@mui/material"
import {
  RocketLaunchRounded,
  ShieldRounded,
  LocalShippingRounded,
} from "@mui/icons-material"
import type {
  MissionDetailResponse,
  ShipEncounter,
  NpcEncounter,
  HaulingOrder,
  EntitySpawn,
} from "../../features/game-data/api/gameDataApi"

// ============================================================================
// Shared building blocks
// ============================================================================

export function ShipEncountersSection({
  encounters,
}: {
  encounters: ShipEncounter[]
}) {
  const { t } = useTranslation()
  if (!encounters.length) return null
  const hostileMin = encounters
    .filter((e) => e.alignment === "hostile")
    .reduce((s, e) => s + e.waves.reduce((ws, w) => ws + w.min_ships, 0), 0)
  const hostileMax = encounters
    .filter((e) => e.alignment === "hostile")
    .reduce((s, e) => s + e.waves.reduce((ws, w) => ws + w.max_ships, 0), 0)
  const friendlyMin = encounters
    .filter((e) => e.alignment === "friendly")
    .reduce((s, e) => s + e.waves.reduce((ws, w) => ws + w.min_ships, 0), 0)
  const friendlyMax = encounters
    .filter((e) => e.alignment === "friendly")
    .reduce((s, e) => s + e.waves.reduce((ws, w) => ws + w.max_ships, 0), 0)
  const allPool = encounters.flatMap((e) => e.ship_pool || [])
  const uniquePool: string[] = [...new Set(allPool)].sort()

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 1 }}
      >
        <Typography variant="subtitle2">
          {t("missionToolsUi.shipEncounters")}
        </Typography>
        {hostileMax > 0 && (
          <Chip
            icon={<RocketLaunchRounded sx={{ fontSize: 14 }} />}
            label={t("missionToolsUi.hostileRange", {
              range: fmtRange(hostileMin, hostileMax),
              count: hostileMax,
            })}
            size="small"
            color="error"
            variant="outlined"
            sx={{ height: 22, fontSize: "0.7rem" }}
          />
        )}
        {friendlyMax > 0 && (
          <Chip
            icon={<ShieldRounded sx={{ fontSize: 14 }} />}
            label={t("missionToolsUi.friendlyRange", {
              range: fmtRange(friendlyMin, friendlyMax),
              count: friendlyMax,
            })}
            size="small"
            color="info"
            variant="outlined"
            sx={{ height: 22, fontSize: "0.7rem" }}
          />
        )}
      </Stack>
      <Stack spacing={0.5}>
        {encounters.map((enc, i) => (
          <Box key={i}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              {enc.alignment === "hostile" ? (
                <RocketLaunchRounded
                  sx={{ fontSize: 16, color: "error.main" }}
                />
              ) : (
                <ShieldRounded sx={{ fontSize: 16, color: "info.main" }} />
              )}
              <Typography variant="body2" fontWeight={600}>
                {enc.role}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("missionToolsUi.shipRange", {
                  range: fmtRange(
                    enc.waves.reduce((s, w) => s + w.min_ships, 0),
                    enc.waves.reduce((s, w) => s + w.max_ships, 0),
                  ),
                  count: enc.waves.reduce((s, w) => s + w.max_ships, 0),
                })}
              </Typography>
            </Stack>
            {enc.waves.map((wave, wi) => (
              <Typography
                key={wi}
                variant="caption"
                color="text.secondary"
                sx={{ pl: 3.5, display: "block" }}
              >
                {wave.name}:{" "}
                {t("missionToolsUi.shipRange", {
                  range: fmtRange(wave.min_ships, wave.max_ships),
                  count: wave.max_ships,
                })}
              </Typography>
            ))}
          </Box>
        ))}
      </Stack>
      {uniquePool.length > 0 && (
        <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{ mb: 0.5, display: "block" }}
          >
            {t("missionToolsUi.shipPoolTypes", { count: uniquePool.length })}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {uniquePool.map((ship, i) => (
              <Chip
                key={i}
                label={ship}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.65rem" }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  )
}

export function NpcEncountersSection({
  encounters,
}: {
  encounters: NpcEncounter[]
}) {
  const { t } = useTranslation()
  if (!encounters.length) return null
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {t("missionToolsUi.npcEncounters")}
      </Typography>
      <Stack spacing={0.25}>
        {encounters.map((npc, i) => (
          <Stack key={i} direction="row" justifyContent="space-between">
            <Typography variant="body2">{npc.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              ×{npc.count}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  )
}

export function HaulingOrdersSection({ orders }: { orders: HaulingOrder[] }) {
  const { t } = useTranslation()
  if (!orders.length) return null
  const totalMin = orders.reduce((s, h) => s + h.min_scu, 0)
  const totalMax = orders.reduce((s, h) => s + h.max_scu, 0)
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        <LocalShippingRounded sx={{ fontSize: 16 }} />
        <Typography variant="subtitle2">
          {t("missionsUi.haulingOrders")}
        </Typography>
        <Chip
          label={`${fmtRange(totalMin, totalMax)} SCU`}
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: "0.7rem" }}
        />
      </Stack>
      <Stack spacing={0.25}>
        {orders.map((h, i) => (
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
    </Paper>
  )
}

export function EntitySpawnsSection({ spawns }: { spawns: EntitySpawn[] }) {
  const { t } = useTranslation()
  if (!spawns.length) return null
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {t("missionToolsUi.targets")}
      </Typography>
      <Stack spacing={0.25}>
        {spawns.map((e, i) => (
          <Stack key={i} direction="row" justifyContent="space-between">
            <Typography variant="body2">{e.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              ×{e.count}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  )
}

export function fmtRange(min: number, max: number): string {
  return min === max ? `${min}` : `${min}–${max}`
}

/** Compact summary chips for quick-glance mission info */
export function SummaryChips({
  chips,
}: {
  chips: {
    label: string
    color?: "default" | "primary" | "error" | "info" | "success" | "warning"
    icon?: React.ReactElement
  }[]
}) {
  if (!chips.length) return null
  return (
    <Stack
      direction="row"
      spacing={0.5}
      flexWrap="wrap"
      useFlexGap
      sx={{ mb: 0.5 }}
    >
      {chips.map((c, i) => (
        <Chip
          key={i}
          label={c.label}
          icon={c.icon}
          size="small"
          color={c.color || "default"}
          variant="outlined"
          sx={{ height: 22, fontSize: "0.7rem" }}
        />
      ))}
    </Stack>
  )
}

export function shipChips(
  data: MissionDetailResponse,
  t: TFunction,
): { label: string; color: "error" | "info"; icon: React.ReactElement }[] {
  const enc = data.ship_encounters || []
  const chips: {
    label: string
    color: "error" | "info"
    icon: React.ReactElement
  }[] = []
  const hostile = enc.filter((e) => e.alignment === "hostile")
  const friendly = enc.filter((e) => e.alignment === "friendly")
  if (hostile.length) {
    const min = hostile.reduce(
      (s, e) => s + e.waves.reduce((ws, w) => ws + w.min_ships, 0),
      0,
    )
    const max = hostile.reduce(
      (s, e) => s + e.waves.reduce((ws, w) => ws + w.max_ships, 0),
      0,
    )
    chips.push({
      label: t("missionToolsUi.hostileRange", {
        range: fmtRange(min, max),
        count: max,
      }),
      color: "error",
      icon: <RocketLaunchRounded sx={{ fontSize: 14 }} />,
    })
  }
  if (friendly.length) {
    const min = friendly.reduce(
      (s, e) => s + e.waves.reduce((ws, w) => ws + w.min_ships, 0),
      0,
    )
    const max = friendly.reduce(
      (s, e) => s + e.waves.reduce((ws, w) => ws + w.max_ships, 0),
      0,
    )
    chips.push({
      label: t("missionToolsUi.friendlyRange", {
        range: fmtRange(min, max),
        count: max,
      }),
      color: "info",
      icon: <ShieldRounded sx={{ fontSize: 14 }} />,
    })
  }
  return chips
}
