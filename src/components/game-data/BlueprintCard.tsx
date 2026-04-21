/**
 * BlueprintCard — compact card showing crafted item name, avatar icon, owned toggle
 */

import React from "react"
import {
  Avatar,
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
import { Bookmark, BookmarkBorder } from "@mui/icons-material"
import { formatCategoryName } from "../../util/categoryDisplay"

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

export const BlueprintCard: React.FC<BlueprintCardProps> = ({
  blueprint: bp,
  viewMode = "grid",
  onClick,
  onBookmarkToggle,
}) => {
  if (viewMode === "grid") {
    return (
      <Card sx={{ height: "100%", position: "relative" }}>
        {/* Owned toggle — top right */}
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
            {/* Header: small avatar + item name */}
            <Box sx={{ display: "flex", gap: 1, mb: 1, pr: 3 }}>
              <Avatar
                src={bp.output_item_icon}
                variant="rounded"
                sx={{ width: 32, height: 32, fontSize: "0.7rem", bgcolor: "primary.main", flexShrink: 0 }}
                imgProps={{ style: { objectFit: "cover" } }}
              >
                {initials(bp.output_item_name)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap title={bp.output_item_name}>
                  {bp.output_item_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {formatCategoryName(bp.item_category) || "Blueprint"}
                </Typography>
              </Box>
            </Box>
          </CardContent>

          {/* Tags */}
          <CardActions sx={{ px: 1.5, pt: 0, pb: 0.5, flexWrap: "wrap", gap: 0.5 }}>
            {bp.rarity && <Chip label={bp.rarity} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />}
            {bp.tier && <Chip label={`T${bp.tier}`} size="small" color="secondary" sx={{ height: 18, fontSize: "0.65rem" }} />}
            {bp.mission_count > 0 && <Chip label={`${bp.mission_count} mission${bp.mission_count !== 1 ? "s" : ""}`} size="small" color="info" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
          </CardActions>

          {/* Bottom stats */}
          <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, mt: "auto" }}>
            {bp.crafting_time_seconds ? (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">Craft time</Typography>
                <Typography variant="caption">{formatTime(bp.crafting_time_seconds)}</Typography>
              </Box>
            ) : null}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">Ingredients</Typography>
              <Typography variant="caption">{bp.ingredient_count}</Typography>
            </Box>
            {bp.mission_count === 0 && (
              <Typography variant="caption" color="text.disabled" display="block">No mission sources</Typography>
            )}
          </Box>
        </CardActionArea>
      </Card>
    )
  }

  // List mode — same as grid but horizontal
  return (
    <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 3 } }} onClick={() => onClick?.(bp.blueprint_id)}>
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Avatar
            src={bp.output_item_icon}
            variant="rounded"
            sx={{ width: 40, height: 40, fontSize: "0.8rem", bgcolor: "primary.main", flexShrink: 0 }}
            imgProps={{ style: { objectFit: "cover" } }}
          >
            {initials(bp.output_item_name)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>{bp.output_item_name}</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {bp.rarity && <Chip label={bp.rarity} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />}
              {bp.tier && <Chip label={`T${bp.tier}`} size="small" color="secondary" sx={{ height: 18, fontSize: "0.65rem" }} />}
              {bp.item_category && <Chip label={formatCategoryName(bp.item_category)} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
            </Stack>
          </Box>
          <Box sx={{ textAlign: "right", flexShrink: 0 }}>
            <Typography variant="caption" color="text.secondary" display="block">{bp.ingredient_count} ing · {bp.mission_count} msn</Typography>
            {bp.crafting_time_seconds && <Typography variant="caption" color="text.secondary">{formatTime(bp.crafting_time_seconds)}</Typography>}
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
