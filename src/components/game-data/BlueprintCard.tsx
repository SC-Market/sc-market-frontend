/**
 * BlueprintCard - Display blueprint information in card format
 * 
 * Reusable card component for displaying blueprint metadata including:
 * - Blueprint name and output item
 * - Item icon/image
 * - Rarity and tier badges
 * - Ingredient count and mission count
 * - Crafting time
 * - Bookmark toggle for ownership tracking
 * 
 * Task 12.2 - Create BlueprintCard component
 * Requirements: 43.1, 43.2, 43.3, 43.4, 43.5, 43.6, 43.7, 43.8, 43.9
 */

import React from "react"
import { Box, Card, CardContent, Chip, Typography } from "@mui/material"
import { Bookmark, BookmarkBorder } from "@mui/icons-material"

export interface BlueprintCardProps {
  /** Blueprint data */
  blueprint: {
    blueprint_id: string
    blueprint_name: string
    output_item_name: string
    output_item_icon?: string
    item_category?: string
    item_subcategory?: string
    rarity?: string
    tier?: number
    ingredient_count: number
    mission_count: number
    crafting_time_seconds?: number
    user_owns?: boolean
  }
  /** Display mode - grid or list */
  viewMode?: "grid" | "list"
  /** Click handler */
  onClick?: (blueprintId: string) => void
  /** Bookmark toggle handler */
  onBookmarkToggle?: (blueprintId: string, isOwned: boolean) => void
}

/**
 * BlueprintCard Component
 * 
 * Features:
 * - Displays blueprint name and output item (43.1, 43.2)
 * - Shows item icon/image (43.1)
 * - Displays rarity and tier badges (43.6)
 * - Shows ingredient count (43.3)
 * - Shows mission count (43.5)
 * - Displays crafting time (43.4)
 * - Bookmark toggle for ownership (43.8)
 * - Supports grid and list view modes (43.10)
 * - Hover effects for interactivity (43.7)
 * - Responsive layout
 */
