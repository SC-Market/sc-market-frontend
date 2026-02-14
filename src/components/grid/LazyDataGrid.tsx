import { lazy, Suspense, useEffect, useState } from "react"
import { Skeleton } from "@mui/material"
import type { DataGridProps } from "@mui/x-data-grid"
import { getMuiDataGridLocale } from "../../util/i18n"
import { useTranslation } from "react-i18next"

const DataGrid = lazy(() =>
  import("@mui/x-data-grid").then((m) => ({ default: m.DataGrid }))
)

export function LazyDataGrid(props: DataGridProps) {
  const { i18n } = useTranslation()
  const [gridLocale, setGridLocale] = useState<any>(undefined)

  useEffect(() => {
    getMuiDataGridLocale(i18n.language).then(setGridLocale)
  }, [i18n.language])

  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
      <DataGrid {...props} localeText={gridLocale?.components?.MuiDataGrid?.defaultProps?.localeText} />
    </Suspense>
  )
}
