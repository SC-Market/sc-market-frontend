import React from "react";
import { Chip, useTheme, useMediaQuery } from "@mui/material";
import type { ExtendedTheme } from "../../../hooks/styles/Theme";

interface QualityBadgeProps {
  tier: number | null | undefined;
  size?: "small" | "medium";
  variant?: "filled" | "outlined";
}

/**
 * QualityBadge - Visual indicator for quality tier (1-5)
 * 
 * Displays quality tier with color-coded badge:
 * - Tier 1: Bronze (warning)
 * - Tier 2: Silver (default)
 * - Tier 3: Gold (info)
 * - Tier 4: Platinum (primary)
 * - Tier 5: Diamond (secondary)
 * 
 * Maintains visual consistency with V1 chip styling.
 */
export const QualityBadge: React.FC<QualityBadgeProps> = ({
  tier,
  size = "medium",
  variant = "filled",
}) => {
  const theme = useTheme<ExtendedTheme>();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!tier || tier < 1 || tier > 5) {
    return null;
  }

  // Map tier to color and label
  const getTierConfig = (tier: number) => {
    switch (tier) {
      case 1:
        return { label: "Tier 1", color: "warning" as const, name: "Bronze" };
      case 2:
        return { label: "Tier 2", color: "default" as const, name: "Silver" };
      case 3:
        return { label: "Tier 3", color: "info" as const, name: "Gold" };
      case 4:
        return { label: "Tier 4", color: "primary" as const, name: "Platinum" };
      case 5:
        return { label: "Tier 5", color: "secondary" as const, name: "Diamond" };
      default:
        return { label: `Tier ${tier}`, color: "default" as const, name: "" };
    }
  };

  const config = getTierConfig(tier);
  const displaySize = isMobile && size === "medium" ? "small" : size;

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={displaySize}
      variant={variant}
      sx={{
        fontWeight: "bold",
        textTransform: "uppercase",
        fontSize: displaySize === "small" ? "0.65rem" : undefined,
        height: displaySize === "small" ? 18 : undefined,
      }}
    />
  );
};
