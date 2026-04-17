import React, { useMemo } from "react"
import { Box, Typography, useTheme } from "@mui/material"
import { useTranslation } from "react-i18next"
import { BarChart } from "@mui/x-charts/BarChart"
import { marketV2Api } from "../../../../store/api/v2/market"
import type { ExtendedTheme } from "../../../../hooks/styles/Theme"

interface QualityDistributionChartProps {
  /** Game item UUID to fetch quality distribution for */
  gameItemId: string
  /** Optional height override (default: 400px) */
  height?: number
  /** Optional width override (default: 100%) */
  width?: string | number
  /** Optional callback when a tier is clicked for filtering */
  onTierClick?: (tier: number) => void
}

/**
 * QualityDistributionChart - Quality tier distribution histogram
 * 
 * Displays a bar chart showing the distribution of quality tiers across
 * available listings for a specific game item. Each bar represents a quality
 * tier (1-5) with quantity available on the Y-axis.
 * 
 * Features:
 * - Color-coded bars by quality tier (Bronze to Diamond)
 * - Interactive tooltips showing price range and seller count
 * - Click-to-filter functionality
 * - Responsive design for mobile
 * 
 * Requirements: 40.1-40.10, 47.6-47.10
 * - Uses useGetQualityDistributionQuery hook (40.1)
 * - Displays histogram as bar chart (40.2)
 * - Uses consistent color coding for quality tiers (40.3)
 * - Shows quantity available per tier (40.4)
 * - Shows price range per tier (40.5)
 * - Provides interactive tooltips (40.6)
 * - Supports click-to-filter functionality (40.7)
 * - Maintains visual consistency with V1 charts (40.8)
 * - Responsive for mobile (40.9)
 * - Uses ExtendedTheme for colors (40.10)
 */
export function QualityDistributionChart({
  gameItemId,
  height = 400,
  width = "100%",
  onTierClick,
}: QualityDistributionChartProps) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  // Fetch quality distribution data from V2 API
  const { data, isLoading, isError } = marketV2Api.useGetQualityDistributionQuery({
    gameItemId,
  })

  // Map quality tier to theme color
  const getTierColor = (tier: number): string => {
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

  // Get tier name for display
  const getTierName = (tier: number): string => {
    switch (tier) {
      case 1:
        return t("market.tierBronze", "Bronze")
      case 2:
        return t("market.tierSilver", "Silver")
      case 3:
        return t("market.tierGold", "Gold")
      case 4:
        return t("market.tierPlatinum", "Platinum")
      case 5:
        return t("market.tierDiamond", "Diamond")
      default:
        return `Tier ${tier}`
    }
  }

  // Transform API data into chart format
  const chartData = useMemo(() => {
    if (!data?.distribution || data.distribution.length === 0) {
      return []
    }

    // Ensure all tiers 1-5 are represented (fill missing with 0)
    const tierMap = new Map(
      data.distribution.map((item) => [item.quality_tier, item])
    )

    return [1, 2, 3, 4, 5].map((tier) => {
      const tierData = tierMap.get(tier)
      return {
        tier,
        quantity: tierData?.quantity_available ?? 0,
        avgPrice: tierData?.avg_price ?? 0,
        minPrice: tierData?.min_price ?? 0,
        maxPrice: tierData?.max_price ?? 0,
        sellerCount: tierData?.seller_count ?? 0,
        listingCount: tierData?.listing_count ?? 0,
      }
    })
  }, [data])

  // Custom tooltip formatter
  const tooltipFormatter = (value: number | null, context: any) => {
    if (value === null || !chartData[context.dataIndex]) {
      return ""
    }

    const tierData = chartData[context.dataIndex]
    const tierName = getTierName(tierData.tier)

    return [
      `${tierName}`,
      `Quantity: ${tierData.quantity.toLocaleString()}`,
      tierData.quantity > 0
        ? `Price: ${tierData.minPrice.toLocaleString()} - ${tierData.maxPrice.toLocaleString()} aUEC`
        : "",
      tierData.quantity > 0
        ? `Avg: ${Math.round(tierData.avgPrice).toLocaleString()} aUEC`
        : "",
      tierData.quantity > 0
        ? `Sellers: ${tierData.sellerCount}`
        : "",
      tierData.quantity > 0
        ? `Listings: ${tierData.listingCount}`
        : "",
    ]
      .filter(Boolean)
      .join("\n")
  }

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {t("market.loadingQualityDistribution", "Loading quality distribution...")}
        </Typography>
      </Box>
    )
  }

  // Error state
  if (isError) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="error">
          {t(
            "market.errorLoadingQualityDistribution",
            "Error loading quality distribution"
          )}
        </Typography>
      </Box>
    )
  }

  // Empty state
  if (!data || chartData.every((d) => d.quantity === 0)) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {t("market.noQualityDistribution", "No quality distribution data available")}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ width: width === "100%" ? "100%" : width }}>
      <BarChart
        xAxis={[
          {
            data: chartData.map((d) => getTierName(d.tier)),
            scaleType: "band",
            categoryGapRatio: 0.3,
            barGapRatio: 0.1,
          },
        ]}
        yAxis={[
          {
            label: t("market.quantityAvailable", "Quantity Available"),
            valueFormatter: (value: number) => Math.round(value).toLocaleString(),
          },
        ]}
        series={[
          {
            data: chartData.map((d) => d.quantity),
            label: t("market.quantity", "Quantity"),
            valueFormatter: (value: number | null) =>
              value !== null ? value.toLocaleString() : "",
          },
        ]}
        height={height}
        sx={{
          width: "100%",
          "& .MuiBarElement-root": {
            cursor: onTierClick ? "pointer" : "default",
          },
          // Apply tier-specific colors to bars
          "& .MuiBarElement-root:nth-of-type(1)": {
            fill: getTierColor(1),
          },
          "& .MuiBarElement-root:nth-of-type(2)": {
            fill: getTierColor(2),
          },
          "& .MuiBarElement-root:nth-of-type(3)": {
            fill: getTierColor(3),
          },
          "& .MuiBarElement-root:nth-of-type(4)": {
            fill: getTierColor(4),
          },
          "& .MuiBarElement-root:nth-of-type(5)": {
            fill: getTierColor(5),
          },
          // Hide legend
          "& .MuiChartsLegend-root": {
            display: "none",
          },
        }}
        onAxisClick={(event, data) => {
          // Handle click-to-filter when a bar is clicked
          if (onTierClick && data?.axisValue !== undefined) {
            const tierIndex = chartData.findIndex(
              (d) => getTierName(d.tier) === data.axisValue
            )
            if (tierIndex !== -1) {
              onTierClick(chartData[tierIndex].tier)
            }
          }
        }}
      />
    </Box>
  )
}
