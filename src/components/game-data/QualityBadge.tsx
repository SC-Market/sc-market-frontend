/**
 * QualityBadge - Re-exports from market/v2 with game-data extensions
 * 
 * Consolidates the duplicate QualityBadge into a single source of truth.
 * The market/v2 version is the canonical implementation.
 * This wrapper adds game-data-specific props (showName, value tooltip).
 * 
 * Requirements: 48.1-48.10
 */

import React from "react"
import { Tooltip } from "@mui/material"
import { QualityBadge as MarketQualityBadge } from "../market/v2/QualityBadge"

interface QualityBadgeProps {
  tier: number
  showName?: boolean
  size?: "small" | "medium"
  value?: number
  variant?: "filled" | "outlined"
}

const TIER_NAMES: Record<number, string> = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
  4: "Platinum",
  5: "Diamond",
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({
  tier,
  showName = false,
  size = "small",
  value,
  variant,
}) => {
  const tooltipText = value !== undefined
    ? `${TIER_NAMES[tier] || `Tier ${tier}`} (${value.toFixed(1)}%)`
    : TIER_NAMES[tier] || `Tier ${tier}`

  const badge = (
    <MarketQualityBadge tier={tier} size={size} variant={variant} />
  )

  if (value !== undefined || showName) {
    return <Tooltip title={tooltipText}>{badge}</Tooltip>
  }

  return badge
}
