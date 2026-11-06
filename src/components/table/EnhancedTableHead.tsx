import React from "react"
import {
  Box,
  Checkbox,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material"
import { visuallyHidden } from "@mui/utils"
import { useTheme } from "@mui/material/styles"
import { TransparentHeaderCell } from "./TransparentHeaderCell"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"

export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

export type Order = "asc" | "desc"

export function getComparator<T>(
  order: Order,
  orderBy: keyof T,
): (a: T, b: T) => number {
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

export function EnhancedTableHead<T>(props: EnhancedTableProps<T>) {
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
          <TransparentHeaderCell
            padding="checkbox"
            scope="col"
            sx={{ display: { xs: "none", sm: "table-cell" } }}
          >
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
