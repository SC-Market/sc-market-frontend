import {
  GridActionsCellItem,
  GridColDef,
  GridEventListener,
  GridRenderCellParams,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridRowParams,
  GridRowSelectionModel,
  GridRowsProp,
  GridValidRowModel,
  Toolbar,
} from "@mui/x-data-grid"
import React, { useCallback, useEffect } from "react"
import { Stack } from "@mui/system"
import { MinimalUser } from "../../datatypes/User"
import { useGetUserProfileQuery } from "../../store/profile"
import { UserProfileState } from "../../hooks/login/UserProfile"
import { UserAvatar } from "../../components/avatar/UserAvatar"
import { ThemedDataGrid } from "../../components/grid/ThemedDataGrid"
import { SelectMarketListing } from "../../components/select/SelectMarketListing.tsx"
import { UniqueListing } from "../../features/market/index"
import { NumericFormat } from "react-number-format"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next" // Added for localization

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/Menu';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import Stack1 from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import useMediaQuery from '@mui/material/useMediaQuery';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Fab from '@mui/material/Fab';
import DialogContentText from '@mui/material/DialogContentText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import ButtonBase from '@mui/material/ButtonBase';
import useTheme1 from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';
import ReplyRounded from '@mui/icons-material/ReplyRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CopyAllRounded from '@mui/icons-material/CopyAllRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import ShoppingCartRounded from '@mui/icons-material/ShoppingCartRounded';
import ElectricBoltRounded from '@mui/icons-material/ElectricBoltRounded';
import ArchiveRounded from '@mui/icons-material/ArchiveRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';
import AddShoppingCartRounded from '@mui/icons-material/AddShoppingCartRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import CancelRounded from '@mui/icons-material/CancelRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';

interface StockEntry extends GridValidRowModel {
  id: string
  listing: UniqueListing | null
  quantity_available: number
  location: string
  status: string
  owner: MinimalUser | UserProfileState
  isNew: boolean
  listed: boolean
}

export function StockEntryItemDisplay(props: {
  listing: UniqueListing | null
}) {
  const { t } = useTranslation()
  if (!props.listing || !props.listing.details) {
    return t("ItemStockRework.noItemSelected")
  }
  return `${props.listing.details.item_type} / ${props.listing.details.title}`
}

