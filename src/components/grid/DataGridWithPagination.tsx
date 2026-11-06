import React from "react"
import { DataGrid, type DataGridProps } from "@mui/x-data-grid"
import { GridNumberedPagination } from "./GridNumberedPagination"

/**
 * MUI's DataGrid with the app's numbered pagination in its footer. Loaded
 * lazily (with the grid itself) by LazyDataGrid.
 */
export default function DataGridWithPagination(props: DataGridProps) {
  return (
    <DataGrid
      {...props}
      slots={{ pagination: GridNumberedPagination, ...props.slots }}
    />
  )
}
