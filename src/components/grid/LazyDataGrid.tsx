import { Suspense, useEffect, useState } from "react"
import { Skeleton } from "@mui/material"
import type { DataGridProps } from "@mui/x-data-grid"
import type { enUS } from "@mui/x-data-grid/locales"
import { getMuiDataGridLocale } from "../../util/i18n"
import { useTranslation } from "react-i18next"
import { lazyWithRetry } from "../../util/lazyWithRetry"

/** A DataGrid locale (the package doesn't export the type from a public path). */
type Localization = typeof enUS

const DataGrid = lazyWithRetry(() =>
  import("@mui/x-data-grid").then((m) => ({ default: m.DataGrid })),
)

const PAGINATION_SELECT_MENU_PROPS = {
  disablePortal: false,
  anchorOrigin: { vertical: "bottom" as const, horizontal: "left" as const },
  transformOrigin: { vertical: "top" as const, horizontal: "left" as const },
}

export function LazyDataGrid(props: DataGridProps) {
  const { i18n } = useTranslation()
  const [gridLocale, setGridLocale] = useState<Localization | undefined>(
    undefined,
  )

  useEffect(() => {
    getMuiDataGridLocale(i18n.language).then(setGridLocale)
  }, [i18n.language])

  const existing = props.slotProps?.basePagination as
    | { SelectProps?: { MenuProps?: Record<string, unknown> } }
    | undefined
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
