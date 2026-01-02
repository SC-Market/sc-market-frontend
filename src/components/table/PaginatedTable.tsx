import React, { MouseEventHandler, useCallback, useEffect, useRef } from "react"
import {
  Box,
  Checkbox,
  Grid,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  useMediaQuery,
} from "@mui/material"
import { visuallyHidden } from "@mui/utils"
import { useTheme } from "@mui/material/styles"
import { TransparentHeaderCell } from "./TransparentHeaderCell"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useOnScreen } from "../navbar/MarketNavArea"
import { useTranslation } from "react-i18next"

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

type Order = "asc" | "desc"

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

export interface HeadCell<T> {
  disablePadding: boolean
  id: keyof T
  label: string
  numeric: boolean
  minWidth?: number
  maxWidth?: number | string
  noSort?: boolean
}

export interface EnhancedTableProps<T> {
  numSelected: number
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
  order: Order
  orderBy: string
  rowCount: number
  headCells: readonly HeadCell<T>[]
  disableSelect?: boolean
}

function EnhancedTableHead<T>(props: EnhancedTableProps<T>) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    headCells,
    disableSelect,
  } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  const createSortHandler =
    (property: keyof T) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

  return (
    <TableHead>
      <TableRow>
        {disableSelect ? null : (
          <TransparentHeaderCell padding="checkbox" scope="col">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                "aria-label": t(
                  "accessibility.selectAllRows",
                  "Select all rows",
                ),
                "aria-describedby": "select-all-help",
              }}
            />
            <div id="select-all-help" className="sr-only">
              {t(
                "accessibility.selectAllHelp",
                "Select or deselect all rows in the table",
              )}
            </div>
          </TransparentHeaderCell>
        )}

        {headCells.map((headCell) => {
          return (
            <TransparentHeaderCell
              key={headCell.id.toString()}
              align={headCell.numeric ? "right" : "left"}
              padding={headCell.disablePadding ? "none" : "normal"}
              sortDirection={orderBy === headCell.id ? order : false}
              sx={{
                minWidth: headCell.minWidth,
                maxWidth: headCell.maxWidth,
                width:
                  headCell.id === "other_name" || headCell.id === "customer"
                    ? { xs: "30%", sm: "auto" }
                    : headCell.id === "status"
                      ? { xs: "25%", sm: "auto" }
                      : headCell.id === "timestamp"
                        ? { xs: "45%", sm: "auto" }
                        : undefined,
                padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
              }}
              scope="col"
              aria-sort={
                orderBy === headCell.id
                  ? order === "desc"
                    ? "descending"
                    : "ascending"
                  : "none"
              }
            >
              {!headCell.noSort && (
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : "asc"}
                  onClick={createSortHandler(headCell.id)}
                  aria-label={
                    orderBy === headCell.id
                      ? t("accessibility.sortByColumn", "Sort by {{column}}", {
                          column: t(headCell.label),
                        })
                      : t("accessibility.sortColumn", "Sort by {{column}}", {
                          column: t(headCell.label),
                        })
                  }
                >
                  {t(headCell.label)}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === "desc"
                        ? t("sorted_descending")
                        : t("sorted_ascending")}{" "}
                    </Box>
                  ) : null}
                </TableSortLabel>
              )}
              {headCell.noSort && t(headCell.label)}
            </TransparentHeaderCell>
          )
        })}
      </TableRow>
    </TableHead>
  )
}

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
    (event: unknown, newPage: number) => {
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

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        color={"primary"}
        nextIconButtonProps={{
          color: "primary",
          "aria-label": t("accessibility.nextPage", "Go to next page"),
        }}
        backIconButtonProps={{
          color: "primary",
          "aria-label": t("accessibility.previousPage", "Go to previous page"),
        }}
        SelectProps={{
          color: "primary",
          "aria-label": t(
            "accessibility.selectRowsPerPage",
            "Select number of rows per page",
          ),
        }}
        labelRowsPerPage={t("rows_per_page")}
        labelDisplayedRows={({ from, to, count }) =>
          t("displayed_rows", {
            from: from.toLocaleString(undefined),
            to: to.toLocaleString(undefined),
            count: count,
          })
        }
        aria-label={t(
          "accessibility.tablePagination",
          "Table pagination controls",
        )}
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
  const { t } = useTranslation()

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
    (event: unknown, newPage: number) => {
      onPageChange(newPage)
      if (ref.current && !isVisible) {
        ref.current.scrollIntoView({
          block: "start",
          behavior: "smooth",
        })
      }
    },
    [ref],
  )

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onPageSizeChange(parseInt(event.target.value, 10))
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
                <TableCell colSpan={headCells.length + (disableSelect ? 0 : 1)} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rowCount}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        color={"primary"}
        nextIconButtonProps={{ color: "primary" }}
        backIconButtonProps={{ color: "primary" }}
        SelectProps={{
          color: "primary",
          "aria-label": t("select_rows_per_page"),
        }}
        labelRowsPerPage={t("rows_per_page")}
        labelDisplayedRows={({ from, to, count }) => (
          <>
            {t("displayed_rows", {
              from,
              to,
              count: count,
            })}
          </>
        )}
      />
    </Grid>
  )
}
