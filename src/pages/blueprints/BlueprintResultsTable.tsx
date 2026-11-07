import React from "react"
import {
  Typography,
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
import { type BlueprintSearchResult } from "../../store/api/v2/market"
import { Link as RouterLink } from "react-router-dom"
import { inAppClick } from "../../components/links/inAppClick"
import { formatCategoryName } from "../../util/categoryDisplay"
import { getCommodityColor } from "../../util/gameIcons"
import { useTranslation } from "react-i18next"
import { formatCraftingTime } from "../../constants/crafting"
import { BlueprintTags } from "../../components/game-data/BlueprintTags"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { common } from "@mui/material/colors"

/** List view of the blueprint browser: one table row per blueprint. */
export function BlueprintResultsTable({
  blueprints,
  onBlueprintClick,
}: {
  blueprints: BlueprintSearchResult[]
  onBlueprintClick: (blueprintId: string, blueprintCode?: string) => void
}) {
  const { t } = useTranslation()
  return (
    <Paper>
      <Table size="small" sx={{ "& td, & th": { py: 0.5, px: 1 } }}>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>{t("blueprintsUi.browser.columnItem")}</TableCell>
            <TableCell>{t("blueprintsUi.browser.category")}</TableCell>
            <TableCell>{t("blueprintsUi.browser.columnTags")}</TableCell>
            <TableCell>{t("blueprintsUi.browser.columnIngredients")}</TableCell>
            <TableCell align="center">
              {t("blueprintsUi.browser.columnMissionSources")}
            </TableCell>
            <TableCell align="right">
              {t("blueprintsUi.browser.columnCraftTime")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {blueprints.map((bp) => (
            <TableRow
              key={bp.blueprint_id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() =>
                onBlueprintClick(bp.blueprint_id, bp.blueprint_name)
              }
            >
              <TableCell sx={{ width: 40 }}>
                <ImageAvatar
                  alt=""
                  src={bp.output_item_icon}
                  variant="rounded"
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: "0.6rem",
                    bgcolor: "primary.main",
                  }}
                  imgProps={{ style: { objectFit: "cover" } }}
                >
                  {(bp.output_item_name || "?").slice(0, 2).toUpperCase()}
                </ImageAvatar>
              </TableCell>
              <TableCell>
                <Tooltip title={bp.output_item_name} arrow enterDelay={500}>
                  {/* A real link (crawlable, middle-click); a plain click opens the modal like the row. */}
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    noWrap
                    component={RouterLink}
                    to={GAME_DATA_PATHS.blueprint(bp.blueprint_name)}
                    onClick={(event: React.MouseEvent) => {
                      event.stopPropagation()
                      inAppClick(() =>
                        onBlueprintClick(bp.blueprint_id, bp.blueprint_name),
                      )(event)
                    }}
                    sx={{
                      maxWidth: 240,
                      display: "block",
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    {bp.output_item_name}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {formatCategoryName(bp.item_category, t)}
                </Typography>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5} flexWrap="nowrap">
                  <BlueprintTags
                    blueprint={bp}
                    nested
                    wrap={false}
                    hide={["manufacturer", "category", "modifiers"]}
                  />
                </Stack>
              </TableCell>
              <TableCell>
                <Stack
                  direction="row"
                  spacing={0.5}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ maxWidth: 200 }}
                >
                  {(bp.ingredients || []).slice(0, 4).map((ing, i: number) => {
                    const short =
                      ing.name
                        .replace(/[aeiou]/gi, "")
                        .slice(0, 4)
                        .toUpperCase() || ing.name.slice(0, 4).toUpperCase()
                    const qty = ing.quantity_required.toFixed(2)
                    return (
                      <Tooltip key={i} title={`${ing.name} — ${qty} SCU`} arrow>
                        <Chip
                          label={`${short}×${qty}`}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.6rem",
                            bgcolor:
                              getCommodityColor(ing.sub_type) || "grey.600",
                            color: common.white,
                          }}
                        />
                      </Tooltip>
                    )
                  })}
                  {(bp.ingredients || []).length > 4 && (
                    <Chip
                      label={`+${bp.ingredients.length - 4}`}
                      size="small"
                      variant="outlined"
                      sx={{ height: 18, fontSize: "0.6rem" }}
                    />
                  )}
                </Stack>
              </TableCell>
              <TableCell align="center">
                {bp.mission_count > 0 ? (
                  <Chip
                    label={bp.mission_count}
                    size="small"
                    color="info"
                    sx={{
                      height: 18,
                      fontSize: "0.65rem",
                      minWidth: 24,
                    }}
                  />
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption">
                  {formatCraftingTime(bp.crafting_time_seconds)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}
