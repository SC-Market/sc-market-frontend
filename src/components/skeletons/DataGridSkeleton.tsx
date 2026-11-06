import React from "react"
import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import type { DataGridProps, GridDensity } from "@mui/x-data-grid"
import type { ExtendedTheme } from "../../hooks/styles/Theme"
import { BaseSkeleton } from "./BaseSkeleton"

/** MUI DataGrid's default sizes (dataGridPropsDefaultValues, v8). */
export const DATA_GRID_METRICS = {
  rowHeight: 52,
  columnHeaderHeight: 56,
  /** The footer (pagination) row's min-height */
  footerHeight: 52,
} as const

/** DataGrid scales its row and header heights by the density. */
export const DATA_GRID_DENSITY_FACTOR: Record<GridDensity, number> = {
  compact: 0.7,
  standard: 1,
  comfortable: 1.3,
}

export interface DataGridSkeletonProps {
  /** Body rows */
  rows?: number
  /** Visible columns */
  columns?: number
  /** The grid's rowHeight (before density) */
  rowHeight?: number
  /** The grid's columnHeaderHeight (before density) */
  columnHeaderHeight?: number
  density?: GridDensity
  showHeader?: boolean
  /** The pagination footer (DataGrid's hideFooter=false) */
  showFooter?: boolean
  /**
   * autoHeight grids are as tall as their rows; the others fill their
   * container (height 100%), like the grid.
   */
  autoHeight?: boolean
}

/** Cell placeholder widths: fixed, so the server and client render alike. */
const CELL_WIDTHS = ["80%", "60%", "70%", "50%", "65%", "55%"]

/** Rows a DataGrid shows on its first page. */
function firstPageRows(props: DataGridProps): number {
  const pageSize =
    props.paginationModel?.pageSize ??
    props.initialState?.pagination?.paginationModel?.pageSize ??
    100
  const loaded = props.rows?.length ?? 0
  // Nothing yet (the usual case while the grid's chunk loads): a short page.
  return Math.max(1, Math.min(pageSize, loaded || 5))
}

/**
 * The placeholder shape for a DataGrid with these props: its visible
 * columns, first page of rows, density and footer. LazyDataGrid shows it
 * while the grid's chunk loads, so the box the grid lands in is already the
 * grid's size.
 */
export function dataGridSkeletonProps(
  props: DataGridProps,
): DataGridSkeletonProps {
  const hidden =
    props.columnVisibilityModel ??
    props.initialState?.columns?.columnVisibilityModel ??
    {}
  return {
    rows: firstPageRows(props),
    columns: Math.max(
      1,
      (props.columns ?? []).filter((c) => hidden[c.field] !== false).length,
    ),
    rowHeight: props.rowHeight ?? DATA_GRID_METRICS.rowHeight,
    columnHeaderHeight:
      props.columnHeaderHeight ?? DATA_GRID_METRICS.columnHeaderHeight,
    density: props.density ?? props.initialState?.density ?? "standard",
    showHeader: true,
    showFooter: !props.hideFooter,
    autoHeight: !!props.autoHeight,
  }
}

/**
 * Pixel height of an autoHeight DataGrid with this shape (and so of its
 * skeleton): the 1px frame, header, rows and footer.
 */
export function dataGridSkeletonHeight(p: DataGridSkeletonProps): number {
  const factor = DATA_GRID_DENSITY_FACTOR[p.density ?? "standard"]
  const header =
    p.showHeader === false
      ? 0
      : Math.floor(
          (p.columnHeaderHeight ?? DATA_GRID_METRICS.columnHeaderHeight) *
            factor,
        )
  const row = Math.floor((p.rowHeight ?? DATA_GRID_METRICS.rowHeight) * factor)
  const footer = p.showFooter === false ? 0 : DATA_GRID_METRICS.footerHeight
  return 2 + header + (p.rows ?? 5) * row + footer
}

function GridRowSkeleton(props: {
  columns: number
  height: number
  header?: boolean
  index?: number
  border?: string
}) {
  const { columns, height, header = false, index = 0, border } = props
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 1.25,
        height,
        boxSizing: "border-box",
        borderBottom: border,
      }}
    >
      {Array.from({ length: columns }).map((_, c) => (
        <Box key={c} sx={{ flex: 1, minWidth: 0 }}>
          <BaseSkeleton
            variant="text"
            width={CELL_WIDTHS[(c + index) % CELL_WIDTHS.length]}
            height={header ? 20 : 16}
          />
        </Box>
      ))}
    </Box>
  )
}

/**
 * A DataGrid's loading placeholder: the grid's frame (hairline outline,
 * the theme's radius), header, rows and footer at the grid's own sizes.
 */
export function DataGridSkeleton(props: DataGridSkeletonProps) {
  const {
    rows = 5,
    columns = 4,
    rowHeight = DATA_GRID_METRICS.rowHeight,
    columnHeaderHeight = DATA_GRID_METRICS.columnHeaderHeight,
    density = "standard",
    showHeader = true,
    showFooter = true,
    autoHeight = true,
  } = props
  const theme = useTheme<ExtendedTheme>()
  const factor = DATA_GRID_DENSITY_FACTOR[density]
  // ThemedDataGrid's outline; plain MUI themes (tests) fall back to divider.
  const line = `${theme.borderWidth?.hairline ?? 1}px solid ${theme.palette.outline?.main ?? theme.palette.divider}`
  return (
    <Box
      aria-hidden
      data-skeleton="data-grid"
      sx={{
        width: "100%",
        boxSizing: "border-box",
        border: line,
        borderRadius: `${theme.shape.borderRadius}px`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: autoHeight
          ? dataGridSkeletonHeight({
              rows,
              rowHeight,
              columnHeaderHeight,
              density,
              showHeader,
              showFooter,
            })
          : "100%",
      }}
    >
      {showHeader && (
        <GridRowSkeleton
          columns={columns}
          height={Math.floor(columnHeaderHeight * factor)}
          header
          border={line}
        />
      )}
      <Box sx={{ flex: 1 }}>
        {Array.from({ length: rows }).map((_, r) => (
          <GridRowSkeleton
            key={r}
            columns={columns}
            index={r + 1}
            height={Math.floor(rowHeight * factor)}
            border={r < rows - 1 ? line : undefined}
          />
        ))}
      </Box>
      {showFooter && (
        <Box
          sx={{
            height: DATA_GRID_METRICS.footerHeight,
            flex: "none",
            boxSizing: "border-box",
            borderTop: line,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: 1.25,
          }}
        >
          <BaseSkeleton variant="rounded" width={180} height={28} />
        </Box>
      )}
    </Box>
  )
}
