/**
 * BlueprintCard — compact card with ingredients, mission source dots, commodity colors
 */

import React from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material"
import {
  BookmarkRounded,
  BookmarkBorderRounded,
  CircleRounded,
  PlaylistAddRounded,
} from "@mui/icons-material"
import { formatCategoryName } from "../../util/categoryDisplay"
import { Link as RouterLink } from "react-router-dom"
import { inAppClick } from "../links/inAppClick"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { getCommodityColor, getItemCategoryColor } from "../../util/gameIcons"

import { GameItemAvatar } from "./GameItemAvatar"
import { BlueprintTags, isBlueprintOwned } from "./BlueprintTags"
import { Tooltip } from "@mui/material"
import { useTranslation } from "react-i18next"

export interface BlueprintIngredientSummary {
  name: string
  short_name?: string
  quantity_required: number
  sub_type?: string
  icon_url?: string
}

export interface BlueprintCardProps {
  blueprint: {
    blueprint_id: string
    blueprint_code?: string
    blueprint_name: string
    output_item_name: string
    output_item_icon?: string
    item_category?: string
    item_subcategory?: string
    manufacturer?: string
    manufacturer_name: string | null
    source?: string
    rarity?: string
    tier?: number
    ingredient_count: number
    mission_count: number
    crafting_time_seconds?: number
    modifier_properties?: string[]
    user_owns?: boolean
    ingredients?: BlueprintIngredientSummary[]
  }
  viewMode?: "grid" | "list"
  onClick?: (blueprintId: string, blueprintCode?: string) => void
  onBookmarkToggle?: (blueprintId: string, isOwned: boolean) => void
  onWishlistAdd?: (blueprintId: string) => void
}

import { formatCraftingTime } from "../../constants/crafting"
import { common, grey } from "@mui/material/colors"

function shortName(name: string): string {
  // "Lindinium" → "LIND", "Iron" → "IRON", "Hephaestanite" → "HEPH"
  return (
    name
      .replace(/[aeiou]/gi, "")
      .slice(0, 4)
      .toUpperCase() || name.slice(0, 4).toUpperCase()
  )
}

function ingColor(ing: BlueprintIngredientSummary): string {
  return getCommodityColor(ing.sub_type) || grey[700]
}

