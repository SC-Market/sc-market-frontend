import React from "react";
import {
  Box,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import type { ExtendedTheme } from "../../../hooks/styles/theme";
import { QualityBadge } from "./QualityBadge";

interface QualityDistribution {
  tier: number;
  count: number;
  percentage: number;
  averagePrice?: number;
}

interface QualityHistogramProps {
  distribution: QualityDistribution[];
  title?: string;
  showPrices?: boolean;
}

/**
 * QualityHistogram - Distribution chart for quality tiers
 * 
 * Displays horizontal bar chart showing:
 * - Quality tier badge
 * - Count of items at that tier
 * - Percentage bar
 * - Average price (optional)
 * 
 * Maintains visual consistency with V1 chart styling.
 * Used in game item listings and analytics pages.
 */
export const QualityHistogram: React.FC<QualityHistogramProps> = ({
  distribution,
  title = "Quality Distribution",
  showPrices = false,
}) => {
  const theme = useTheme<ExtendedTheme>();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (distribution.length === 0) {
    return (
      <Paper
        sx={{
          p: 2,
          borderRadius: theme.borderRadius?.topLevel ?? 0.375,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No quality data available
          </Typography>
        </Box>
      </Paper>
    );
  }

  const maxCount = Math.max(...distribution.map((d) => d.count));

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: theme.borderRadius?.topLevel ?? 0.375,
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
        {title}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {distribution.map((item) => (
          <Box key={item.tier}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 0.5,
              }}
            >
              <QualityBadge tier={item.tier} size="small" />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {item.count} {item.count === 1 ? "listing" : "listings"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.percentage.toFixed(1)}%
              </Typography>
            </Box>

            {/* Percentage bar */}
            <Box
              sx={{
                width: "100%",
                height: isMobile ? 6 : 8,
                backgroundColor: theme.palette.action.hover,
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${(item.count / maxCount) * 100}%`,
                  height: "100%",
                  backgroundColor: theme.palette.primary.main,
                  transition: "width 0.3s ease-in-out",
                }}
              />
            </Box>

            {/* Average price (optional) */}
            {showPrices && item.averagePrice !== undefined && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                Avg: {item.averagePrice.toLocaleString()} aUEC
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      {/* Summary */}
      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: 1,
          borderColor: theme.palette.divider,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Total Listings
        </Typography>
        <Typography variant="caption" fontWeight="bold">
          {distribution.reduce((sum, item) => sum + item.count, 0)}
        </Typography>
      </Box>
    </Paper>
  );
};