export const BlueprintCard: React.FC<BlueprintCardProps> = ({
  blueprint,
  viewMode = "grid",
  onClick,
  onBookmarkToggle,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger card click if bookmark was clicked
    if ((e.target as HTMLElement).closest(".bookmark-toggle")) {
      return
    }
    if (onClick) {
      onClick(blueprint.blueprint_id)
    }
  }

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onBookmarkToggle) {
      onBookmarkToggle(blueprint.blueprint_id, !blueprint.user_owns)
    }
  }

  const formatCraftingTime = (seconds?: number): string => {
    if (!seconds) return ""
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes > 0) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
    }
    return `${seconds}s`
  }

  // Grid view rendering (Requirement 43.10)
  if (viewMode === "grid") {
    return (
      <Card
        sx={{
          cursor: onClick ? "pointer" : "default",
          height: "100%",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": onClick
            ? {
                transform: "translateY(-2px)",
                boxShadow: 3,
              }
            : {},
          position: "relative",
        }}
        onClick={handleClick}
      >
        {/* Bookmark Toggle (Requirement 43.8) */}
        {onBookmarkToggle && (
          <Box
            className="bookmark-toggle"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              cursor: "pointer",
              color: blueprint.user_owns ? "primary.main" : "action.disabled",
              "&:hover": {
                color: "primary.main",
              },
            }}
            onClick={handleBookmarkClick}
          >
            {blueprint.user_owns ? <Bookmark /> : <BookmarkBorder />}
          </Box>
        )}

        {/* Item Icon (Requirement 43.1) */}
        {blueprint.output_item_icon && (
          <Box
            component="img"
            src={blueprint.output_item_icon}
            alt={blueprint.output_item_name}
            sx={{
              width: "100%",
              height: 140,
              objectFit: "contain",
              bgcolor: "background.default",
              p: 2,
            }}
          />
        )}

        <CardContent>
          {/* Blueprint Name (Requirement 43.2) */}
          <Typography variant="h6" component="div" gutterBottom noWrap>
            {blueprint.blueprint_name}
          </Typography>

          {/* Output Item Name (Requirement 43.2) */}
          <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
            Crafts: {blueprint.output_item_name}
          </Typography>

          {/* Rarity and Tier Badges (Requirement 43.6) */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
            {blueprint.rarity && (
              <Chip
                label={blueprint.rarity}
                size="small"
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              />
            )}
            {blueprint.tier && (
              <Chip
                label={`Tier ${blueprint.tier}`}
                size="small"
                sx={{
                  bgcolor: "secondary.main",
                  color: "secondary.contrastText",
                }}
              />
            )}
          </Box>

          {/* Ingredient Count (Requirement 43.3) */}
          <Typography variant="caption" color="text.secondary" display="block">
            {blueprint.ingredient_count} ingredient{blueprint.ingredient_count !== 1 ? "s" : ""}
          </Typography>

          {/* Mission Count (Requirement 43.5) */}
          <Typography variant="caption" color="text.secondary" display="block">
            {blueprint.mission_count} mission{blueprint.mission_count !== 1 ? "s" : ""}
          </Typography>

          {/* Crafting Time (Requirement 43.4) */}
          {blueprint.crafting_time_seconds && (
            <Typography variant="caption" color="text.secondary" display="block">
              Crafting time: {formatCraftingTime(blueprint.crafting_time_seconds)}
            </Typography>
          )}
        </CardContent>
      </Card>
    )
  }

  // List view rendering (Requirement 43.10)
  return (
    <Card
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: 3,
            }
          : {},
      }}
      onClick={handleClick}
    >
      <CardContent>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* Item Icon (Requirement 43.1) */}
          {blueprint.output_item_icon && (
            <Box
              component="img"
              src={blueprint.output_item_icon}
              alt={blueprint.output_item_name}
              sx={{
                width: 80,
                height: 80,
                objectFit: "contain",
                bgcolor: "background.default",
                p: 1,
                borderRadius: 1,
                flexShrink: 0,
              }}
            />
          )}

          {/* Blueprint Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Blueprint Name (Requirement 43.2) */}
            <Typography variant="h6" component="div" sx={{ wordBreak: "break-word" }}>
              {blueprint.blueprint_name}
            </Typography>

            {/* Output Item Name (Requirement 43.2) */}
            <Typography variant="body2" color="text.secondary">
              Crafts: {blueprint.output_item_name}
            </Typography>

            {/* Category, Rarity, and Tier (Requirement 43.6) */}
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap", alignItems: "center" }}>
              {blueprint.item_category && (
                <Typography variant="caption" color="text.secondary">
                  {blueprint.item_category}
                </Typography>
              )}
              {blueprint.rarity && (
                <Chip
                  label={blueprint.rarity}
                  size="small"
                  sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                />
              )}
              {blueprint.tier && (
                <Chip
                  label={`Tier ${blueprint.tier}`}
                  size="small"
                  sx={{
                    bgcolor: "secondary.main",
                    color: "secondary.contrastText",
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Right side - Stats and Bookmark */}
          <Box
            sx={{
              textAlign: "right",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 0.5,
              flexShrink: 0,
            }}
          >
            {/* Bookmark Toggle (Requirement 43.8) */}
            {onBookmarkToggle && (
              <Box
                className="bookmark-toggle"
                sx={{
                  cursor: "pointer",
                  color: blueprint.user_owns ? "primary.main" : "action.disabled",
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
                onClick={handleBookmarkClick}
              >
                {blueprint.user_owns ? <Bookmark /> : <BookmarkBorder />}
              </Box>
            )}

            {/* Ingredient Count (Requirement 43.3) */}
            <Typography variant="body2" color="text.secondary">
              {blueprint.ingredient_count} ingredient{blueprint.ingredient_count !== 1 ? "s" : ""}
            </Typography>

            {/* Mission Count (Requirement 43.5) */}
            <Typography variant="body2" color="text.secondary">
              {blueprint.mission_count} mission{blueprint.mission_count !== 1 ? "s" : ""}
            </Typography>

            {/* Crafting Time (Requirement 43.4) */}
            {blueprint.crafting_time_seconds && (
              <Typography variant="body2" color="text.secondary">
                {formatCraftingTime(blueprint.crafting_time_seconds)}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
