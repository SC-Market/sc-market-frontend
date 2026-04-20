/**
 * RarityBadge - Display blueprint/item rarity badge
 * 
 * Shows rarity level with color coding.
 * Used for blueprints and rare items.
 * 
 * Requirements: 48.1-48.10
 */

import React from "react"
import { Chip, useTheme } from "@mui/material"
import type { ExtendedTheme } from "../../hooks/styles/Theme"

interface RarityBadgeProps {
  /** Rarity level */
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | string
  /** Size variant */
  size?: "small" | "medium"
}

/**
 * RarityBadge Component
 * 
 * Features:
 * - Color-coded by rarity (48.3, 48.9)
 * - Displays rarity name (48.1)
 * - Consistent styling (48.9)
 */
export const RarityBadge: React.FC<RarityBadgeProps> = ({
  rarity,
  size = "small",
}) => {
  const theme = useTheme<ExtendedTheme>()

  // Get rarity color
  const getRarityColor = (): string => {
    const rarityLower = rarity.toLowerCase()
    
    switch (rarityLower) {
      case "common":
        return theme.palette.grey[600]
      case "uncommon":
        return theme.palette.success.main
      case "rare":
        return theme.palette.info.main
      case "epic":
        return theme.palette.secondary.main
      case "legendary":
        return theme.palette.warning.main
      default:
        return theme.palette.grey[500]
    }
  }

  return (
    <Chip
      label={rarity}
      size={size}
      sx={{
        backgroundColor: getRarityColor(),
        color: "white",
        fontWeight: "bold",
        fontSize: size === "small" ? "0.7rem" : "0.8rem",
        height: size === "small" ? 20 : 24,
      }}
    />
  )
}
