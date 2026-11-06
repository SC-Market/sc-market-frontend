import { useTranslation } from "react-i18next"
import { Box, Paper, Stack, Typography } from "@mui/material"
import {
  LocalShippingRounded,
  BuildRounded,
  SportsScoreRounded,
  HandymanRounded,
  SearchRounded,
} from "@mui/icons-material"
import type { MissionDetailResponse } from "../../features/game-data/api/gameDataApi"
import { useFormatters } from "../../util/format"
import {
  ShipEncountersSection,
  HaulingOrdersSection,
  EntitySpawnsSection,
  SummaryChips,
  shipChips,
} from "./MissionEncounterSections"

/** Delivery — hauling orders, pickup/delivery info */
export function DeliveryDetails({ data }: { data: MissionDetailResponse }) {
  const { t } = useTranslation()
  const hauling = data.hauling_orders || []
  const totalScu = hauling.reduce((s, h) => s + h.max_scu, 0)
  const dests = data.mission.destinations || []
  const chips = [
    ...(totalScu > 0
      ? [
          {
            label: `${totalScu} SCU`,
            color: "info" as const,
            icon: <LocalShippingRounded sx={{ fontSize: 14 }} />,
          },
        ]
      : []),
    ...(dests.length > 0
      ? [
          {
            label: t("missionToolsUi.destinationCount", {
              count: dests.length,
            }),
            color: "default" as const,
          },
        ]
      : []),
    ...shipChips(data, t),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      <HaulingOrdersSection orders={hauling} />
      {dests.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {t("missionToolsUi.destinations")}
          </Typography>
          <Stack spacing={0.25}>
            {dests.map((d, i) => (
              <Typography key={i} variant="body2">
                {d}
              </Typography>
            ))}
          </Stack>
        </Paper>
      )}
      <ShipEncountersSection encounters={data.ship_encounters || []} />
    </Stack>
  )
}

/** Hauling — cargo details, hauling orders */
export function HaulingDetails({ data }: { data: MissionDetailResponse }) {
  const { t } = useTranslation()
  const hauling = data.hauling_orders || []
  const totalScu = hauling.reduce((s, h) => s + h.max_scu, 0)
  const chips = [
    ...(totalScu > 0
      ? [
          {
            label: t("missionToolsUi.scuCargo", { amount: totalScu }),
            color: "info" as const,
            icon: <LocalShippingRounded sx={{ fontSize: 14 }} />,
          },
        ]
      : []),
    ...(hauling.length > 0
      ? [
          {
            label: t("missionToolsUi.resourceCount", { count: hauling.length }),
            color: "default" as const,
          },
        ]
      : []),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      <HaulingOrdersSection orders={data.hauling_orders || []} />
      {!data.hauling_orders?.length && (
        <Typography variant="body2" color="text.secondary">
          {t("missionToolsUi.haulingDetailsUnavailable")}
        </Typography>
      )}
    </Stack>
  )
}

/** Mining — hauling orders (ore output), BP rewards */
export function MiningDetails({ data }: { data: MissionDetailResponse }) {
  const { t } = useTranslation()
  const hauling = data.hauling_orders || []
  const totalScu = hauling.reduce((s, h) => s + h.max_scu, 0)
  const chips = [
    ...(totalScu > 0
      ? [
          {
            label: t("missionToolsUi.scuOre", { amount: totalScu }),
            color: "info" as const,
            icon: <LocalShippingRounded sx={{ fontSize: 14 }} />,
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
      <HaulingOrdersSection orders={data.hauling_orders || []} />
      <EntitySpawnsSection spawns={data.entity_spawns || []} />
      {!data.hauling_orders?.length && (
        <Typography variant="body2" color="text.secondary">
          {t("missionToolsUi.noMiningData")}
        </Typography>
      )}
    </Stack>
  )
}

/** Maintenance — entity spawns (relay/pipe repair targets) */
export function MaintenanceDetails({ data }: { data: MissionDetailResponse }) {
  const { t } = useTranslation()
  const entityCount = (data.entity_spawns || []).reduce(
    (s, e) => s + e.count,
    0,
  )
  const chips = [
    ...(entityCount > 0
      ? [
          {
            label: t("missionToolsUi.repairTargetCount", {
              count: entityCount,
            }),
            color: "warning" as const,
            icon: <HandymanRounded sx={{ fontSize: 14 }} />,
          },
        ]
      : []),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      <EntitySpawnsSection spawns={data.entity_spawns || []} />
      {!data.entity_spawns?.length && (
        <Typography variant="body2" color="text.secondary">
          {t("missionToolsUi.noRepairData")}
        </Typography>
      )}
    </Stack>
  )
}

/** Investigation — accept locations, ship encounters */
export function InvestigationDetails({
  data,
}: {
  data: MissionDetailResponse
}) {
  const { t } = useTranslation()
  const chips = [
    ...shipChips(data, t),
    ...((data.entity_spawns?.length ?? 0) > 0
      ? [
          {
            label: t("missionToolsUi.clueCount", {
              count: data.entity_spawns!.reduce((s, e) => s + e.count, 0),
            }),
            color: "info" as const,
            icon: <SearchRounded sx={{ fontSize: 14 }} />,
          },
        ]
      : []),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      <ShipEncountersSection encounters={data.ship_encounters || []} />
      <EntitySpawnsSection spawns={data.entity_spawns || []} />
      {!data.ship_encounters?.length && !data.entity_spawns?.length && (
        <Typography variant="body2" color="text.secondary">
          {t("missionToolsUi.investigationUnavailable")}
        </Typography>
      )}
    </Stack>
  )
}

/** Race — buy-in fee, route info */
export function RaceDetails({ data }: { data: MissionDetailResponse }) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const m = data.mission
  const isFee = (m.credit_reward_min ?? 0) < 0
  const chips = [
    ...(isFee
      ? [
          {
            label: t("missionToolsUi.entryAmount", {
              amount: `${fmt.number(Math.abs(m.credit_reward_min!))} aUEC`,
            }),
            color: "warning" as const,
            icon: <SportsScoreRounded sx={{ fontSize: 14 }} />,
          },
        ]
      : []),
  ]
  return (
    <Stack spacing={1.5}>
      <SummaryChips chips={chips} />
      {isFee && (
        <Paper variant="outlined" sx={{ p: 1.5, borderColor: "warning.main" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SportsScoreRounded sx={{ fontSize: 20, color: "warning.main" }} />
            <Box>
              <Typography variant="subtitle2" color="warning.main">
                {t("missionToolsUi.entryFee")}
              </Typography>
              <Typography variant="body2">
                {fmt.number(Math.abs(m.credit_reward_min!))} aUEC
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}
      <Typography variant="body2" color="text.secondary">
        {t("missionToolsUi.raceRouteUnavailable")}
      </Typography>
    </Stack>
  )
}
