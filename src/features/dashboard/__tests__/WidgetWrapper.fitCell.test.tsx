import React from "react"
import { render, screen } from "@testing-library/react"
import { Grid, Paper } from "@mui/material"
import { describe, expect, it, vi } from "vitest"
import { WidgetWrapper } from "../widgets/WidgetWrapper"
import type { DashboardWidget } from "../types"

// A self-chromed widget shaped like the table widgets (a Section: Grid item >
// Paper) whose content is taller and wider than its cell.
vi.mock("../widgets/registry", () => ({
  getWidgetDefinition: () => ({
    type: "offers",
    selfChrome: true,
    render: () => (
      <Grid item xs={12}>
        <Paper data-testid="card">
          <div style={{ width: 900, height: 900 }}>table</div>
        </Paper>
      </Grid>
    ),
  }),
  widgetTitle: () => "Offers",
}))

vi.mock("../useResolveScope", () => ({
  useResolveScope: () => ({ label: "", unavailable: false }),
}))

const widget = {
  id: "w1",
  type: "offers",
  scope: { kind: "me" },
  layout: { x: 0, y: 0, w: 6, h: 5 },
} as DashboardWidget

// Regression: on /dashboard/overview the Offers / Assignments / Notifications
// cards ran past the bottom of their grid cell (saved heights smaller than the
// table) and overflowed sideways on narrow grids. In a grid cell the card is
// now sized to the cell and scrolls its content itself.
describe("WidgetWrapper self-chromed card sizing", () => {
  it("sizes the card to the grid cell and scrolls inside it", () => {
    render(<WidgetWrapper widget={widget} editing={false} />)
    const card = getComputedStyle(screen.getByTestId("card"))
    expect(card.overflow).toBe("auto")
    expect(card.minHeight).toBe("0")
    expect(card.minWidth).toBe("0")
    expect(card.flex).toMatch(/^1 1 0(px)?$/)
    const gridItem = getComputedStyle(screen.getByTestId("card").parentElement!)
    expect(gridItem.minHeight).toBe("0")
    expect(gridItem.flex).toMatch(/^1 1 0(px)?$/)
  })

  it("lets the card grow with its content in the stacked (phone) layout", () => {
    render(<WidgetWrapper widget={widget} editing={false} fitCell={false} />)
    const card = getComputedStyle(screen.getByTestId("card"))
    expect(card.overflow).not.toBe("auto")
    expect(card.flex).toBe("1 0 auto")
  })
})
