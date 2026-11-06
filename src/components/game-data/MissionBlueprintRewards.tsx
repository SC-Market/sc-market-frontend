import React from "react"
import {
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material"
import { CheckCircleOutlineRounded, BuildRounded } from "@mui/icons-material"
import type { MissionDetailResponse } from "../../features/game-data/api/gameDataApi"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { GAME_DATA_PATHS, WIKI_PATHS } from "../../routes/paths"

/** Blueprint reward pools of a mission, one table per pool. */
export function MissionBlueprintRewards({
  data,
  onBlueprintClick,
}: {
  data: MissionDetailResponse
  onBlueprintClick?: (id: string) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      <Divider />
      <Typography variant="subtitle2">
        {t("missionsUi.blueprintRewards")}
      </Typography>
      {data.blueprint_rewards.map((pool, poolIdx) => {
        const poolChance =
          pool.pool_chance != null ? pool.pool_chance * 100 : null
        const bpCount = pool.blueprints?.length || pool.reward_pool_size || 0
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
                    encodeURIComponent(bp.blueprint_name || bp.blueprint_id),
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
  )
}