export const BlueprintCard: React.FC<BlueprintCardProps> = ({
  blueprint: bp,
  viewMode = "grid",
  onClick,
  onBookmarkToggle,
  onWishlistAdd,
}) => {
  const { t } = useTranslation()
  const ings = bp.ingredients || []
  // Default blueprints are always owned by everyone
  const effectiveOwned = isBlueprintOwned(bp)
  // A real link (crawlable, prerendered with /blueprints, middle-click opens
  // the page); a plain click opens it in-app (onClick, e.g. the modal). The
  // detail route takes the blueprint name (or id), not blueprint_code.
  const href = GAME_DATA_PATHS.blueprint(bp.blueprint_name)

  if (viewMode === "grid") {
    return (
      <Card
        sx={{ height: "100%", position: "relative" }}
        data-testid="blueprint-card"
        data-id={bp.blueprint_id}
      >
        {onBookmarkToggle && bp.source !== "default" && (
          <Tooltip
            title={
              effectiveOwned
                ? t("blueprintsUi.removeFromInventory")
                : t("blueprintsUi.addToInventory")
            }
            arrow
          >
            <IconButton
              size="small"
              sx={{ position: "absolute", top: 4, right: 4, zIndex: 1 }}
              color={effectiveOwned ? "primary" : "default"}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onBookmarkToggle(bp.blueprint_id, !bp.user_owns)
              }}
            >
              {effectiveOwned ? (
                <BookmarkRounded fontSize="small" />
              ) : (
                <BookmarkBorderRounded fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}

        <CardActionArea
          component={RouterLink}
          to={href}
          onClick={inAppClick(() =>
            onClick?.(bp.blueprint_id, bp.blueprint_name),
          )}
          sx={{
            textDecoration: "none",
            color: "inherit",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
          }}
        >
          <CardContent sx={{ p: 1.5, pb: 0, flex: 1 }}>
            <Box sx={{ display: "flex", gap: 0.75, mb: 1, pr: 3 }}>
              <GameItemAvatar
                name={bp.output_item_name}
                iconUrl={bp.output_item_icon}
                size={32}
                useCommodityColor={false}
                sx={{ bgcolor: getItemCategoryColor(bp.item_category) }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  title={bp.output_item_name}
                >
                  {bp.output_item_name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  display="block"
                >
                  {formatCategoryName(bp.item_category, t)}
                </Typography>
              </Box>
            </Box>

            {/* Ingredients list */}
            {ings.length > 0 && (
              <Stack spacing={0.25} sx={{ mb: 0.5 }}>
                {ings.slice(0, 4).map((ing, i) => (
                  <Box
                    key={i}
                    sx={{ display: "flex", gap: 0.25, alignItems: "center" }}
                  >
                    <GameItemAvatar
                      name={ing.name}
                      iconUrl={ing.icon_url}
                      subType={ing.sub_type}
                      size={16}
                    />
                    <Typography variant="caption" noWrap sx={{ flex: 1 }}>
                      {ing.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ing.quantity_required.toFixed(2)} SCU
                    </Typography>
                  </Box>
                ))}
                {ings.length > 4 && (
                  <Typography variant="caption" color="text.secondary">
                    {t("blueprintsUi.moreCount", { count: ings.length - 4 })}
                  </Typography>
                )}
              </Stack>
            )}
          </CardContent>

          <CardActions
            disableSpacing
            sx={{ px: 1.5, pt: 0, pb: 0.5, flexWrap: "wrap", gap: 0.25 }}
          >
            <BlueprintTags blueprint={bp} nested wrap={false} />
          </CardActions>

          <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, mt: "auto" }}>
            {bp.crafting_time_seconds ? (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                  {t("blueprintsUi.card.craftTime")}
                </Typography>
                <Typography variant="caption">
                  {formatCraftingTime(bp.crafting_time_seconds)}
                </Typography>
              </Box>
            ) : null}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <CircleRounded
                sx={{
                  fontSize: 8,
                  color: bp.mission_count > 0 ? "success.main" : "error.main",
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ flex: 1, opacity: bp.mission_count > 0 ? 1 : 0.7 }}
              >
                {bp.mission_count > 0
                  ? t("blueprintsUi.card.missionSources", {
                      count: bp.mission_count,
                    })
                  : t("blueprintsUi.card.noMissionSources")}
              </Typography>
              {onWishlistAdd && (
                <Tooltip title={t("blueprintsUi.addToShoppingList")} arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onWishlistAdd(bp.blueprint_id)
                    }}
                  >
                    <PlaylistAddRounded sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </CardActionArea>
      </Card>
    )
  }

  // List mode
  return (
    <Card
      component={RouterLink}
      to={href}
      sx={{
        display: "block",
        cursor: "pointer",
        textDecoration: "none",
        "&:hover": { boxShadow: 3 },
      }}
      onClick={inAppClick(() => onClick?.(bp.blueprint_id, bp.blueprint_name))}
      data-testid="blueprint-card"
      data-id={bp.blueprint_id}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <GameItemAvatar
            name={bp.output_item_name}
            iconUrl={bp.output_item_icon}
            size={36}
            useCommodityColor={false}
            sx={{ bgcolor: getItemCategoryColor(bp.item_category) }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {bp.output_item_name}
            </Typography>
            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 0.25 }}
            >
              <BlueprintTags
                blueprint={bp}
                nested
                wrap={false}
                hide={["category"]}
              />
              {ings.map((ing, i) => (
                <Tooltip
                  key={i}
                  title={`${ing.name} — ${ing.quantity_required.toFixed(2)} SCU`}
                  arrow
                >
                  <Chip
                    label={`${shortName(ing.name)}×${ing.quantity_required.toFixed(2)}`}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.6rem",
                      bgcolor: ingColor(ing),
                      color: common.white,
                    }}
                  />
                </Tooltip>
              ))}
            </Stack>
          </Box>
          <Box
            sx={{
              textAlign: "right",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            <CircleRounded
              sx={{
                fontSize: 8,
                color: bp.mission_count > 0 ? "success.main" : "error.main",
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {t("blueprintsUi.card.missionsShort", {
                count: bp.mission_count,
              })}
            </Typography>
            {bp.crafting_time_seconds && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                {formatCraftingTime(bp.crafting_time_seconds)}
              </Typography>
            )}
          </Box>
          {onWishlistAdd && (
            <Tooltip title={t("blueprintsUi.addToShoppingList")} arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onWishlistAdd(bp.blueprint_id)
                }}
              >
                <PlaylistAddRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onBookmarkToggle && bp.source !== "default" && (
            <Tooltip
              title={
                effectiveOwned
                  ? t("blueprintsUi.removeFromInventory")
                  : t("blueprintsUi.addToInventory")
              }
              arrow
            >
              <IconButton
                size="small"
                color={effectiveOwned ? "primary" : "default"}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onBookmarkToggle(bp.blueprint_id, !bp.user_owns)
                }}
              >
                {effectiveOwned ? (
                  <BookmarkRounded fontSize="small" />
                ) : (
                  <BookmarkBorderRounded fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
