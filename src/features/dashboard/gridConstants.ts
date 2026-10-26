/**
 * react-grid-layout settings of the dashboard grid, shared by DashboardGrid
 * and DashboardGridSkeleton so the placeholder cells land where the widgets
 * will.
 */
import { BASE_COLS } from "./reflowLayout"

export const DASHBOARD_COLS = {
  lg: BASE_COLS,
  md: BASE_COLS,
  sm: 6,
  xs: 4,
  xxs: 2,
}
/** Container widths (px) at which each column count starts. */
export const DASHBOARD_BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
}
export const DASHBOARD_ROW_HEIGHT = 80
/** Gap between cells and padding around the grid (RGL margin + containerPadding). */
export const DASHBOARD_GRID_MARGIN = 16

/** Column count react-grid-layout picks for a grid of this width. */
export function dashboardColsForWidth(width: number): number {
  const order = ["lg", "md", "sm", "xs", "xxs"] as const
  for (const bp of order) {
    if (width >= DASHBOARD_BREAKPOINTS[bp]) return DASHBOARD_COLS[bp]
  }
  return DASHBOARD_COLS.xxs
}
