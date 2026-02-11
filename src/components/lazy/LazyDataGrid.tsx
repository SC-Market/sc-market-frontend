import React, { lazy, Suspense } from "react"
import { DataGridProps } from "@mui/x-data-grid"
import { DataGridSkeleton } from "../skeletons/DataGridSkeleton"

const DataGrid = lazy(() =>
  import("@mui/x-data-grid").then((module) => ({ default: module.DataGrid }))
)

export function LazyDataGrid(props: DataGridProps) {
  return (
    <Suspense fallback={<DataGridSkeleton />}>
      <DataGrid {...props} />
    </Suspense>
  )
}
