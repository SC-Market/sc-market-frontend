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
}

interface MuiLineChartProps {
  series: Series[]
  height?: number
  width?: string | number
  xAxisType?: "time" | "category"
  yAxisLabel?: string
  smooth?: boolean
}

export function MuiLineChart({
  series,
  height = 400,
  width = "100%",
  xAxisType = "time",
  yAxisLabel,
  smooth = true,
}: MuiLineChartProps) {
  const xData = series[0]?.data.map((d) =>
    xAxisType === "time" ? new Date(d.x) : d.x,
  )

  const seriesData = series.map((s) => ({
    label: s.name,
    data: s.data.map((d) => d.y),
    curve: smooth ? ("natural" as const) : ("linear" as const),
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
              : undefined,
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
}

export function MuiAreaChart({
  series,
  height = 400,
  width = "100%",
  xAxisType = "time",
  yAxisLabel,
  smooth = true,
  gradient = true,
}: MuiAreaChartProps) {
  const xData = series[0]?.data.map((d) =>
    xAxisType === "time" ? new Date(d.x) : d.x,
  )

  const seriesData = series.map((s) => ({
    label: s.name,
    data: s.data.map((d) => d.y),
    curve: smooth ? ("natural" as const) : ("linear" as const),
    showMark: false,
    area: true,
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
              : undefined,
        },
      ]}
      series={seriesData}
      height={height}
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
}

export function MuiBarChart({
  series,
  height = 400,
  width = "100%",
  xAxisType = "time",
  yAxisLabel,
}: MuiBarChartProps) {
  const xData = series[0]?.data.map((d) =>
    xAxisType === "time" ? new Date(d.x) : d.x,
  )

  const seriesData = series.map((s) => ({
    label: s.name,
    data: s.data.map((d) => d.y),
  }))

  return (
    <BarChart
      xAxis={[
        {
          data: xData,
          scaleType: xAxisType === "time" ? "time" : "band",
          valueFormatter:
            xAxisType === "time"
              ? (value: Date | number | string) =>
                  new Date(value).toLocaleDateString()
              : undefined,
        },
      ]}
      series={seriesData}
      height={height}
      sx={{
        width: width === "100%" ? "100%" : width,
      }}
    />
  )
}