export function ManageStockArea(props: {
  selectedRows: StockEntry[]
  onUpdateQuantity: (rowId: string, newQuantity: number) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [quantity, setQuantity] = React.useState(1)
  const { selectedRows, onUpdateQuantity } = props

  const updateSelectedRows = useCallback(
    (operation: (currentQty: number) => number) => {
      selectedRows.forEach((row) => {
        const currentQuantity = row.quantity_available
        const newQuantity = operation(currentQuantity)
        onUpdateQuantity(row.id, Math.max(0, newQuantity))
      })
    },
    [selectedRows, onUpdateQuantity],
  )

  return (
    <Stack
      direction="row"
      spacing={theme.layoutSpacing.layout}
      alignItems="center"
    >
      <NumericFormat
        decimalScale={0}
        allowNegative={false}
        customInput={TextField}
        thousandSeparator
        onValueChange={async (values) => {
          setQuantity(values.floatValue || 0)
        }}
        inputProps={{
          inputMode: "numeric",
          pattern: "[0-9]*",
          type: "numeric",
          size: "small",
          "aria-label": t(
            "accessibility.updateAmountInput",
            "Enter amount to update stock",
          ),
          "aria-describedby": "update-amount-help",
        }}
        sx={{
          minWidth: 200,
        }}
        size="small"
        label={t("ItemStockRework.updateAmount")}
        value={quantity}
        color={"secondary"}
        id="update-amount"
      />
      <div id="update-amount-help" className="sr-only">
        {t(
          "accessibility.updateAmountHelp",
          "Enter the amount to add, subtract, or set for selected stock items",
        )}
      </div>

      <ButtonGroup size={"small"}>
        <Button
          variant={"contained"}
          onClick={() =>
            updateSelectedRows((currentQty) => currentQty + quantity)
          }
          color={"success"}
          startIcon={<AddRounded />}
          aria-label={t("accessibility.addToStock", "Add to stock")}
          aria-describedby="add-stock-help"
        >
          {t("ItemStockRework.add")}
          <span id="add-stock-help" className="sr-only">
            {t(
              "accessibility.addToStockHelp",
              "Add the specified amount to selected stock items",
            )}
          </span>
        </Button>

        <Button
          variant={"contained"}
          onClick={() => updateSelectedRows(() => 0)}
          color={"warning"}
          aria-label={t("accessibility.zeroStock", "Set stock to zero")}
          aria-describedby="zero-stock-help"
        >
          {t("ItemStockRework.zero")}
          <span id="zero-stock-help" className="sr-only">
            {t(
              "accessibility.zeroStockHelp",
              "Set the quantity of selected stock items to zero",
            )}
          </span>
        </Button>
        <Button
          variant={"contained"}
          onClick={() =>
            updateSelectedRows((currentQty) => currentQty - quantity)
          }
          color={"error"}
          startIcon={<RemoveRounded />}
          aria-label={t(
            "accessibility.subtractFromStock",
            "Subtract from stock",
          )}
          aria-describedby="subtract-stock-help"
        >
          {t("ItemStockRework.sub")}
          <span id="subtract-stock-help" className="sr-only">
            {t(
              "accessibility.subtractFromStockHelp",
              "Subtract the specified amount from selected stock items",
            )}
          </span>
        </Button>
      </ButtonGroup>
    </Stack>
  )
}

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void
  }
}

