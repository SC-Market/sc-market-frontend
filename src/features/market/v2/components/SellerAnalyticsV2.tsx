import React, { useMemo } from "react"
import { Box, Grid, Typography, useTheme } from "@mui/material"
import { useTranslation } from "react-i18next"
import { Section } from "../../../../components/paper/Section"
import { MuiBarChart, MuiLineChart } from "../../../../components/charts/MuiCharts"
import { marketV2Api } from "../../../../store/api/v2/market"
import type { ExtendedTheme } from "../../../../hooks/styles/Theme"

interface SellerAnalyticsV2Props {
  /** Optional seller ID (defaults to current user) */
  sellerId?: string
}

/**
 * SellerAnalyticsV2 - Seller analytics dashboard with quality tier breakdown
 *
 * Displays comprehensive seller analytics including:
 * - Sales volume by quality tier
 * - Average sale price by quality tier
 * - Time-to-sale by quality tier
 * - Quality tier distribution of current inventory
 * - Price premium percentage for higher quality tiers
 *
 * Requirements: 48.7-48.10
 * - Uses useGetSellerStatsQuery hook (48.9)
 * - Displays sales volume by quality tier (48.2)
 * - Displays average sale price by quality tier (48.3)
 * - Displays time-to-sale by quality tier (48.4)
 * - Displays quality tier distribution of current inventory (48.5)
 * - Calculates price premium percentage for higher quality tiers (48.6)
 * - Maintains visual parity with V1 analytics (48.8)
 */
export function SellerAnalyticsV2({ sellerId }: SellerAnalyticsV2Props) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  // Fetch seller stats from V2 API
  const { data, isLoading, isError } = marketV2Api.useGetSellerStatsQuery({
    sellerId,
  })

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

  // Transform sales volume data for chart
  const salesVolumeData = useMemo(() => {
    if (!data?.sales_by_quality || data.sales_by_quality.length === 0) {
      return []
    }

    return [
      {
        name: t("market.salesVolume", "Sales Volume"),
        data: data.sales_by_quality.map((item) => ({
          x: getTierName(item.quality_tier),
          y: item.volume,
        })),
      },
    ]
  }, [data, t])

  // Transform average sale price data for chart
  const avgSalePriceData = useMemo(() => {
    if (!data?.sales_by_quality || data.sales_by_quality.length === 0) {
      return []
    }

    return [
      {
        name: t("market.avgSalePrice", "Average Sale Price"),
        data: data.sales_by_quality.map((item) => ({
          x: getTierName(item.quality_tier),
          y: item.avg_price,
        })),
      },
    ]
  }, [data, t])

  // Transform time-to-sale data for chart
  const timeToSaleData = useMemo(() => {
    if (!data?.sales_by_quality || data.sales_by_quality.length === 0) {
      return []
    }

    return [
      {
        name: t("market.avgTimeToSale", "Average Time to Sale (hours)"),
        data: data.sales_by_quality.map((item) => ({
          x: getTierName(item.quality_tier),
          y: item.avg_time_to_sale_hours,
        })),
      },
    ]
  }, [data, t])

  // Transform inventory distribution data for chart
  const inventoryDistributionData = useMemo(() => {
    if (
      !data?.inventory_distribution ||
      data.inventory_distribution.length === 0
    ) {
      return []
    }

    return [
      {
        name: t("market.quantityAvailable", "Quantity Available"),
        data: data.inventory_distribution.map((item) => ({
          x: getTierName(item.quality_tier),
          y: item.quantity_available,
        })),
      },
    ]
  }, [data, t])

  // Transform price premium data for chart
  const pricePremiumData = useMemo(() => {
    if (!data?.price_premiums || data.price_premiums.length === 0) {
      return []
    }

    return [
      {
        name: t("market.pricePremium", "Price Premium (%)"),
        data: data.price_premiums.map((item) => ({
          x: getTierName(item.quality_tier),
          y: item.premium_percentage,
        })),
      },
    ]
  }, [data, t])

  // Loading state
  if (isLoading) {
    return (
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {t("market.loadingSellerStats", "Loading seller analytics...")}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    )
  }

  // Error state
  if (isError) {
    return (
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="error">
              {t(
                "market.errorLoadingSellerStats",
                "Error loading seller analytics"
              )}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    )
  }

  // Empty state
  if (
    !data ||
    (data.sales_by_quality.length === 0 &&
      data.inventory_distribution.length === 0)
  ) {
    return (
      <Grid container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {t(
                "market.noSellerStats",
                "No seller analytics data available"
              )}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      {/* Sales Volume by Quality Tier */}
      {salesVolumeData.length > 0 && (
        <Section
          xs={12}
          lg={6}
          title={t(
            "market.salesVolumeByQualityTier",
            "Sales Volume by Quality Tier"
          )}
        >
          <Grid item xs={12}>
            <MuiBarChart
              series={salesVolumeData}
              height={400}
              xAxisType="category"
            />
          </Grid>
        </Section>
      )}

      {/* Average Sale Price by Quality Tier */}
      {avgSalePriceData.length > 0 && (
        <Section
          xs={12}
          lg={6}
          title={t(
            "market.avgSalePriceByQualityTier",
            "Average Sale Price by Quality Tier"
          )}
        >
          <Grid item xs={12}>
            <MuiBarChart
              series={avgSalePriceData}
              height={400}
              xAxisType="category"
            />
          </Grid>
        </Section>
      )}

      {/* Time to Sale by Quality Tier */}
      {timeToSaleData.length > 0 && (
        <Section
          xs={12}
          lg={6}
          title={t(
            "market.timeToSaleByQualityTier",
            "Time to Sale by Quality Tier"
          )}
        >
          <Grid item xs={12}>
            <MuiLineChart
              series={timeToSaleData}
              height={400}
              xAxisType="category"
              smooth={true}
            />
          </Grid>
        </Section>
      )}

      {/* Current Inventory Distribution */}
      {inventoryDistributionData.length > 0 && (
        <Section
          xs={12}
          lg={6}
          title={t(
            "market.inventoryDistributionByQualityTier",
            "Current Inventory Distribution"
          )}
        >
          <Grid item xs={12}>
            <MuiBarChart
              series={inventoryDistributionData}
              height={400}
              xAxisType="category"
            />
          </Grid>
        </Section>
      )}

      {/* Price Premium Percentage */}
      {pricePremiumData.length > 0 && (
        <Section
          xs={12}
          title={t(
            "market.pricePremiumByQualityTier",
            "Price Premium by Quality Tier"
          )}
        >
          <Grid item xs={12}>
            <MuiLineChart
              series={pricePremiumData}
              height={400}
              xAxisType="category"
              smooth={true}
            />
          </Grid>
        </Section>
      )}
    </>
  )
}
