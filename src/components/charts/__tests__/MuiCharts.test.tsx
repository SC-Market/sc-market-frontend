import "../../../util/i18n"
import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { MuiAreaChart, MuiBarChart, MuiLineChart } from "../MuiCharts"

const series = [
  {
    name: "Price",
    data: [
      { x: "A", y: 10 },
      { x: "B", y: 20 },
    ],
  },
]

describe("MuiCharts yAxisLabel", () => {
  it.each([
    ["line", MuiLineChart],
    ["area", MuiAreaChart],
    ["bar", MuiBarChart],
  ] as const)("the %s chart labels its y axis", (_, Chart) => {
    render(
      <Chart
        series={series}
        xAxisType="category"
        height={300}
        width={400}
        yAxisLabel="aUEC"
      />,
    )
    expect(screen.getByText("aUEC")).toBeInTheDocument()
  })
})
