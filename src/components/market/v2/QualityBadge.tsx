import { useTranslation } from "react-i18next"
import React from "react";
import { Chip } from "@mui/material";
import { useBreakpointDown } from "../../../hooks/layout/useBreakpoint";
import { qualityChipSx, qualityTierColor } from "../../../util/qualityColor";

interface QualityBadgeProps {
  tier: number | null | undefined;
  size?: "small" | "medium";
  variant?: "filled" | "outlined";
}

/**
 * QualityBadge - Visual indicator for quality tier (1-5)
 *
 * Uses the site's one quality colour scheme (`util/qualityColor`): 1 grey,
 * 2 green, 3 blue, 4 purple, 5 gold, each with AA-contrast text.
 */
export const QualityBadge: React.FC<QualityBadgeProps> = ({
  tier,
  size = "medium",
  variant = "filled",
}) => {
  const { t } = useTranslation()
  const isMobile = useBreakpointDown("sm");

  if (!tier || tier < 1 || tier > 5) {
    return null;
  }

  const color = qualityTierColor(tier);
  const displaySize = isMobile && size === "medium" ? "small" : size;

  return (
    <Chip
      label={t("marketV2.tierN", { tier })}
      size={displaySize}
      variant={variant}
      sx={{
        fontWeight: "bold",
        textTransform: "uppercase",
        fontSize: displaySize === "small" ? "0.65rem" : undefined,
        height: displaySize === "small" ? 18 : undefined,
        // Outlined: the tier colour as the border only. As text on the dark
        // paper the grey/purple steps would fall under 4.5:1.
        ...(variant === "outlined"
          ? { borderColor: color.bg, color: "text.secondary" }
          : qualityChipSx(color)),
      }}
    />
  );
};
