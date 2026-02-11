import React, { MouseEventHandler, ReactElement } from "react"
import { visuallyHidden } from "@mui/utils"
import { useTheme, createTheme, ThemeProvider } from "@mui/material/styles";
import { TransparentHeaderCell } from "./TransparentHeaderCell"
import { SxProps } from "@mui/system"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { HeadCell } from "./PaginatedTable"
import { useTranslation } from "react-i18next"

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme1 from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import { SkeletonProps } from '@mui/material/Skeleton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import CardActionArea from '@mui/material/CardActionArea';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Fade from '@mui/material/Fade';
import CardMedia from '@mui/material/CardMedia';
import ListItemButton from '@mui/material/ListItemButton';
import AvatarGroup from '@mui/material/AvatarGroup';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import TableHead from '@mui/material/TableHead';
import { Theme } from '@mui/material/styles';
import TableSortLabel from '@mui/material/TableSortLabel';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import CableRounded from '@mui/icons-material/CableRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import CloudDownloadRounded from '@mui/icons-material/CloudDownloadRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import ManageAccountsRounded from '@mui/icons-material/ManageAccountsRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import RequestQuoteRounded from '@mui/icons-material/RequestQuoteRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';

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
                "aria-label": t("select_all_items"),
              }}
            />
          </TransparentHeaderCell>
        )}

        {headCells.map((headCell, hcindex) => (
          <TransparentHeaderCell
            key={headCell.id.toString()}
            align={hcindex === headCells.length - 1 ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              minWidth: headCell.minWidth,
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
                      ? t("sorted_descending")
                      : t("sorted_ascending")}
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

export function ScrollableTable<T>(props: {
  rows: T[]
  initialSort: keyof T
  initialDirection?: Order
  keyAttr: keyof T
  headCells: readonly HeadCell<T>[]
  disableSelect?: boolean
  sx?: SxProps<Theme>
  generateRow: (props: {
    row: T
    index: number
    onClick?: MouseEventHandler
    isItemSelected: boolean
    labelId: string
  }) => ReactElement
}) {
  const { rows, keyAttr, initialSort, headCells, disableSelect } = props
  const RowComponent = props.generateRow
  const [order, setOrder] = React.useState<Order>(
    props.initialDirection || "asc",
  )
  const [orderBy, setOrderBy] = React.useState<keyof T>(initialSort)
  const [selected, setSelected] = React.useState<readonly T[keyof T][]>([])
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

  const isSelected = (name: T[keyof T]) => selected.indexOf(name) !== -1

  return (
    <Grid item xs={12}>
      <TableContainer sx={{ width: "100%", overflow: "scroll", ...props.sx }}>
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
            {/* if you don't need to support IE11, you can replace the `stableSort` call with:
              rows.slice().sort(getComparator(order, orderBy)) */}
            {rows
              .slice()
              .sort(getComparator(order, orderBy))
              .map((row, index) => {
                const isItemSelected = isSelected(row[keyAttr])
                const labelId = `enhanced-table-checkbox-${index}`

                return (
                  <RowComponent
                    key={String(row[keyAttr])}
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
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  )
}
