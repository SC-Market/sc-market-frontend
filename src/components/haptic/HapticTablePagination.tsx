import { TablePagination, TablePaginationProps } from "@mui/material"
import { haptic } from "../../util/haptics"

export function HapticTablePagination(props: TablePaginationProps) {
  const { onPageChange, onRowsPerPageChange, ...rest } = props

  const handlePageChange = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) => {
    haptic.selection()
    onPageChange(event, page)
  }

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    haptic.selection()
    onRowsPerPageChange?.(event)
  }

  return (
    <TablePagination
      {...rest}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
    />
  )
}
