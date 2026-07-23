/**
 * DashboardGrid — renders the widgets in a responsive react-grid-layout. Layout
 * changes (drag/resize) are written back into the DashboardConfig. Read-only mode
 * disables dragging/resizing and hides remove controls.
 */

import { useMemo } from "react"
import { Responsive, WidthProvider, type Layout } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { Box } from "@mui/material"
import { WidgetWrapper } from "./widgets/WidgetWrapper"
import { widgetMinSize } from "./widgets/registry"
import type { DashboardConfig, DashboardWidget } from "./types"

const ResponsiveGridLayout = WidthProvider(Responsive)

const COLS = { lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
const ROW_HEIGHT = 80

export interface DashboardGridProps {
  config: DashboardConfig
  editing: boolean
  onConfigChange: (next: DashboardConfig) => void
  /**
   * When true, render a single-column read-only stack instead of the draggable
   * grid. Used on phones, where touch drag/resize is awkward and the auto-derived
   * multi-column layout feels arbitrary.
   */
  stacked?: boolean
}

/** Reading order for the stacked layout: top-to-bottom, then left-to-right. */
function byLayoutOrder(a: DashboardWidget, b: DashboardWidget): number {
  return a.layout.y - b.layout.y || a.layout.x - b.layout.x
}

export function DashboardGrid({
  config,
  editing,
  onConfigChange,
  stacked = false,
}: DashboardGridProps) {
  // Widgets in reading order for the stacked (phone) layout.
  const stackedWidgets = useMemo(
    () => (stacked ? [...config.widgets].sort(byLayoutOrder) : []),
    [stacked, config.widgets],
  )
  const layout = useMemo<Layout[]>(
    () =>
      config.widgets.map((w) => {
        const min = widgetMinSize(w.type)
        return {
          i: w.id,
          x: w.layout.x,
          y: w.layout.y,
          w: w.layout.w,
          h: w.layout.h,
          minW: min.w,
          minH: min.h,
        }
      }),
    [config.widgets],
  )

  const handleLayoutChange = (next: Layout[]) => {
    if (!editing) return
    const byId = new Map(next.map((l) => [l.i, l]))
    let changed = false
    const widgets = config.widgets.map((w) => {
      const l = byId.get(w.id)
      if (!l) return w
      if (
        l.x === w.layout.x &&
        l.y === w.layout.y &&
        l.w === w.layout.w &&
        l.h === w.layout.h
      ) {
        return w
      }
      changed = true
      return { ...w, layout: { x: l.x, y: l.y, w: l.w, h: l.h } }
    })
    if (changed) onConfigChange({ ...config, widgets })
  }

  const handleRemove = (id: string) => {
    onConfigChange({
      ...config,
      widgets: config.widgets.filter((w) => w.id !== id),
    })
  }

  if (stacked) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {stackedWidgets.map((widget) => (
          <Box
            key={widget.id}
            sx={{
              // Give each stacked widget a min height proportional to its saved
              // grid height so charts/tables aren't crushed, but let content grow.
              minHeight: widget.layout.h * ROW_HEIGHT,
              display: "flex",
            }}
          >
            <WidgetWrapper widget={widget} editing={false} />
          </Box>
        ))}
      </Box>
    )
  }

  return (
    <ResponsiveGridLayout
      className="dashboard-grid"
      layouts={{ lg: layout }}
      cols={COLS}
      breakpoints={BREAKPOINTS}
      rowHeight={ROW_HEIGHT}
      isDraggable={editing}
      isResizable={editing}
      draggableHandle=".dashboard-widget-drag-handle"
      onLayoutChange={handleLayoutChange}
      margin={[16, 16]}
    >
      {config.widgets.map((widget) => (
        <div key={widget.id}>
          <WidgetWrapper
            widget={widget}
            editing={editing}
            onRemove={handleRemove}
          />
        </div>
      ))}
    </ResponsiveGridLayout>
  )
}
