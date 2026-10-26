/**
 * DashboardGrid — renders the widgets in a responsive react-grid-layout. Layout
 * changes (drag/resize) are written back into the DashboardConfig. Read-only mode
 * disables dragging/resizing and hides remove controls.
 */

import { useMemo, useRef, useState } from "react"
import { Responsive, WidthProvider, type Layout } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { Box } from "@mui/material"
import { WidgetWrapper } from "./widgets/WidgetWrapper"
import { getWidgetDefinition, widgetMinSize } from "./widgets/registry"
import { BASE_COLS, reflowLayout } from "./reflowLayout"
import {
  DASHBOARD_BREAKPOINTS,
  DASHBOARD_COLS,
  DASHBOARD_GRID_MARGIN,
  DASHBOARD_ROW_HEIGHT,
} from "./gridConstants"
import type { DashboardConfig, DashboardWidget } from "./types"

const ResponsiveGridLayout = WidthProvider(Responsive)

const COLS = DASHBOARD_COLS
const BREAKPOINTS = DASHBOARD_BREAKPOINTS
const ROW_HEIGHT = DASHBOARD_ROW_HEIGHT

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
  // Only widgets the registry knows render anything. Unknown types stay in the
  // saved config untouched, but get no grid cell, so they leave no blank gap.
  const renderable = useMemo(
    () => config.widgets.filter((w) => getWidgetDefinition(w.type)),
    [config.widgets],
  )
  // Widgets in reading order for the stacked (phone) layout.
  const stackedWidgets = useMemo(
    () => (stacked ? [...renderable].sort(byLayoutOrder) : []),
    [stacked, renderable],
  )
  const layout = useMemo<Layout[]>(
    () =>
      renderable.map((w) => {
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
    [renderable],
  )
  // The saved layout is authored in 12 columns and used as-is on lg/md. Narrower
  // breakpoints get a reflowed copy that fills each row instead of leaving gaps.
  const layouts = useMemo(
    () => ({
      lg: layout,
      md: layout,
      sm: reflowLayout(layout, COLS.sm),
      xs: reflowLayout(layout, COLS.xs),
      xxs: reflowLayout(layout, COLS.xxs),
    }),
    [layout],
  )

  // Columns of the active breakpoint. Drag/resize edits are only meaningful (and
  // only written back) in the 12-column layout the config is saved in; the
  // reflowed narrow layouts are derived, never persisted. The ref is read by
  // handleLayoutChange, which RGL calls right after a breakpoint change.
  const [cols, setCols] = useState<number>(COLS.lg)
  const colsRef = useRef<number>(COLS.lg)
  const handleColsChange = (next: number) => {
    colsRef.current = next
    setCols(next)
  }
  const canArrange = editing && cols === BASE_COLS

  const handleLayoutChange = (next: Layout[]) => {
    if (!editing || colsRef.current !== BASE_COLS) return
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
              // The card fills the slot: full width even when its content is
              // narrow, and full height (height:auto lets the flex stretch apply;
              // the wrapper's height:100% can't resolve against a min-height).
              // Doubled "&&" so this outranks the wrapper's own height rule.
              "&& > *": { flex: 1, minWidth: 0, height: "auto" },
            }}
          >
            <WidgetWrapper widget={widget} editing={false} fitCell={false} />
          </Box>
        ))}
      </Box>
    )
  }

  return (
    <ResponsiveGridLayout
      className="dashboard-grid"
      layouts={layouts}
      cols={COLS}
      breakpoints={BREAKPOINTS}
      rowHeight={ROW_HEIGHT}
      isDraggable={canArrange}
      isResizable={canArrange}
      draggableHandle=".dashboard-widget-drag-handle"
      onBreakpointChange={(_breakpoint, nextCols) => handleColsChange(nextCols)}
      onWidthChange={(_width, _margin, nextCols) => handleColsChange(nextCols)}
      onLayoutChange={handleLayoutChange}
      margin={[DASHBOARD_GRID_MARGIN, DASHBOARD_GRID_MARGIN]}
    >
      {renderable.map((widget) => (
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
