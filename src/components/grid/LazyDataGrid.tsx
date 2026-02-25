import { lazy, Suspense, useEffect, useState } from "react"
import { Skeleton } from "@mui/material"
import type { DataGridProps } from "@mui/x-data-grid"
import { getMuiDataGridLocale } from "../../util/i18n"
import { useTranslation } from "react-i18next"

const DataGrid = lazy(() =>
  import("@mui/x-data-grid").then((m) => ({ default: m.DataGrid })),
)

const PAGINATION_SELECT_MENU_PROPS = {
  disablePortal: false,
  anchorOrigin: { vertical: "bottom" as const, horizontal: "left" as const },
  transformOrigin: { vertical: "top" as const, horizontal: "left" as const },
}

export function LazyDataGrid(props: DataGridProps) {
  const { i18n } = useTranslation()
  const [gridLocale, setGridLocale] = useState<any>(undefined)

  useEffect(() => {
    getMuiDataGridLocale(i18n.language).then(setGridLocale)
  }, [i18n.language])

  const existing = props.slotProps?.basePagination as { SelectProps?: { MenuProps?: Record<string, unknown> } } | undefined
  const slotProps = {
    ...props.slotProps,
    basePagination: {
      ...existing,
      SelectProps: {
        MenuProps: {
          ...PAGINATION_SELECT_MENU_PROPS,
          ...existing?.SelectProps?.MenuProps,
        },
        ...existing?.SelectProps,
      },
    },
  } as DataGridProps["slotProps"]

  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
      <DataGrid
        {...props}
        slotProps={slotProps}
        localeText={
          gridLocale?.components?.MuiDataGrid?.defaultProps?.localeText
        }
      />
    </Suspense>
  )
}
