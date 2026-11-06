import React, { MouseEventHandler, useCallback, useEffect, useRef } from "react"
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableRow,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useOnScreen } from "../../hooks/useOnScreen"
import { useTranslation } from "react-i18next"

import { NumberedPagination } from "../pagination/NumberedPagination"
import {
  EnhancedTableHead,
  getComparator,
  type HeadCell,
  type Order,
} from "./EnhancedTableHead"
export type { HeadCell, EnhancedTableProps } from "./EnhancedTableHead"

export function PaginatedTable<T>(props: {
  rows: T[]
  initialSort: keyof T
  keyAttr: keyof T
  headCells: readonly HeadCell<T>[]
  disableSelect?: boolean
  initialSortDirection?: Order
  generateRow: (props: {
    row: T
    index: number
    onClick?: MouseEventHandler
    isItemSelected: boolean
    labelId: string
    hasSelectedItems?: boolean
  }) => React.ReactNode
}) {
  const {
    rows,
    keyAttr,
    initialSort,
    headCells,
    generateRow: RowComponent,
    disableSelect,
  } = props
  const [order, setOrder] = React.useState<Order>(
    props.initialSortDirection || "asc",
  )
  const [orderBy, setOrderBy] = React.useState<keyof T>(initialSort)
  const [selected, setSelected] = React.useState<readonly T[keyof T][]>([])
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof T,
  ) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n[keyAttr])
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  useEffect(() => {
    setPage(0)
  }, [rows])

  const handleClick = (event: React.MouseEvent<unknown>, name: T[keyof T]) => {
    const selectedIndex = selected.indexOf(name)
    let newSelected: readonly T[keyof T][] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }

    setSelected(newSelected)
  }

  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useOnScreen(ref)
  const handleChangePage = useCallback(
    (newPage: number) => {
      setPage(newPage)
      if (ref.current && !isVisible) {
        ref.current.scrollIntoView({
          block: "start",
          behavior: "smooth",
        })
      }
    },
    [ref, isVisible],
  )

  const handleChangeRowsPerPage = (rowsPerPage: number) => {
    setRowsPerPage(rowsPerPage)
    setPage(0)
  }

  const isSelected = (name: T[keyof T]) => selected.indexOf(name) !== -1

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0

  return (
    <Grid item xs={12}>
      <Box position={"relative"}>
        <Box ref={ref} sx={{ position: "absolute", top: -150 }} />
      </Box>
      <TableContainer sx={{ width: "100%" }}>
        <div id="table-description" className="sr-only">
          {t(
            "accessibility.dataTableDescription",
            "Data table with {{count}} rows",
            { count: rows.length },
          )}
        </div>
        <Table
          sx={{
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
            [`& .${tableCellClasses.root}`]: {
              borderColor: theme.palette.outline.main,
            },
          }}
          aria-labelledby="tableTitle"
          aria-describedby="table-description"
          size={"medium"}
          stickyHeader
          role="table"
        >
          <EnhancedTableHead
            numSelected={selected.length}
            order={order}
            orderBy={orderBy as string}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
            headCells={headCells}
            disableSelect={disableSelect}
          />
          <TableBody>
            {rows
              .slice()
              .sort(getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const isItemSelected = isSelected(row[keyAttr])
                const labelId = `enhanced-table-checkbox-${index}`
                const hasSelectedItems = selected.length > 0

                return (
                  <RowComponent
                    key={row[keyAttr] as string | number}
                    {...{
                      row: row,
                      index: index,
                      onClick: (event) => {
                        handleClick(event, row[keyAttr])
                      },
                      isItemSelected: isItemSelected,
                      labelId: labelId,
                      hasSelectedItems: hasSelectedItems,
                    }}
                  />
                )
              })}
            {emptyRows > 0 && (
              <TableRow
                style={{
                  height: 73 * emptyRows,
                }}
              >
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <NumberedPagination
        count={rows.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Grid>
  )
}

export function ControlledTable<T>(props: {
  rows: T[]
  initialSort: keyof T
  keyAttr: keyof T
  headCells: readonly HeadCell<T>[]
  disableSelect?: boolean
  selected?: readonly T[keyof T][]
  onSelectChange?: (selected: readonly T[keyof T][]) => void
  generateRow: (props: {
    row: T
    index: number
    onClick?: MouseEventHandler
    isItemSelected: boolean
    labelId: string
  }) => React.ReactNode
  onPageChange: (page: number) => void
  page: number
  onPageSizeChange: (page: number) => void
  pageSize: number
  onOrderByChange: (sort: string) => void
  orderBy: string
  onOrderChange: (order: Order) => void
  order: Order
  rowCount: number
  loading?: boolean
  loadingRowComponent?: React.ComponentType<{ index: number }>
  emptyStateComponent?: React.ReactNode
}) {
  const {
    rows,
    keyAttr,
    headCells,
    generateRow: RowComponent,
    disableSelect,
    selected: controlledSelected,
    onSelectChange,
    onPageChange,
    page,
    onPageSizeChange,
    pageSize,
    onOrderChange,
    order,
    onOrderByChange,
    orderBy,
    rowCount,
    loading = false,
    loadingRowComponent: LoadingRowComponent,
    emptyStateComponent,
  } = props

  const [internalSelected, setInternalSelected] = React.useState<
    readonly T[keyof T][]
  >([])
  const selected = controlledSelected ?? internalSelected
  const setSelected = onSelectChange ?? setInternalSelected
  const theme = useTheme<ExtendedTheme>()

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof T,
  ) => {
    const isAsc = orderBy === property && order === "asc"
    onOrderChange(isAsc ? "desc" : "asc")
    onOrderByChange(property.toString())
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n[keyAttr])
      setSelected(newSelecteds)
      return
    }
    setSelected([])
  }

  const handleClick = (event: React.MouseEvent<unknown>, name: T[keyof T]) => {
    const selectedIndex = selected.indexOf(name)
    let newSelected: readonly T[keyof T][] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }

    setSelected(newSelected)
  }

  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useOnScreen(ref)
  const handleChangePage = useCallback(
    (newPage: number) => {
      onPageChange(newPage)
      if (ref.current && !isVisible) {
        ref.current.scrollIntoView({
          block: "start",
          behavior: "smooth",
        })
      }
    },
    [isVisible, onPageChange],
  )

  const handleChangeRowsPerPage = (rowsPerPage: number) => {
    onPageSizeChange(rowsPerPage)
    onPageChange(0)
  }

  const isSelected = (name: T[keyof T]) => selected.indexOf(name) !== -1

  const emptyRows = pageSize - rows.length

  return (
    <Grid item xs={12}>
      <Box position={"relative"}>
        <Box ref={ref} sx={{ position: "absolute", top: -150 }} />
      </Box>
      <TableContainer sx={{ width: "100%" }}>
        <Table
          sx={{
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
            [`& .${tableCellClasses.root}`]: {
              borderColor: theme.palette.outline.main,
            },
          }}
          aria-labelledby="tableTitle"
          size={"medium"}
          stickyHeader
        >
          <EnhancedTableHead
            numSelected={selected.length}
            order={order}
            orderBy={orderBy as string}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
            headCells={headCells}
            disableSelect={disableSelect}
          />
          <TableBody>
            {loading && LoadingRowComponent ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <LoadingRowComponent key={`skeleton-${index}`} index={index} />
              ))
            ) : rows.length === 0 && !loading && emptyStateComponent ? (
              <TableRow>
                <TableCell
                  colSpan={headCells.length + (disableSelect ? 0 : 1)}
                  sx={{ border: 0, padding: 0 }}
                >
                  {emptyStateComponent}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => {
                const isItemSelected = isSelected(row[keyAttr])
                const labelId = `enhanced-table-checkbox-${index}`
                const hasSelectedItems = selected.length > 0

                return (
                  <RowComponent
                    key={row[keyAttr] as string | number}
                    {...{
                      row: row,
                      index: index,
                      onClick: (event) => {
                        handleClick(event, row[keyAttr])
                      },
                      isItemSelected: isItemSelected,
                      labelId: labelId,
                      hasSelectedItems: hasSelectedItems,
                    }}
                  />
                )
              })
            )}
            {!loading && emptyRows > 0 && rows.length > 0 && (
              <TableRow
                style={{
                  height: 73 * emptyRows,
                }}
              >
                <TableCell
                  colSpan={headCells.length + (disableSelect ? 0 : 1)}
                />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <NumberedPagination
        count={rowCount}
        page={page}
        rowsPerPage={pageSize}
        onPageChange={handleChangePage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Grid>
  )
}
