import React, { useMemo } from "react"
import { Alert, Box, Chip } from "@mui/material"
import { useTranslation } from "react-i18next"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import TrendingDownIcon from "@mui/icons-material/TrendingDown"
import { useGetOrCreateAggregateQuery } from "../api/marketApi"

interface PriceComparisonAlertProps {
  gameItemId: string | null
  currentPrice: number
}

export function PriceComparisonAlert({
  gameItemId,
  currentPrice,
}: PriceComparisonAlertProps) {
  const { t } = useTranslation()
  const { data: aggregate } = useGetOrCreateAggregateQuery(gameItemId || "", {
    skip: !gameItemId || currentPrice <= 0,
  })

  const priceComparison = useMemo(() => {
    if (!aggregate?.listings.length || currentPrice <= 0) return null

    const prices = aggregate.listings.map((l) => l.price)
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const minPrice = Math.min(...prices)
    const percentVsAvg = ((currentPrice - avgPrice) / avgPrice) * 100

    return {
      avgPrice,
      minPrice,
      percentVsAvg,
      isBelowAvg: currentPrice < avgPrice,
      isLowest: currentPrice === minPrice,
    }
  }, [aggregate, currentPrice])

  if (!priceComparison) return null

  const isSignificant = Math.abs(priceComparison.percentVsAvg) > 15

  return (
    <Alert
      severity={
        priceComparison.isBelowAvg
          ? "success"
          : isSignificant
            ? "warning"
            : "info"
      }
      sx={{ mt: 1 }}
    >
      <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
        <Chip
          icon={
            priceComparison.isBelowAvg ? (
              <TrendingDownIcon />
            ) : (
              <TrendingUpIcon />
            )
          }
          label={`${priceComparison.percentVsAvg > 0 ? "+" : ""}${priceComparison.percentVsAvg.toFixed(1)}% vs Avg (${priceComparison.avgPrice.toLocaleString()} aUEC)`}
          color={priceComparison.isBelowAvg ? "success" : "default"}
          size="small"
        />
        <Chip
          label={`Lowest: ${priceComparison.minPrice.toLocaleString()} aUEC`}
          color={priceComparison.isLowest ? "success" : "default"}
          size="small"
        />
      </Box>
    </Alert>
  )
}
