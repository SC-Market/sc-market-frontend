import { Suspense, useEffect, useState } from "react"
import type { DataGridProps } from "@mui/x-data-grid"
import type { enUS } from "@mui/x-data-grid/locales"
import { getMuiDataGridLocale } from "../../util/i18n"
import { useTranslation } from "react-i18next"
import { lazyWithRetry } from "../../util/lazyWithRetry"
import {
  DataGridSkeleton,
  dataGridSkeletonProps,
} from "../skeletons/DataGridSkeleton"

/** A DataGrid locale (the package doesn't export the type from a public path). */
type Localization = typeof enUS

const DataGrid = lazyWithRetry(() => import("./DataGridWithPagination"))

export function LazyDataGrid(props: DataGridProps) {
  const { i18n } = useTranslation()
  const [gridLocale, setGridLocale] = useState<Localization | undefined>(
    undefined,
  )

  useEffect(() => {
    getMuiDataGridLocale(i18n.language).then(setGridLocale)
  }, [i18n.language])

  return (
    // While the grid's chunk loads: the grid's own frame, columns, first
    // page of rows and footer (a 400px block made autoHeight grids jump).
    <Suspense fallback={<DataGridSkeleton {...dataGridSkeletonProps(props)} />}>
      <DataGrid
        {...props}
        localeText={
          gridLocale?.components?.MuiDataGrid?.defaultProps?.localeText
        }
      />
    </Suspense>
  )
}
