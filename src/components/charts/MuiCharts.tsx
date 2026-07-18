import React from "react"
import { LineChart } from "@mui/x-charts/LineChart"
import { BarChart } from "@mui/x-charts/BarChart"

interface DataPoint {
  x: string | Date | number
  y: number
}

interface Series {
  name: string
  data: DataPoint[]
  yAxisKey?: string
}

interface MuiLineChartProps {
  series: Series[]
  height?: number
  width?: string | number
  xAxisType?: "time" | "category"
  yAxisLabel?: string
  smooth?: boolean
  yScaleType?: "linear" | "log"
}

export function MuiLineChart({
  series,
  height = 400,
  width = "100%",
  xAxisType = "time",
  yAxisLabel,
  smooth = true,
  yScaleType = "linear",
}: MuiLineChartProps) {
  const xData = series[0]?.data.map((d) =>
    xAxisType === "time" ? new Date(d.x) : d.x,
  )

  const seriesData = series.map((s) => ({
    label: s.name,
    data: s.data.map((d) => d.y),
    curve: "linear" as const,
    showMark: false,
  }))

  return (
    <LineChart
      xAxis={[
        {
          data: xData,
          scaleType: xAxisType === "time" ? "time" : "point",
          valueFormatter:
            xAxisType === "time"
              ? (value: Date | number | string) =>
                  new Date(value).toLocaleDateString()
              : (value: Date | number | string) => Math.round(Number(value)).toLocaleString(),
        },
      ]}
      yAxis={[
        {
          scaleType: yScaleType,
          valueFormatter: (value: number) => Math.round(value).toLocaleString(),
        },
      ]}
      series={seriesData}
      height={height}
      sx={{
        width: width === "100%" ? "100%" : width,
        "& .MuiLineElement-root": {
          strokeWidth: 2,
        },
      }}
    />
  )
}

interface MuiAreaChartProps extends MuiLineChartProps {
  gradient?: boolean
  rightYAxis?: boolean
  colors?: string[]
  xTickInterval?: number  // show every Nth x tick label (default: show all)
  xValueFormatter?: (value: Date | number | string) => string
}

export function MuiAreaChart({
  series,
  height = 400,
  width = "100%",
  xAxisType = "time",
  yAxisLabel,
  smooth = true,
  gradient = true,
  rightYAxis = false,
  colors,
  xTickInterval,
  xValueFormatter,
}: MuiAreaChartProps) {
  const xData = series[0]?.data.map((d) =>
    xAxisType === "time" ? new Date(d.x) : d.x,
  )

  const seriesData = series.map((s) => ({
    label: s.name,
    data: s.data.map((d) => d.y),
    curve: "linear" as const,
    showMark: false,
    area: true,
    yAxisKey: s.yAxisKey,
  }))

  const yAxisConfig = rightYAxis
    ? [
        {
          id: "leftAxis",
          valueFormatter: (value: number) => Math.round(value).toLocaleString(),
        },
        {
          id: "rightAxis",
          valueFormatter: (value: number) => Math.round(value).toLocaleString(),
        },
      ]
    : [
        {
          valueFormatter: (value: number) => Math.round(value).toLocaleString(),
        },
      ]

  const defaultXFormatter =
    xAxisType === "time"
      ? (value: Date | number | string) => new Date(value).toLocaleDateString()
      : (value: Date | number | string) => String(value)  // category labels are already formatted strings

  return (
    <LineChart
      xAxis={[
        {
          data: xData,
          scaleType: xAxisType === "time" ? "time" : "point",
          valueFormatter: xValueFormatter ?? defaultXFormatter,
          ...(xTickInterval != null ? { tickInterval: (_: unknown, index: number) => index % xTickInterval === 0 } : {}),
        },
      ]}
      yAxis={yAxisConfig}
      series={seriesData}
      height={height}
      colors={colors}
      sx={{
        width: width === "100%" ? "100%" : width,
        "& .MuiLineElement-root": {
          strokeWidth: 2,
        },
        "& .MuiAreaElement-root": {
          fillOpacity: gradient ? 0.3 : 0.5,
        },
      }}
    />
  )
}

interface MuiBarChartProps {
  series: Series[]
  height?: number
  width?: string | number
  xAxisType?: "time" | "category"
  yAxisLabel?: string
  colors?: string[]
  xValueFormatter?: (value: Date | number | string) => string
}

export function MuiBarChart({
  series,
  height = 400,
  width = "100%",
  xAxisType = "time",
  yAxisLabel,
  colors,
  xValueFormatter,
}: MuiBarChartProps) {
  const xData = series[0]?.data.map((d) =>
    xAxisType === "time" ? new Date(d.x) : d.x,
  )

  const seriesData = series.map((s) => ({
    label: s.name,
    data: s.data.map((d) => d.y),
  }))

  // For band scale (category), don't set a formatter — MUI renders string labels natively.
  // Only time scale needs an explicit formatter.
  const xFormatter =
    xValueFormatter ??
    (xAxisType === "time"
      ? (value: Date | number | string) => new Date(value).toLocaleDateString()
      : undefined)

  return (
    <BarChart
      xAxis={[
        {
          data: xData,
          scaleType: xAxisType === "time" ? "time" : "band",
          ...(xFormatter != null ? { valueFormatter: xFormatter } : {}),
        },
      ]}
      yAxis={[
        {
          valueFormatter: (value: number) => Math.round(value).toLocaleString(),
        },
      ]}
      series={seriesData}
      height={height}
      colors={colors}
      sx={{
        width: width === "100%" ? "100%" : width,
      }}
    />
  )
}
