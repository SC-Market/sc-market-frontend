/**
 * Placeholder for the dashboard grid while the page or its saved layout loads.
 * Draws one skeleton card per widget of a config, at the cell react-grid-layout
 * will give that widget: same columns per container width, row height, margin
 * and narrow-width reflow (gridConstants + reflowLayout), or the phone stack.
 *
 * Kept free of the widget registry (which pulls in every widget's view), so it
 * can be used by the route skeleton in the entry bundle.
 */
import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { Box, Skeleton } from "@mui/material"
import { reflowLayout } from "./reflowLayout"
import {
  DASHBOARD_GRID_MARGIN,
  DASHBOARD_ROW_HEIGHT,
  dashboardColsForWidth,
} from "./gridConstants"
import type { DashboardConfig } from "./types"

export function DashboardGridSkeleton({
  config,
  stacked = false,
}: {
  config: DashboardConfig
  stacked?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.offsetWidth)
    const observer = new ResizeObserver(() => setWidth(el.offsetWidth))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const cols = width === null ? null : dashboardColsForWidth(width)
  const items = useMemo(() => {
    const layout = config.widgets.map((w) => ({ i: w.id, ...w.layout }))
    return cols === null ? [] : reflowLayout(layout, cols)
  }, [config.widgets, cols])

  if (stacked) {
    const ordered = [...config.widgets].sort(
      (a, b) => a.layout.y - b.layout.y || a.layout.x - b.layout.x,
    )
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {ordered.map((widget) => (
          <Skeleton
            key={widget.id}
            variant="rounded"
            sx={{ height: widget.layout.h * DASHBOARD_ROW_HEIGHT }}
          />
        ))}
      </Box>
    )
  }

  return (
    <Box
      ref={ref}
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols ?? 1}, minmax(0, 1fr))`,
        gridAutoRows: `${DASHBOARD_ROW_HEIGHT}px`,
        gap: `${DASHBOARD_GRID_MARGIN}px`,
        padding: `${DASHBOARD_GRID_MARGIN}px`,
      }}
    >
      {items.map((item) => (
        <Skeleton
          key={item.i}
          variant="rounded"
          sx={{
            height: "100%",
            gridColumn: `${item.x + 1} / span ${item.w}`,
            gridRow: `${item.y + 1} / span ${item.h}`,
          }}
        />
      ))}
    </Box>
  )
}
