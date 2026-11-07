import {
  Grid,
  Typography,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import { ShieldRounded, BuildRounded } from "@mui/icons-material"
import { type MissionSearchResult } from "../../store/api/v2/market"
import { Link as RouterLink } from "react-router-dom"
import { inAppClick } from "../../components/links/inAppClick"
import { useTranslation } from "react-i18next"
import { formatCredits, getMissionTypeLabel } from "../../util/missionDisplay"
import { getMissionIcon, getMissionCategoryColor } from "../../util/gameIcons"
import { MissionName } from "../../components/game-data/MissionName"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { useFormatters } from "../../util/format"
import { common } from "@mui/material/colors"

/** List view of the mission search: one table row per mission. */
export function MissionResultsTable({
  missions,
  onMissionClick,
}: {
  missions: MissionSearchResult[]
  onMissionClick: (missionCode: string, missionId: string) => void
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  return (
    <Paper>
      <Table size="small" sx={MISSION_TABLE_SX}>
        <MissionTableHead />
        <TableBody>
          {missions.map((m) => (
            <TableRow
              key={m.mission_id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => onMissionClick(m.mission_code, m.mission_id)}
            >
              <TableCell sx={{ width: 40, py: 0.5 }}>
                <Tooltip title={getMissionTypeLabel(m.category, t)} arrow>
                  <ImageAvatar
                    alt=""
                    src={getMissionIcon(m.category) || undefined}
                    variant="rounded"
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: getMissionCategoryColor(m.category),
                    }}
                    imgProps={{
                      loading: "lazy",
                      style: {
                        objectFit: "contain",
                        padding: 4,
                      },
                    }}
                  >
                    {(m.category || "?")[0].toUpperCase()}
                  </ImageAvatar>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ maxWidth: 80, display: "block" }}
                >
                  {m.star_system || "—"}
                </Typography>
              </TableCell>
              <TableCell>
                {/* A real link (crawlable, middle-click); a plain click opens the modal like the row. */}
                <Tooltip title={m.mission_name} arrow enterDelay={500}>
                  <RouterLink
                    to={GAME_DATA_PATHS.mission(m.mission_code)}
                    onClick={(event) => {
                      event.stopPropagation()
                      inAppClick(() =>
                        onMissionClick(m.mission_code, m.mission_id),
                      )(event)
                    }}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    <MissionName
                      name={m.mission_name}
                      variant="body2"
                      fontWeight={600}
                      noWrap
                      sx={{ maxWidth: 260, display: "block" }}
                    />
                  </RouterLink>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ maxWidth: 100, display: "block" }}
                >
                  {m.faction?.includes("~mission")
                    ? t("missionsUi.various")
                    : m.faction || "—"}
                </Typography>
              </TableCell>
              <TableCell>
                <Stack
                  direction="row"
                  spacing={0.25}
                  flexWrap="wrap"
                  useFlexGap
                >
                  {m.category && (
                    <Tooltip title={getMissionTypeLabel(m.category, t)}>
                      <Chip
                        label={getMissionTypeLabel(m.category, t)}
                        size="small"
                        color="primary"
                        sx={microChip}
                      />
                    </Tooltip>
                  )}
                  {(m.is_illegal || m.legal_status === "ILLEGAL") && (
                    <Tooltip title={t("missionsUi.illegalMission")}>
                      <Chip
                        label={t("missionsUi.illegal")}
                        size="small"
                        color="error"
                        sx={microChip}
                      />
                    </Tooltip>
                  )}
                  {m.is_unique_mission && (
                    <Tooltip title={t("missionsUi.uniqueOneTime")}>
                      <Chip
                        label={t("missionsUi.unique")}
                        size="small"
                        color="warning"
                        sx={microChip}
                      />
                    </Tooltip>
                  )}
                  {m.is_chain_starter && (
                    <Tooltip title={t("missionsUi.chainStarter")}>
                      <Chip
                        label={t("missionsUi.starter")}
                        size="small"
                        variant="outlined"
                        sx={microChip}
                      />
                    </Tooltip>
                  )}
                  {m.is_chain_mission && !m.is_chain_starter && (
                    <Tooltip title={t("missionsUi.partOfChain")}>
                      <Chip
                        label={t("missionsUi.chain")}
                        size="small"
                        variant="outlined"
                        sx={microChip}
                      />
                    </Tooltip>
                  )}
                  {m.associated_event && (
                    <Tooltip title={m.associated_event}>
                      <Chip
                        label={m.associated_event}
                        size="small"
                        sx={{
                          ...microChip,
                          maxWidth: 100,
                          bgcolor: "info.main",
                          color: common.white,
                        }}
                      />
                    </Tooltip>
                  )}
                  {m.ship_encounter_count > 0 && (
                    <Tooltip
                      title={t("missionsUi.shipCount", {
                        count: m.ship_encounter_count,
                      })}
                    >
                      <Chip
                        icon={<ShieldRounded sx={{ fontSize: 14 }} />}
                        label={m.ship_encounter_count}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={microChip}
                      />
                    </Tooltip>
                  )}
                </Stack>
              </TableCell>
              <TableCell>
                {(m.hauling_orders?.length ?? 0) > 0 ? (
                  <Stack
                    direction="row"
                    spacing={0.25}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {m.hauling_orders!.map((h, i: number) => (
                      <Tooltip key={i} title={h.resource_name} arrow>
                        <Chip
                          label={h.resource_name
                            .split(/[\s,]+/)
                            .filter(Boolean)
                            .map((w: string) => w[0])
                            .join("")
                            .slice(0, 4)
                            .toUpperCase()}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.6rem",
                            fontFamily: "monospace",
                            bgcolor: "action.selected",
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell align="center">
                {m.blueprint_reward_count > 0 ? (
                  <Tooltip
                    title={
                      m.blueprint_reward_names?.join(", ") ||
                      t("missionsUi.blueprintCount", {
                        count: m.blueprint_reward_count,
                      })
                    }
                    arrow
                  >
                    <Chip
                      icon={<BuildRounded sx={{ fontSize: 14 }} />}
                      label={m.blueprint_reward_count}
                      size="small"
                      color="success"
                      sx={{ ...microChip, minWidth: 24 }}
                    />
                  </Tooltip>
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="caption"
                  color={
                    m.reputation_reward ? "text.primary" : "text.secondary"
                  }
                >
                  {m.reputation_reward
                    ? `${fmt.number(m.reputation_reward)} XP`
                    : "—"}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="body2"
                  color={
                    (m.credit_reward_min ?? 0) < 0
                      ? "error.main"
                      : "success.main"
                  }
                  fontWeight={600}
                  noWrap
                >
                  {(m.credit_reward_min ?? 0) < 0
                    ? t("missionsUi.fee", {
                        amount: formatCredits(
                          Math.abs(m.credit_reward_min!),
                          fmt.locale,
                        ),
                      })
                    : m.credit_reward_min === m.credit_reward_max ||
                        !m.credit_reward_max
                      ? formatCredits(m.credit_reward_min, fmt.locale)
                      : `${formatCredits(m.credit_reward_min, fmt.locale)} – ${formatCredits(m.credit_reward_max, fmt.locale)}`}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

export const microChip = {
  height: 18,
  fontSize: "0.65rem",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
}

/** Mission list table cell padding (loaded table and its skeleton). */
export const MISSION_TABLE_SX = { "& td, & th": { py: 0.5, px: 1 } } as const

export function MissionTableHead() {
  const { t } = useTranslation()
  return (
    <TableHead>
      <TableRow>
        <TableCell sx={{ width: 40 }} />
        <TableCell>{t("missionsUi.system")}</TableCell>
        <TableCell>{t("missionsUi.title")}</TableCell>
        <TableCell>{t("missionsUi.faction")}</TableCell>
        <TableCell sx={{ maxWidth: 280 }}>{t("missionsUi.tags")}</TableCell>
        <TableCell>{t("missionsUi.materials")}</TableCell>
        <TableCell align="center">{t("missionsUi.bps")}</TableCell>
        <TableCell align="right">{t("missionsUi.baseXp")}</TableCell>
        <TableCell align="right">{t("missionsUi.reward")}</TableCell>
      </TableRow>
    </TableHead>
  )
}

/** The mission list while the first page loads: same table, placeholder rows. */
export function MissionTableSkeleton({ rows = 15 }: { rows?: number }) {
  return (
    <Grid container spacing={0.75}>
      <Grid item xs={12}>
        <Paper>
          <Table size="small" sx={MISSION_TABLE_SX}>
            <MissionTableHead />
            <TableBody>
              {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ width: 40, py: 0.5 }}>
                    <Skeleton variant="rounded" width={24} height={24} />
                  </TableCell>
                  {[60, 200, 80, 120, 50, 24, 50, 90].map((w, j) => (
                    <TableCell key={j}>
                      <Skeleton
                        variant="text"
                        width={w}
                        sx={{ ml: j >= 6 ? "auto" : undefined }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>
    </Grid>
  )
}