export function ItemStockRework() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { data: profile } = useGetUserProfileQuery()
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>({ type: "include", ids: new Set() })
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {},
  )
  const [rows, setRows] = React.useState<StockEntry[]>([])

  // Temporary state for editing - changes are only applied on save
  const [editingRows, setEditingRows] = React.useState<
    Record<string, Partial<StockEntry>>
  >({})

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleEditClick = (id: GridRowId) => () => {
    // Initialize editing state with current row data
    const currentRow = rows.find((row) => row.id === id)
    if (currentRow) {
      setEditingRows((prev) => ({
        ...prev,
        [id]: { ...currentRow },
      }))
    }
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })
  }

  const handleSaveClick = (id: GridRowId) => () => {
    // Apply the editing changes to the actual rows
    const editingRow = editingRows[id]
    console.log("Saving row:", id, "Editing data:", editingRow)

    if (editingRow) {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, ...editingRow, isNew: false } : row,
        ),
      )
      // Clear the editing state for this row
      setEditingRows((prev) => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
    }
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })
  }

  const handleToggleEnable = (id: GridRowId) => () => {
    setRows(
      rows.map((entry) =>
        entry.id === id ? { ...entry, listed: !entry.listed } : entry,
      ),
    )
  }

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.id !== id))
    // Clear editing state if this row was being edited
    setEditingRows((prev) => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
  }

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    })

    const editedRow = rows.find((row) => row.id === id)
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id))
    }

    // Clear the editing state for this row
    setEditingRows((prev) => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
  }

  const processRowUpdate = (newRow: StockEntry) => {
    const updatedRow = { ...newRow, isNew: false }
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)))
    return updatedRow
  }

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel)
  }

  const handleUpdateQuantity = useCallback(
    (rowId: string, newQuantity: number) => {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === rowId ? { ...row, quantity_available: newQuantity } : row,
        ),
      )

      // Also update editing state if this row is being edited
      setEditingRows((prev) => {
        if (prev[rowId]) {
          return {
            ...prev,
            [rowId]: { ...prev[rowId], quantity_available: newQuantity },
          }
        }
        return prev
      })
    },
    [],
  )

  const selectedRows = React.useMemo(() => {
    return rows.filter((row) => rowSelectionModel.ids.has(row.id))
  }, [rows, rowSelectionModel.ids])

  const columns: GridColDef[] = [
    {
      sortable: true,
      field: "owner",
      display: "flex",
      headerName: t("ItemStockRework.owner"),
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <UserAvatar user={params.value} />
      ),
    },
    {
      sortable: true,
      field: "listing",
      width: 450,
      display: "flex",
      headerName: t("ItemStockRework.item"),
      renderCell: (params: GridRenderCellParams) => {
        const isInEditMode =
          rowModesModel[params.id]?.mode === GridRowModes.Edit

        if (isInEditMode) {
          // Use editing state for the current value
          const editingRow = editingRows[params.id]
          const currentListing = editingRow?.listing || params.value?.listing

          return (
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"center"}
              spacing={theme.layoutSpacing.compact}
              sx={{
                flexGrow: "1",
                "& > *": {
                  flexGrow: "1",
                },
              }}
            >
              <SelectMarketListing
                listing_id={currentListing?.listing?.listing_id || null}
                onListingChange={(newListing) => {
                  // Update editing state instead of immediately updating rows
                  // setEditingRows((prev) => ({
                  //   ...prev,
                  //   [params.id]: { ...prev[params.id], listing: newListing },
                  // }))
                }}
                TextfieldProps={{
                  size: "small",
                }}
              />
            </Stack>
          )
        } else {
          return <StockEntryItemDisplay listing={params.value} />
        }
      },
    },
    {
      field: "quantity_available",
      headerName: t("ItemStockRework.quantity"),
      display: "flex",
      valueFormatter: (value: number) => value.toLocaleString(undefined),
      renderCell: (params: GridRenderCellParams) => {
        const isInEditMode =
          rowModesModel[params.id]?.mode === GridRowModes.Edit

        if (isInEditMode) {
          const editingRow = editingRows[params.id]
          const currentQuantity = editingRow?.quantity_available ?? params.value

          return (
            <React.Fragment>
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                onValueChange={async (values) => {
                  // Update editing state instead of immediately updating rows
                  setEditingRows((prev) => {
                    const newState = {
                      ...prev,
                      [params.id]: {
                        ...prev[params.id],
                        quantity_available: +values.floatValue! || 1,
                      },
                    }
                    console.log(
                      "Quantity editing state updated:",
                      params.id,
                      newState[params.id],
                    )
                    return newState
                  })
                }}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  "aria-label": t(
                    "accessibility.editQuantityInput",
                    "Edit quantity available",
                  ),
                  "aria-describedby": "edit-quantity-help",
                }}
                InputProps={{
                  inputMode: "numeric",
                }}
                size="small"
                label={t("ItemStockRework.qty")}
                value={currentQuantity}
                color={"secondary"}
                id={`quantity-edit-${params.id}`}
              />
              <div id="edit-quantity-help" className="sr-only">
                {t(
                  "accessibility.editQuantityHelp",
                  "Edit the quantity available for this stock item",
                )}
              </div>
            </React.Fragment>
          )
        } else {
          // Show formatted value when not editing
          return params.value.toLocaleString(undefined)
        }
      },
    },
    {
      sortable: true,
      field: "location",
      width: 150,
      display: "flex",
      headerName: t("ItemStockRework.location"),
      renderCell: (params: GridRenderCellParams) => {
        const isInEditMode =
          rowModesModel[params.id]?.mode === GridRowModes.Edit

        if (isInEditMode) {
          const editingRow = editingRows[params.id]
          const currentLocation = editingRow?.location ?? params.value

          return (
            <Autocomplete
              fullWidth
              size={"small"}
              freeSolo
              disableClearable
              value={currentLocation}
              options={rows.map((option) => option.location).filter((x) => x)}
              onChange={(event, newValue) => {
                // Update editing state instead of immediately updating rows
                setEditingRows((prev) => {
                  const newState = {
                    ...prev,
                    [params.id]: {
                      ...prev[params.id],
                      location: newValue || "",
                    },
                  }
                  console.log(
                    "Location editing state updated:",
                    params.id,
                    newState[params.id],
                  )
                  return newState
                })
              }}
              onInputChange={(event, newInputValue) => {
                // Also update on input change to capture typing immediately
                setEditingRows((prev) => {
                  const newState = {
                    ...prev,
                    [params.id]: {
                      ...prev[params.id],
                      location: newInputValue || "",
                    },
                  }
                  console.log(
                    "Location input updated:",
                    params.id,
                    newState[params.id],
                  )
                  return newState
                })
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("ItemStockRework.location")}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      type: "search",
                    },
                  }}
                />
              )}
            />
          )
        } else {
          return params.value
        }
      },
    },
    {
      sortable: false,
      field: "actions",
      type: "actions",
      headerName: t("ItemStockRework.actions"),
      cellClassName: "actions",
      width: 75,
      getActions: ({ id, row }: GridRowParams<StockEntry>) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit

        if (isInEditMode) {
          // Check if the listing is null to disable save button
          const editingRow = editingRows[id]
          const hasValidListing = editingRow?.listing

          return [
            <GridActionsCellItem
              icon={<SaveRounded style={{ color: "primary.main" }} />}
              label={t("ItemStockRework.save")}
              key={"save"}
              onClick={handleSaveClick(id)}
              disabled={!hasValidListing}
            />,
            <GridActionsCellItem
              icon={<CancelRounded />}
              key={"cancel"}
              label={t("ItemStockRework.cancel")}
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ]
        }

        return [
          <GridActionsCellItem
            icon={<CreateRounded />}
            label={t("ItemStockRework.edit")}
            key={"edit"}
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteRounded />}
            label={t("ItemStockRework.delete")}
            key={"delete"}
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ]
      },
    },
    {
      sortable: true,
      field: "listed",
      display: "flex",
      headerName: t("ItemStockRework.listed"),
      width: 75,
      renderCell: ({ id, value }) => {
        return (
          <Tooltip title={t("ItemStockRework.toggleListed")}>
            <Switch checked={value} onClick={handleToggleEnable(id)} />
          </Tooltip>
        )
      },
    },
  ]

  useEffect(() => {
    console.log(rows)
  }, [rows])

  return (
    <ThemedDataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      disableRowSelectionOnClick
      checkboxSelection
      onRowSelectionModelChange={setRowSelectionModel}
      rowSelectionModel={rowSelectionModel}
      processRowUpdate={
        processRowUpdate as unknown as (
          newRow: GridValidRowModel,
        ) => GridValidRowModel
      }
      initialState={{
        sorting: {
          sortModel: [{ field: "listing", sort: "asc" }],
        },
      }}
      showToolbar
      slots={{
        toolbar: () => {
          return (
            <Toolbar>
              <ManageStockArea
                selectedRows={selectedRows}
                onUpdateQuantity={handleUpdateQuantity}
              />
              <Tooltip title={t("ItemStockRework.addRow")}>
                <IconButton
                  onClick={() => {
                    const id = rows.length.toString()
                    const newRow = {
                      id,
                      listing: null,
                      quantity_available: 0,
                      location: "",
                      status: "",
                      owner: profile!,
                      isNew: true,
                      listed: true,
                    }

                    setRows((prev) => [...prev, newRow])

                    // Initialize editing state for the new row
                    setEditingRows((prev) => ({
                      ...prev,
                      [id]: { ...newRow },
                    }))

                    setRowModesModel((oldModel) => ({
                      ...oldModel,
                      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
                    }))
                  }}
                >
                  <AddRounded />
                </IconButton>
              </Tooltip>
            </Toolbar>
          )
        },
      }}
    />
  )
}
