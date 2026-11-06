import React from "react"
import {
  GridPagination,
  gridPaginationModelSelector,
  gridPaginationRowCountSelector,
  useGridApiContext,
  useGridRootProps,
  useGridSelector,
} from "@mui/x-data-grid"
import { NumberedPagination } from "../pagination/NumberedPagination"

/**
 * The DataGrid footer's `pagination` slot: the app's numbered pagination
 * with the grid's `pageSizeOptions` as the "Per page" choices. A server
 * grid with an unknown row count (-1) keeps MUI's prev/next pagination.
 */
export function GridNumberedPagination() {
  const apiRef = useGridApiContext()
  const rootProps = useGridRootProps()
  const { page, pageSize } = useGridSelector(
    apiRef,
    gridPaginationModelSelector,
  )
  const rowCount = useGridSelector(apiRef, gridPaginationRowCountSelector)

  if (rowCount < 0) return <GridPagination />

  const options = rootProps.pageSizeOptions.map((option) =>
    typeof option === "number" ? option : option.value,
  )

  return (
    <NumberedPagination
      count={rowCount}
      page={page}
      rowsPerPage={pageSize}
      onPageChange={(newPage) => apiRef.current.setPage(newPage)}
      rowsPerPageOptions={options.includes(pageSize) ? options : undefined}
      onRowsPerPageChange={(size) =>
        apiRef.current.setPaginationModel({ page: 0, pageSize: size })
      }
      sx={{ py: 0.5, flex: 1 }}
    />
  )
}
