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

  const existingBasePagination = props.slotProps?.basePagination as Record<string, unknown> | undefined
  const existingSelectProps =
    existingBasePagination && typeof existingBasePagination.SelectProps === "object"
      ? (existingBasePagination.SelectProps as Record<string, unknown>)
      : {}
  const existingMenuProps =
    existingSelectProps && typeof existingSelectProps.MenuProps === "object"
      ? (existingSelectProps.MenuProps as Record<string, unknown>)
      : {}
  const slotProps: DataGridProps["slotProps"] = {
    ...props.slotProps,
    basePagination: {
      ...(existingBasePagination ?? {}),
      SelectProps: {
        MenuProps: {
          ...PAGINATION_SELECT_MENU_PROPS,
          ...existingMenuProps,
        },
        ...existingSelectProps,
      },
    } as DataGridProps["slotProps"] extends { basePagination?: infer P } ? P : never,
  }

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
