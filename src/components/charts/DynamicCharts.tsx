import React from "react"
import { Box, CircularProgress, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"

// Loading component for charts
const ChartLoadingFallback = ({ label }: { label?: string }) => {
  const { t } = useTranslation()
  return (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight={300}
    p={3}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
      {label ?? t("appUi.charts.loadingChart")}
    </Typography>
  </Box>
  )
}

// Dynamic KlineCharts utilities
export const useDynamicKlineCharts = () => {
  const [klineCharts, setKlineCharts] = React.useState<
    typeof import("klinecharts") | null
  >(null)
  const [loading, setLoading] = React.useState(false)

  const loadKlineCharts = React.useCallback(async () => {
    if (klineCharts) return klineCharts

    setLoading(true)
    try {
      const kline = await import("klinecharts")
      setKlineCharts(kline)
      return kline
    } catch (error) {
      console.error("Failed to load klinecharts:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [klineCharts])

  return {
    klineCharts,
    loadKlineCharts,
    loading,
  }
}

// KlineChart wrapper component
export const DynamicKlineChart = ({
  onInit,
  onDispose,
  children,
  ...props
}: {
  onInit?: (kline: typeof import("klinecharts")) => void
  onDispose?: (kline: typeof import("klinecharts")) => void
  children?: (
    kline: typeof import("klinecharts"),
    loading: boolean,
  ) => React.ReactNode
}) => {
  const { t } = useTranslation()
  const { klineCharts, loadKlineCharts, loading } = useDynamicKlineCharts()

  React.useEffect(() => {
    loadKlineCharts().then((kline) => {
      if (onInit) onInit(kline)
    })

    return () => {
      if (klineCharts && onDispose) {
        onDispose(klineCharts)
      }
    }
  }, [loadKlineCharts, onInit, onDispose, klineCharts])

  if (loading || !klineCharts) {
    return <ChartLoadingFallback label={t("appUi.charts.loadingPriceChart")} />
  }

  return children ? children(klineCharts, loading) : null
}
