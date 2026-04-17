import React, { useMemo, useState } from "react"
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { MuiLineChart } from "../../../../components/charts/MuiCharts"
import { marketV2Api } from "../../../../store/api/v2/market"

interface PriceHistoryChartV2Props {
  /** Game item UUID to fetch price history for */
  gameItemId: string
  /** Optional height override (default: 400px) */
  height?: number
  /** Optional width override (default: 100%) */
  width?: string | number
}

/**
 * PriceHistoryChartV2 - Price history chart with quality tier filtering
 * 
 * Displays price trends over time with separate lines for each quality tier.
 * Users can filter which quality tiers are displayed using the dropdown selector.
 * 
 * Requirements: 46.6-46.10
 * - Uses useGetPriceHistoryQuery hook (46.6)
 * - Displays multiple lines for different quality tiers (46.7)
 * - Filters by quality tier (46.8)
 * - Uses ExtendedTheme for colors (46.10)
 * - Maintains visual parity with V1 price charts (46.9)
 */
export function PriceHistoryChartV2({
  gameItemId,
  height = 400,
  width = "100%",
}: PriceHistoryChartV2Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  
  // Quality tier filter state (null = all tiers)
  const [selectedTier, setSelectedTier] = useState<number | null>(null)

  // Fetch price history data from V2 API
  const { data, isLoading, isError } = marketV2Api.useGetPriceHistoryQuery({
    gameItemId,
    qualityTier: selectedTier ?? undefined,
    interval: "day",
  })

  // Transform API data into chart series format
  const chartSeries = useMemo(() => {
    if (!data?.data || data.data.length === 0) {
      return []
    }

    // Group data by quality tier
    const tierMap = new Map<
      number | null,
      Array<{ timestamp: string; avg_price: number }>
    >()

    data.data.forEach((item) => {
      const tier = item.quality_tier ?? null
      if (!tierMap.has(tier)) {
        tierMap.set(tier, [])
      }
      tierMap.get(tier)!.push({
        timestamp: item.timestamp,
        avg_price: item.avg_price,
      })
    })

    // Convert to chart series format with proper labels
    const series: Array<{ name: string; data: Array<{ x: string; y: number }> }> = []

    // Sort tiers for consistent ordering (null/all tiers first, then 1-5)
    const sortedTiers = Array.from(tierMap.keys()).sort((a, b) => {
      if (a === null) return -1
      if (b === null) return 1
      return a - b
    })

    sortedTiers.forEach((tier) => {
      const tierData = tierMap.get(tier)!
      series.push({
        name:
          tier === null
            ? t("market.allTiers", "All Tiers")
            : t("market.tierN", "Tier {{tier}}", { tier }),
        data: tierData.map((d) => ({
          x: d.timestamp,
          y: d.avg_price,
        })),
      })
    })

    return series
  }, [data, t])

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {t("market.loadingPriceHistory", "Loading price history...")}
        </Typography>
      </Box>
    )
  }

  // Error state
  if (isError) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="error">
          {t("market.errorLoadingPriceHistory", "Error loading price history")}
        </Typography>
      </Box>
    )
  }

  // Empty state
  if (chartSeries.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {t("market.noPriceHistory", "No price history available")}
        </Typography>
      </Box>
    )
  }

  return (
    <Stack spacing={2}>
      {/* Quality Tier Filter */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="quality-tier-filter-label">
            {t("market.qualityTier", "Quality Tier")}
          </InputLabel>
          <Select
            labelId="quality-tier-filter-label"
            id="quality-tier-filter"
            value={selectedTier ?? "all"}
            label={t("market.qualityTier", "Quality Tier")}
            onChange={(e) => {
              const value = e.target.value
              setSelectedTier(value === "all" ? null : Number(value))
            }}
          >
            <MenuItem value="all">
              {t("market.allTiers", "All Tiers")}
            </MenuItem>
            <MenuItem value={1}>{t("market.tier1", "Tier 1")}</MenuItem>
            <MenuItem value={2}>{t("market.tier2", "Tier 2")}</MenuItem>
            <MenuItem value={3}>{t("market.tier3", "Tier 3")}</MenuItem>
            <MenuItem value={4}>{t("market.tier4", "Tier 4")}</MenuItem>
            <MenuItem value={5}>{t("market.tier5", "Tier 5")}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Price History Chart */}
      <Box>
        <MuiLineChart
          series={chartSeries}
          height={height}
          width={width}
          xAxisType="time"
          smooth={true}
        />
      </Box>
    </Stack>
  )
}
