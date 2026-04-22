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
import { Bookmark, BookmarkBorder, Circle } from "@mui/icons-material"
import { formatCategoryName } from "../../util/categoryDisplay"
import { getResourceCategoryIcon, getCommodityColor, getItemCategoryColor } from "../../util/gameIcons"
import { GameItemAvatar } from "./GameItemAvatar"
import { Tooltip } from "@mui/material"

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
    blueprint_name: string
    output_item_name: string
    output_item_icon?: string
    item_category?: string
    rarity?: string
    tier?: number
    ingredient_count: number
    mission_count: number
    crafting_time_seconds?: number
    user_owns?: boolean
    ingredients?: BlueprintIngredientSummary[]
  }
  viewMode?: "grid" | "list"
  onClick?: (blueprintId: string) => void
  onBookmarkToggle?: (blueprintId: string, isOwned: boolean) => void
}

function initials(name: string | undefined): string {
  if (!name) return "?"
  return name.split(/[\s_-]+/).map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

function formatTime(seconds?: number): string {
  if (!seconds) return ""
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? (s > 0 ? `${m}m ${s}s` : `${m}m`) : `${seconds}s`
}

function shortName(name: string): string {
  // "Lindinium" → "LIND", "Iron" → "IRON", "Hephaestanite" → "HEPH"
  return name.replace(/[aeiou]/gi, "").slice(0, 4).toUpperCase() || name.slice(0, 4).toUpperCase()
}

function ingIcon(ing: BlueprintIngredientSummary): string | undefined {
  return ing.icon_url || getResourceCategoryIcon(ing.sub_type) || undefined
}

function ingColor(ing: BlueprintIngredientSummary): string {
  return getCommodityColor(ing.sub_type) || "#616161"
}

export const BlueprintCard: React.FC<BlueprintCardProps> = ({
  blueprint: bp,
  viewMode = "grid",
  onClick,
  onBookmarkToggle,
}) => {
  const ings = bp.ingredients || []

  if (viewMode === "grid") {
    return (
      <Card sx={{ height: "100%", position: "relative" }}>
        {onBookmarkToggle && (
          <IconButton
            size="small"
            sx={{ position: "absolute", top: 4, right: 4, zIndex: 1 }}
            color={bp.user_owns ? "primary" : "default"}
            onClick={(e) => { e.stopPropagation(); onBookmarkToggle(bp.blueprint_id, !bp.user_owns) }}
          >
            {bp.user_owns ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
          </IconButton>
        )}

        <CardActionArea onClick={() => onClick?.(bp.blueprint_id)} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start" }}>
          <CardContent sx={{ p: 1.5, pb: 0, flex: 1 }}>
            <Box sx={{ display: "flex", gap: 1, mb: 1, pr: 3 }}>
              <GameItemAvatar name={bp.output_item_name} iconUrl={bp.output_item_icon} size={32} useCommodityColor={false} sx={{ bgcolor: getItemCategoryColor(bp.item_category) }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap title={bp.output_item_name}>
                  {bp.output_item_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {formatCategoryName(bp.item_category)}
                </Typography>
              </Box>
            </Box>

            {/* Ingredients list */}
            {ings.length > 0 && (
              <Stack spacing={0.25} sx={{ mb: 0.5 }}>
                {ings.slice(0, 4).map((ing, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    <GameItemAvatar name={ing.name} iconUrl={ing.icon_url} subType={ing.sub_type} size={16} />
                    <Typography variant="caption" noWrap sx={{ flex: 1 }}>{ing.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{ing.quantity_required.toFixed(2)} SCU</Typography>
                  </Box>
                ))}
                {ings.length > 4 && (
                  <Typography variant="caption" color="text.disabled">+{ings.length - 4} more</Typography>
                )}
              </Stack>
            )}
          </CardContent>

          <CardActions sx={{ px: 1.5, pt: 0, pb: 0.5, flexWrap: "wrap", gap: 0.75 }}>
            {bp.rarity && <Chip label={bp.rarity} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />}
            {bp.tier && <Chip label={`T${bp.tier}`} size="small" color="secondary" sx={{ height: 18, fontSize: "0.65rem" }} />}
          </CardActions>

          <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, mt: "auto" }}>
            {bp.crafting_time_seconds ? (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">Craft time</Typography>
                <Typography variant="caption">{formatTime(bp.crafting_time_seconds)}</Typography>
              </Box>
            ) : null}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Circle sx={{ fontSize: 8, color: bp.mission_count > 0 ? "success.main" : "error.main" }} />
              <Typography variant="caption" color={bp.mission_count > 0 ? "text.secondary" : "text.disabled"}>
                {bp.mission_count > 0 ? `${bp.mission_count} mission source${bp.mission_count !== 1 ? "s" : ""}` : "No mission sources"}
              </Typography>
            </Box>
          </Box>
        </CardActionArea>
      </Card>
    )
  }

  // List mode
  return (
    <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 3 } }} onClick={() => onClick?.(bp.blueprint_id)}>
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <GameItemAvatar name={bp.output_item_name} iconUrl={bp.output_item_icon} size={36} useCommodityColor={false} sx={{ bgcolor: getItemCategoryColor(bp.item_category) }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>{bp.output_item_name}</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.25 }}>
              {bp.rarity && <Chip label={bp.rarity} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />}
              {bp.tier && <Chip label={`T${bp.tier}`} size="small" color="secondary" sx={{ height: 18, fontSize: "0.65rem" }} />}
              {ings.map((ing, i) => (
                <Tooltip key={i} title={`${ing.name} — ${ing.quantity_required.toFixed(2)} SCU`} arrow>
                <Chip
                  label={`${shortName(ing.name)}×${ing.quantity_required.toFixed(2)}`}
                  size="small"
                  sx={{ height: 18, fontSize: "0.6rem", bgcolor: ingColor(ing), color: "#fff" }}
                />
                </Tooltip>
              ))}
            </Stack>
          </Box>
          <Box sx={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 0.75 }}>
            <Circle sx={{ fontSize: 8, color: bp.mission_count > 0 ? "success.main" : "error.main" }} />
            <Typography variant="caption" color="text.secondary">{bp.mission_count} msn</Typography>
            {bp.crafting_time_seconds && <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>{formatTime(bp.crafting_time_seconds)}</Typography>}
          </Box>
          {onBookmarkToggle && (
            <IconButton
              size="small"
              color={bp.user_owns ? "primary" : "default"}
              onClick={(e) => { e.stopPropagation(); onBookmarkToggle(bp.blueprint_id, !bp.user_owns) }}
            >
              {bp.user_owns ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
