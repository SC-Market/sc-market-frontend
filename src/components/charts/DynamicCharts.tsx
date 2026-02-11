import React, { Suspense } from "react"
import { createDynamicImport } from "../../util/dynamicImports"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import ReportIcon from '@mui/icons-material/Report';
import KeyboardArrowLeftRounded from '@mui/icons-material/KeyboardArrowLeftRounded';

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
