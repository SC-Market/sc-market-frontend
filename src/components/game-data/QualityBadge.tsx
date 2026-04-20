/**
 * QualityBadge - Display quality tier badge
 * 
 * Shows quality tier (1-5) with color coding and tier name.
 * Consistent with Market V2 quality display patterns.
 * 
 * Requirements: 48.1-48.10
 */

import React from "react"
import { Chip, Tooltip, useTheme } from "@mui/material"
import type { ExtendedTheme } from "../../hooks/styles/Theme"

interface QualityBadgeProps {
  /** Quality tier (1-5) */
  tier: number
  /** Show tier name (Bronze, Silver, etc.) */
  showName?: boolean
  /** Size variant */
  size?: "small" | "medium"
  /** Optional quality value (0-100) for tooltip */
  value?: number
}

/**
 * QualityBadge Component
 * 
 * Features:
 * - Color-coded by tier (48.3, 48.9)
 * - Displays tier number and optional name (48.1)
 * - Tooltip with quality value if provided (48.10)
 * - Consistent with Market V2 styling (48.9)
 */
export const QualityBadge: React.FC<QualityBadgeProps> = ({
  tier,
  showName = false,
  size = "small",
  value,
}) => {
  const theme = useTheme<ExtendedTheme>()

  // Get tier color (consistent with Market V2)
  const getTierColor = (): string => {
    switch (tier) {
      case 1:
        return theme.palette.warning.main // Bronze
      case 2:
        return theme.palette.grey[500] // Silver
      case 3:
        return theme.palette.info.main // Gold
      case 4:
        return theme.palette.primary.main // Platinum
      case 5:
        return theme.palette.secondary.main // Diamond
      default:
        return theme.palette.grey[400]
    }
  }

  // Get tier name
  const getTierName = (): string => {
    switch (tier) {
      case 1:
        return "Bronze"
      case 2:
        return "Silver"
      case 3:
        return "Gold"
      case 4:
        return "Platinum"
      case 5:
        return "Diamond"
      default:
        return `Tier ${tier}`
    }
  }

  const label = showName ? getTierName() : `T${tier}`
  const tooltipText = value !== undefined 
    ? `${getTierName()} (${value.toFixed(1)}%)`
    : getTierName()

  return (
    <Tooltip title={tooltipText}>
      <Chip
        label={label}
        size={size}
        sx={{
          backgroundColor: getTierColor(),
          color: "white",
          fontWeight: "bold",
          fontSize: size === "small" ? "0.7rem" : "0.8rem",
          height: size === "small" ? 20 : 24,
        }}
      />
    </Tooltip>
  )
}
