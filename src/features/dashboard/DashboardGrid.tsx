/**
 * DashboardGrid — renders the widgets in a responsive react-grid-layout. Layout
 * changes (drag/resize) are written back into the DashboardConfig. Read-only mode
 * disables dragging/resizing and hides remove controls.
 */

import { useMemo } from "react"
import { Responsive, WidthProvider, type Layout } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { WidgetWrapper } from "./widgets/WidgetWrapper"
import { widgetMinSize } from "./widgets/registry"
import type { DashboardConfig } from "./types"

const ResponsiveGridLayout = WidthProvider(Responsive)

const COLS = { lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
const ROW_HEIGHT = 80

export interface DashboardGridProps {
  config: DashboardConfig
  editing: boolean
  onConfigChange: (next: DashboardConfig) => void
}

export function DashboardGrid({
  config,
  editing,
  onConfigChange,
}: DashboardGridProps) {
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
