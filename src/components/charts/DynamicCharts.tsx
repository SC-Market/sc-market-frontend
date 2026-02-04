import React, { Suspense } from "react"
import { Box, CircularProgress, Typography } from "@mui/material"
import { createDynamicImport } from "../../util/dynamicImports"

// Loading component for charts
const ChartLoadingFallback = ({ title }: { title?: string }) => (
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
      {title ? `Loading ${title}...` : "Loading chart..."}
    </Typography>
  </Box>
)

// Dynamic ApexCharts component
const ApexChartComponent = React.lazy(async () => {
  const [{ default: Chart }, { default: ApexCharts }] = await Promise.all([
    import("react-apexcharts"),
    import("apexcharts"),
  ])

  return {
    default: Chart,
  }
})

export const DynamicApexChart = (props: Record<string, unknown>) => (
  <Suspense fallback={<ChartLoadingFallback title="chart" />}>
    <ApexChartComponent {...props} />
  </Suspense>
)

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
    return <ChartLoadingFallback title="price chart" />
  }

  return children ? children(klineCharts, loading) : null
}
