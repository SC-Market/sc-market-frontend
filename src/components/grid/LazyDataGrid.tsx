import { lazy, Suspense } from "react"
import { Skeleton } from "@mui/material"
import type { DataGridProps } from "@mui/x-data-grid"

const DataGrid = lazy(() =>
  import("@mui/x-data-grid").then((m) => ({ default: m.DataGrid }))
)

export function LazyDataGrid(props: DataGridProps) {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
      <DataGrid {...props} />
    </Suspense>
  )
}
