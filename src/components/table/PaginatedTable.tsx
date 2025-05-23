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
} from "@mui/material"
import { visuallyHidden } from "@mui/utils"
import { useTheme } from "@mui/material/styles"
import { TransparentHeaderCell } from "./TransparentHeaderCell"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useOnScreen } from "../navbar/MarketNavArea"

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
  const createSortHandler =
    (property: keyof T) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

  return (
    <TableHead>
      <TableRow>
        {disableSelect ? null : (
          <TransparentHeaderCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                "aria-label": "select all desserts",
              }}
            />
          </TransparentHeaderCell>
        )}

        {headCells.map((headCell) => (
          <TransparentHeaderCell
            key={headCell.id.toString()}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              minWidth: headCell.minWidth,
              maxWidth: headCell.maxWidth,
            }}
          >
            {!headCell.noSort && (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            )}
          </TransparentHeaderCell>
        ))}
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
    [ref],
  )

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const isSelected = (name: T[keyof T]) => selected.indexOf(name) !== -1

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0

  return (
    <Grid item xs={12}>
      <Box position={"relative"}>
        <Box ref={ref} sx={{ position: "absolute", top: -150 }} />
      </Box>
      <TableContainer sx={{ width: "100%" }}>
        <Table
          sx={{
            borderRadius: 2,
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
            {/* if you don't need to support IE11, you can replace the `stableSort` call with:
              rows.slice().sort(getComparator(order, orderBy)) */}
            {rows
              .slice()
              .sort(getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const isItemSelected = isSelected(row[keyAttr])
                const labelId = `enhanced-table-checkbox-${index}`

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
        nextIconButtonProps={{ color: "primary" }}
        backIconButtonProps={{ color: "primary" }}
        SelectProps={{
          color: "primary",
        }}
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
}) {
  const {
    rows,
    keyAttr,
    headCells,
    generateRow: RowComponent,
    disableSelect,
    onPageChange,
    page,
    onPageSizeChange,
    pageSize,
    onOrderChange,
    order,
    onOrderByChange,
    orderBy,
    rowCount,
  } = props

  const [selected, setSelected] = React.useState<readonly T[keyof T][]>([])
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

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = pageSize - rows.length

  return (
    <Grid item xs={12}>
      <Box position={"relative"}>
        <Box ref={ref} sx={{ position: "absolute", top: -150 }} />
      </Box>
      <TableContainer sx={{ width: "100%" }}>
        <Table
          sx={{
            borderRadius: 2,
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
            {/* if you don't need to support IE11, you can replace the `stableSort` call with:
              rows.slice().sort(getComparator(order, orderBy)) */}
            {rows.map((row, index) => {
              const isItemSelected = isSelected(row[keyAttr])
              const labelId = `enhanced-table-checkbox-${index}`

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
        }}
      />
    </Grid>
  )
}
